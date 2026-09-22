/**
 * MeshStatusCard — placeholder for Phase 2 (PeerJS / WebRTC DataChannels).
 * Shows explicit "not yet wired" state so nobody assumes P2P works in Phase 1.
 */
export function MeshStatusCard({ peerId }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">
        Mesh network — Phase 2 (pending)
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        WebRTC / PeerJS integration is <span className="font-semibold text-amber-300">not yet wired</span>.
        Your peer id is reserved locally; messages stay in IndexedDB with status{' '}
        <code className="rounded bg-slate-800 px-1 font-mono text-xs">queued</code> until then.
      </p>
      <p className="mt-2 break-all font-mono text-xs text-slate-500">
        local peer id: {peerId}
      </p>
    </div>
  )
}
