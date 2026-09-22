import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database.js'
import { formatTime } from '../../utils/id.js'

/**
 * AlertList — reactive read of `emergency_alerts`, newest first.
 * Phase 3 will plot these on the Leaflet offline map.
 */
export function AlertList() {
  const alerts = useLiveQuery(
    () => db.emergency_alerts.orderBy('timestamp').reverse().limit(50).toArray(),
    [],
    [],
  )

  async function removeAlert(id) {
    await db.emergency_alerts.delete(id)
  }

  if (!alerts) return <p className="text-sm text-slate-400">Loading alerts…</p>

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
        No distress alerts stored yet.
      </div>
    )
  }

  return (
    <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
      {alerts.map((a) => (
        <li key={a.id} className="flex items-start justify-between gap-2 rounded-xl bg-slate-800/80 p-3">
          <div className="text-sm">
            <span className="rounded-full bg-red-900 px-2 py-0.5 text-xs font-bold text-red-200">
              {a.distress_type}
            </span>
            <p className="mt-1 font-mono text-xs text-slate-300">
              {Number(a.latitude).toFixed(5)}, {Number(a.longitude).toFixed(5)}
            </p>
            <p className="text-xs text-slate-500">{formatTime(a.timestamp)}</p>
          </div>
          <button
            type="button"
            onClick={() => removeAlert(a.id)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-100"
            title="Delete local alert"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
