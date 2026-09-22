import { useState } from 'react'
import { saveMessage } from '../../db/database.js'

/**
 * MessageComposer — writes to IndexedDB via saveMessage().
 * No fetch(), no server. Status starts as `queued`; Phase 2 (PeerJS)
 * will flip it to sent/delivered after mesh relay.
 */
export function MessageComposer({ sender }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const text = content.trim()
    if (!text) return
    setSaving(true)
    try {
      await saveMessage({ sender, content: text, status: 'queued' })
      setContent('')
    } catch (err) {
      setError(err?.message ?? 'Could not save message locally')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message as ${sender}… (saved offline)`}
          maxLength={2000}
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-red-500"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </form>
  )
}
