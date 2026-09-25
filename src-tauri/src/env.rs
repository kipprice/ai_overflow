//! Process environment helpers: locating the user's PATH and the `claude` executable.
//!
//! GUI apps launched from Finder get a minimal PATH, so we ask the login shell for the
//! real one and add common install locations.

use std::path::PathBuf;
use std::process::Command;
use std::sync::OnceLock;

/// Returns the user's full PATH, computed once per app launch.
///
/// # Returns
/// A colon-separated PATH combining the login shell's PATH, the current PATH and common
/// install directories, with duplicates removed.
pub fn login_path() -> &'static str {
    static PATH: OnceLock<String> = OnceLock::new();
    PATH.get_or_init(|| {
        let current = std::env::var("PATH").unwrap_or_default();
        let candidates = shell_path()
            .split(':')
            .chain(current.split(':'))
            .map(String::from)
            .chain(common_bin_dirs())
            .collect::<Vec<_>>();
        dedupe(candidates).join(":")
    })
}

/// Resolves the `claude` executable.
///
/// # Arguments
/// * `override_path` - an explicit path from Settings; blank means auto-detect.
///
/// # Returns
/// The path to the executable.
///
/// # Errors
/// Returns an error if the override doesn't exist or nothing is found on the PATH.
pub fn resolve_claude(override_path: Option<&str>) -> Result<PathBuf, String> {
    match override_path.map(str::trim).filter(|p| !p.is_empty()) {
        Some(path) => existing_file(PathBuf::from(path))
            .ok_or_else(|| format!("Claude CLI not found at {path}")),
        None => find_on_path("claude").ok_or_else(|| {
            "Could not find the `claude` CLI. Install Claude Code or set its path in Settings."
                .into()
        }),
    }
}

/// Asks the login shell for its PATH (empty if the shell can't be run).
fn shell_path() -> String {
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".into());
    Command::new(shell)
        .args(["-lc", "printf %s \"$PATH\""])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .unwrap_or_default()
}

/// Directories where `claude` and `ollama` are commonly installed.
fn common_bin_dirs() -> Vec<String> {
    let home = std::env::var("HOME").unwrap_or_default();
    vec![
        format!("{home}/.local/bin"),
        format!("{home}/.claude/local"),
        "/opt/homebrew/bin".into(),
        "/usr/local/bin".into(),
    ]
}

/// Removes empty and duplicate entries while keeping the original order.
fn dedupe(entries: Vec<String>) -> Vec<String> {
    let mut unique: Vec<String> = Vec::new();
    for entry in entries {
        if !entry.is_empty() && !unique.contains(&entry) {
            unique.push(entry);
        }
    }
    unique
}

/// Returns the first `name` executable found on the login PATH.
fn find_on_path(name: &str) -> Option<PathBuf> {
    login_path()
        .split(':')
        .find_map(|dir| existing_file(PathBuf::from(dir).join(name)))
}

/// Returns the path only if it points at an existing file.
fn existing_file(path: PathBuf) -> Option<PathBuf> {
    path.is_file().then_some(path)
}
