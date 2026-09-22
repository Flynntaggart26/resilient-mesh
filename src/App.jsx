import { useEffect, useMemo, useState } from 'react'
import { Header } from './components/Layout/Header.jsx'
import { MessageList } from './components/Chat/MessageList.jsx'
import { MessageComposer } from './components/Chat/MessageComposer.jsx'
import { AlertForm } from './components/Alerts/AlertForm.jsx'
import { AlertList } from './components/Alerts/AlertList.jsx'
import { OfflineMap } from './components/Map/OfflineMap.jsx'
import { MeshStatusCard } from './components/Mesh/MeshStatusCard.jsx'
import { saveLocalProfile, db } from './db/database.js'
import { getOrCreatePeerId } from './utils/id.js'
import { useLiveQuery } from 'dexie-react-hooks'

/**
 * Resilient Mesh — Phase 1 shell.
 *
 * - All reads/writes go through IndexedDB (Dexie). No fetch(), no backend.
 * - Service Worker (Workbox) precaches the app shell + map tiles offline.
 * - Phase 2 will add PeerJS DataChannels and flip message status queued→sent.
 */
function App() {
  // Stable local identity without any server account.
  const peerId = useMemo(() => getOrCreatePeerId(), [])
  const [displayName, setDisplayName] = useState('rescuer-1')
  const [profileMsg, setProfileMsg] = useState('')

  // Local stats (reactive counts) — proves IndexedDB wiring works.
  const messageCount = useLiveQuery(() => db.messages.count(), [], 0)
  const alertCount = useLiveQuery(() => db.emergency_alerts.count(), [], 0)

  // Persist a default profile row once (idempotent upsert).
  useEffect(() => {
    saveLocalProfile({ peerId, displayName: 'rescuer-1' }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerId])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setProfileMsg('')
    try {
      await saveLocalProfile({ peerId, displayName })
      setProfileMsg('Profile saved locally ✓')
    } catch (err) {
      setProfileMsg(err?.message ?? 'Could not save profile')
    }
  }

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <Header peerId={peerId} />

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        {/* Local identity — stored in `profiles` table, no server. */}
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">
            Local profile (IndexedDB — no login server)
          </h2>
          <form onSubmit={handleSaveProfile} className="mt-2 flex flex-wrap gap-2">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              placeholder="Display name"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
            >
              Save profile
            </button>
          </form>
          {profileMsg && <p className="mt-2 text-xs text-emerald-300">{profileMsg}</p>}
          <p className="mt-2 text-xs text-slate-500">
            Stored locally: {messageCount ?? '…'} messages · {alertCount ?? '…'} alerts
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Chat — IndexedDB backed */}
          <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
              Mesh messages (offline-first)
            </h2>
            <MessageList />
            <MessageComposer sender={displayName.trim() || 'anonymous'} />
          </section>

          {/* Alerts — IndexedDB backed */}
          <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
              Emergency alerts (offline-first)
            </h2>
            <AlertForm />
            <div className="mt-3">
              <AlertList />
            </div>
          </section>
        </div>

        {/* Offline map — tiles cached by Workbox */}
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
            Offline map (Leaflet + cached tiles)
          </h2>
          <OfflineMap />
        </section>

        <MeshStatusCard peerId={peerId} />

        <footer className="pb-4 text-center text-xs text-slate-500">
          Phase 1: PWA shell + IndexedDB. No backend, no cloud — 100% local.
        </footer>
      </main>
    </div>
  )
}

export default App
