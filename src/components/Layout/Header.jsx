import { useOnlineStatus } from '../../hooks/useOnlineStatus.js'

/**
 * Header — app title + connectivity badge.
 * Phase 2 will add real PeerJS connection state here.
 */
export function Header({ peerId }) {
  const online = useOnlineStatus()

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg font-bold"
            aria-hidden
          >
            ✚
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Resilient Mesh</h1>
            <p className="text-xs text-slate-400">Offline-first P2P emergency comms</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs">
          {/* Network badge — informational only; writes always go to IndexedDB. */}
          <span
            className={`rounded-full px-3 py-1 font-semibold ${
              online ? 'bg-emerald-900 text-emerald-200' : 'bg-amber-900 text-amber-200'
            }`}
            title={online ? 'Browser reports online' : 'Browser reports offline — all data stays local'}
          >
            {online ? '● ONLINE' : '● OFFLINE — local mode'}
          </span>
          <span className="hidden rounded-full bg-slate-800 px-3 py-1 text-slate-300 sm:inline" title="Your local device id">
            peer: {String(peerId ?? '…').slice(0, 8)}…
          </span>
        </div>
      </div>
    </header>
  )
}
