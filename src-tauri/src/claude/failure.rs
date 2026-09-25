//! Explains why a CLI turn ended without a result.

use tokio::io::AsyncReadExt;
use tokio::process::{Child, ChildStderr};

/// Builds an error message for a process that exited without a result.
///
/// # Arguments
/// * `child` - the exited (or exiting) CLI process.
///
/// # Returns
/// The CLI's stderr output if any, otherwise its exit status.
pub async fn failure_message(child: &mut Child) -> String {
    let stderr = read_stderr(child.stderr.take()).await;
    let status = child.wait().await.map(|s| s.to_string()).unwrap_or_default();
    if stderr.is_empty() {
        format!("claude exited without a result ({status})")
    } else {
        stderr
    }
}

/// Reads everything the process wrote to stderr.
async fn read_stderr(stderr: Option<ChildStderr>) -> String {
    let mut buf = String::new();
    if let Some(mut stderr) = stderr {
        let _ = stderr.read_to_string(&mut buf).await;
    }
    buf.trim().to_string()
}
