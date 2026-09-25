//! The streaming chat turn: runs `claude -p` and forwards its output to the frontend.

use super::{cli, failure::failure_message, parser::StreamParser};
use crate::events::{emit, ChatEvent};
use crate::requests::Requests;
use tauri::{AppHandle, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Child;
use tokio_util::sync::CancellationToken;

/// Runs one chat turn through the Claude CLI, streaming `chat-event`s until it finishes.
///
/// # Arguments
/// * `app` - the Tauri app handle, used to emit events.
/// * `requests` - the registry that makes the turn cancellable.
/// * `request_id` - frontend-generated id that tags every emitted event.
/// * `prompt` - the user's message (plain text or a slash command).
/// * `model` - the Claude model id.
/// * `effort` - optional effort level.
/// * `resume` - optional Claude session id to continue.
/// * `claude_path` - optional explicit path to the CLI.
/// * `cwd` - working directory for the CLI (created if missing).
///
/// # Errors
/// Returns an error if the CLI can't be started. Failures after that arrive as `Error` events.
#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn claude_send(
    app: AppHandle,
    requests: State<'_, Requests>,
    request_id: String,
    prompt: String,
    model: String,
    effort: Option<String>,
    resume: Option<String>,
    claude_path: Option<String>,
    cwd: String,
) -> Result<(), String> {
    std::fs::create_dir_all(&cwd).map_err(|e| format!("Cannot use folder {cwd}: {e}"))?;
    let mut cmd = cli::command(claude_path.as_deref())?;
    cmd.current_dir(&cwd)
        .args(cli::chat_args(&model, effort.as_deref(), resume.as_deref()));
    let mut child = cli::spawn_with_input(cmd, &prompt).await?;

    let token = requests.register(&request_id);
    let result = stream_output(&app, &request_id, &mut child, &token).await;
    requests.finish(&request_id);
    if token.is_cancelled() {
        let _ = child.kill().await;
        return Ok(());
    }
    let final_event = match result {
        Some(done) => done,
        None => ChatEvent::Error { message: failure_message(&mut child).await },
    };
    emit(&app, &request_id, final_event);
    Ok(())
}

/// Forwards parsed stdout events until the process exits or the turn is cancelled.
///
/// Returns the final `Done` event, if the CLI reported one.
async fn stream_output(
    app: &AppHandle,
    request_id: &str,
    child: &mut Child,
    token: &CancellationToken,
) -> Option<ChatEvent> {
    let mut lines = BufReader::new(child.stdout.take().expect("stdout is piped")).lines();
    let mut parser = StreamParser::default();
    loop {
        let line = tokio::select! {
            _ = token.cancelled() => return None,
            line = lines.next_line() => line,
        };
        match line {
            Ok(Some(line)) => parser
                .parse_line(&line)
                .into_iter()
                .for_each(|event| emit(app, request_id, event)),
            _ => return parser.result,
        }
    }
}
