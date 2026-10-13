//! AI Overflow backend: exposes the Claude and Ollama harnesses, theme extraction and
//! feed persistence to the Svelte frontend as Tauri commands.

mod claude;
mod env;
mod events;
mod focus;
mod ollama;
mod requests;
mod resolution;
mod storage;
#[cfg(test)]
mod tests;
mod text;
mod theme;

/// Builds and runs the Tauri application.
///
/// Registers the plugins, the shared in-flight request registry and every command the
/// frontend can invoke.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(requests::Requests::default())
        .invoke_handler(tauri::generate_handler![
            requests::cancel_request,
            claude::chat::claude_send,
            claude::theme::claude_theme,
            claude::resolution::claude_resolution,
            claude::status::claude_status,
            ollama::chat::ollama_chat,
            ollama::models::ollama_models,
            ollama::models::ollama_model_info,
            ollama::theme::ollama_theme,
            ollama::resolution::ollama_resolution,
            storage::load_data,
            storage::save_data,
            storage::default_workspace,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
