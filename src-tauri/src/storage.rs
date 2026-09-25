//! Persists the whole feed as a single JSON document in the app data directory.

use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const FEED_FILE: &str = "feed.json";

/// Loads the saved feed.
///
/// # Arguments
/// * `app` - the Tauri app handle, used to locate the app data directory.
///
/// # Returns
/// The saved JSON document, or `None` on first launch.
///
/// # Errors
/// Returns an error if the file exists but can't be read.
#[tauri::command]
pub fn load_data(app: AppHandle) -> Result<Option<String>, String> {
    let path = data_dir(&app)?.join(FEED_FILE);
    match std::fs::read_to_string(&path) {
        Ok(json) => Ok(Some(json)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(format!("Failed to read {}: {e}", path.display())),
    }
}

/// Saves the feed, replacing the previous copy.
///
/// Writes to a temp file and renames it, so a crash mid-write can't corrupt the feed.
///
/// # Arguments
/// * `app` - the Tauri app handle, used to locate the app data directory.
/// * `json` - the serialised feed.
///
/// # Errors
/// Returns an error if the file can't be written.
#[tauri::command]
pub fn save_data(app: AppHandle, json: String) -> Result<(), String> {
    let dir = data_dir(&app)?;
    let tmp = dir.join(format!("{FEED_FILE}.tmp"));
    std::fs::write(&tmp, json).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, dir.join(FEED_FILE)).map_err(|e| e.to_string())
}

/// Returns the default working directory for Claude.
///
/// An isolated folder keeps project files and CLAUDE.md context out of Q&A sessions.
///
/// # Arguments
/// * `app` - the Tauri app handle, used to locate the app data directory.
///
/// # Returns
/// The absolute path of the workspace folder (created on first use).
///
/// # Errors
/// Returns an error if the app data directory can't be resolved or created.
#[tauri::command]
pub fn default_workspace(app: AppHandle) -> Result<String, String> {
    Ok(data_dir(&app)?.join("workspace").to_string_lossy().into_owned())
}

/// Resolves the app data directory, creating it if needed.
fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}
