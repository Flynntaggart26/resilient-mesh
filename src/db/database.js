import Dexie from 'dexie'

/**
 * Resilient Mesh — local-first database (IndexedDB via Dexie.js).
 *
 * ZERO BACKEND: everything lives in the browser. No Express, no Firebase,
 * no cloud. Data survives reloads and full offline periods.
 *
 * Tables (Phase 1):
 *  - messages:         P2P chat / mesh relay messages
 *  - emergency_alerts: geolocated distress signals shown on the offline map
 *  - profiles:         local user identity (needed so sent messages/alerts
 *                      have a stable sender without any server account)
 */

// --- JSDoc row shapes (for editor help; no TypeScript required) ---
// Message:        { id?: number, sender: string, content: string, timestamp: number, status: 'queued'|'sent'|'delivered'|'failed' }
// EmergencyAlert: { id?: number, latitude: number, longitude: number, distress_type: string, timestamp: number }
// Profile:        { id?: number, peerId: string, displayName: string, createdAt: number }

class ResilientMeshDB extends Dexie {
  constructor() {
    super('resilient-mesh-db')

    // Version 1 — initial Phase 1 schema.
    // Only indexed fields go in the strings below; `content` is stored
    // but NOT indexed (indexing long text wastes space).
    this.version(1).stores({
      // ++id = auto-increment primary key
      messages: '++id, sender, timestamp, status',
      emergency_alerts: '++id, distress_type, timestamp, latitude, longitude',
      profiles: '++id, &peerId, displayName',
    })
  }
}

export const db = new ResilientMeshDB()

// ---------------------------------------------------------------------------
// Small write helpers — keep components thin, validation in one place.
// ---------------------------------------------------------------------------

/** Persist a chat message locally. Defaults to `queued` until mesh sends it (Phase 2). */
export async function saveMessage({ sender, content, status = 'queued' }) {
  const cleanSender = String(sender ?? '').trim().slice(0, 60)
  const cleanContent = String(content ?? '').trim().slice(0, 2000)
  if (!cleanSender || !cleanContent) {
    throw new Error('sender and content are required')
  }
  return db.messages.add({
    sender: cleanSender,
    content: cleanContent,
    timestamp: Date.now(),
    status,
  })
}

/** Persist an emergency alert locally. Validates coordinates. */
export async function saveAlert({ latitude, longitude, distress_type }) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  const kind = String(distress_type ?? '').trim().slice(0, 80)
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error('latitude must be between -90 and 90')
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error('longitude must be between -180 and 180')
  }
  if (!kind) throw new Error('distress_type is required')
  return db.emergency_alerts.add({
    latitude: lat,
    longitude: lon,
    distress_type: kind,
    timestamp: Date.now(),
  })
}

/** Upsert the local user profile (single-device identity, no server). */
export async function saveLocalProfile({ peerId, displayName }) {
  const id = String(peerId ?? '').trim()
  const name = String(displayName ?? '').trim().slice(0, 60) || 'Anonymous'
  if (!id) throw new Error('peerId is required')
  const existing = await db.profiles.where('peerId').equals(id).first()
  if (existing) {
    return db.profiles.update(existing.id, { displayName: name })
  }
  return db.profiles.add({ peerId: id, displayName: name, createdAt: Date.now() })
}
