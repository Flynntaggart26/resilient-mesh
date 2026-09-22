import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database.js'
import { formatTime } from '../../utils/id.js'

/**
 * MessageList — reads `messages` table reactively (liveQuery).
 * Sorted newest-last so chat reads top→bottom.
 */
export function MessageList() {
  const messages = useLiveQuery(
    () => db.messages.orderBy('timestamp').limit(100).toArray(),
    [],
    [],
  )

  if (!messages) {
    return <p className="text-sm text-slate-400">Loading local messages…</p>
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
        No messages yet. Everything you send is stored in IndexedDB first —
        it works fully offline.
      </div>
    )
  }

  return (
    <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
      {messages.map((m) => (
        <li key={m.id} className="rounded-xl bg-slate-800/80 p-3">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-100">{m.sender}</span>
            <span className="shrink-0 text-slate-400">
              {formatTime(m.timestamp)} · {m.status}
            </span>
          </div>
          <p className="mt-1 break-words text-sm text-slate-200">{m.content}</p>
        </li>
      ))}
    </ul>
  )
}
