//! Registry of in-flight generation requests, so the frontend can cancel them (Escape).

use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;
use tokio_util::sync::CancellationToken;

/// In-flight requests keyed by the frontend-generated request id.
#[derive(Default)]
pub struct Requests(Mutex<HashMap<String, CancellationToken>>);

impl Requests {
    /// Registers a new request so it can later be cancelled.
    ///
    /// # Arguments
    /// * `id` - the frontend-generated request id.
    ///
    /// # Returns
    /// A token the streaming loop watches; it fires when the request is cancelled.
    pub fn register(&self, id: &str) -> CancellationToken {
        let token = CancellationToken::new();
        self.0.lock().unwrap().insert(id.to_string(), token.clone());
        token
    }

    /// Forgets a request once it has completed, so the registry doesn't grow unbounded.
    ///
    /// # Arguments
    /// * `id` - the request id passed to [`Requests::register`].
    pub fn finish(&self, id: &str) {
        self.0.lock().unwrap().remove(id);
    }
}

/// Cancels an in-flight request, stopping generation and discarding its output.
///
/// Unknown or already-finished ids are ignored, so it is always safe to call.
///
/// # Arguments
/// * `state` - the shared request registry.
/// * `request_id` - the id of the request to cancel.
#[tauri::command]
pub fn cancel_request(state: State<'_, Requests>, request_id: String) {
    if let Some(token) = state.0.lock().unwrap().remove(&request_id) {
        token.cancel();
    }
}
