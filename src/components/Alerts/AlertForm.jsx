import { useState } from 'react'
import { saveAlert } from '../../db/database.js'

const DISTRESS_TYPES = ['medical', 'trapped', 'fire', 'flood', 'shelter-needed', 'other']

/**
 * AlertForm — writes geolocated alerts to `emergency_alerts` in IndexedDB.
 * "Use my location" uses GPS only (no network). Manual lat/lon works offline.
 */
export function AlertForm() {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [distressType, setDistressType] = useState(DISTRESS_TYPES[0])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [locating, setLocating] = useState(false)

  function useMyLocation() {
    setError('')
    setOk('')
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported on this device — enter coordinates manually.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude.toFixed(6)))
        setLongitude(String(pos.coords.longitude.toFixed(6)))
        setLocating(false)
      },
      () => {
        setError('Could not get GPS fix. Enter coordinates manually.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    try {
      await saveAlert({ latitude, longitude, distress_type: distressType })
      setOk('Alert saved locally — it will sync over P2P when peers connect (Phase 2).')
    } catch (err) {
      setError(err?.message ?? 'Could not save alert')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Latitude"
          inputMode="decimal"
          className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Longitude"
          inputMode="decimal"
          className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={distressType}
          onChange={(e) => setDistressType(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-red-500"
        >
          {DISTRESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="shrink-0 rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600 disabled:opacity-40"
        >
          {locating ? 'GPS…' : '📍 GPS'}
        </button>
      </div>
      <button
        type="submit"
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
      >
        Save distress alert offline
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {ok && <p className="text-xs text-emerald-300">{ok}</p>}
    </form>
  )
}
