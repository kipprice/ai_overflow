//! Reassembles newline-delimited JSON from arbitrarily split network chunks.

use serde_json::Value;

/// Buffers bytes until complete lines are available.
#[derive(Default)]
pub struct LineBuffer(Vec<u8>);

impl LineBuffer {
    /// Adds a network chunk and drains every complete line.
    ///
    /// Partial trailing data is kept for the next chunk; malformed lines are skipped.
    ///
    /// # Arguments
    /// * `chunk` - bytes as received from the network.
    ///
    /// # Returns
    /// The JSON objects from each complete line.
    pub fn push(&mut self, chunk: &[u8]) -> Vec<Value> {
        self.0.extend_from_slice(chunk);
        let mut values = vec![];
        while let Some(end) = self.0.iter().position(|b| *b == b'\n') {
            let line: Vec<u8> = self.0.drain(..=end).collect();
            if let Ok(value) = serde_json::from_slice(&line) {
                values.push(value);
            }
        }
        values
    }
}
