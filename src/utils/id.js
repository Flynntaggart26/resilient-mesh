/**
 * Tiny helpers — no dependencies, fully offline-safe.
 */

/** Generate a stable local peer id without any server (persisted in localStorage by caller). */
export function getOrCreatePeerId() {
  const KEY = 'resilient-mesh:peer-id'
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id =
        // Modern browsers:
        globalThis.crypto?.randomUUID?.() ??
        // Fallback:
        `peer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    // localStorage blocked (private mode) — still return an ephemeral id.
    return `peer-ephemeral-${Date.now()}`
  }
}

/** Format epoch ms as HH:MM:SS local time for message lists. */
export function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return String(ts)
  }
}
