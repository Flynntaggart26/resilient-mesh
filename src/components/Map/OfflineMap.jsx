import { useEffect } from 'react'
import L from 'leaflet'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database.js'

// Fix default marker icons under Vite (Leaflet expects images at relative URLs).
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

/**
 * OfflineMap — Leaflet map reading tiles that the Service Worker
 * (Workbox CacheFirst) has cached for offline use.
 * Emergency alerts from IndexedDB are plotted as circle markers.
 *
 * NOTE: tiles load from OSM while online, then keep working offline.
 * For guaranteed offline regions, pre-visit the area once while online.
 */
export function OfflineMap() {
  // Reactive alerts → markers re-render automatically on DB change.
  const alerts = useLiveQuery(() => db.emergency_alerts.toArray(), [], [])

  useEffect(() => {
    // Fix Leaflet's default icon paths for Vite bundling.
    // (Must run before any marker is created.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    })

    // Default view: Istanbul (project context) — user can pan/zoom freely.
    const map = L.map('resilient-mesh-map', { zoomControl: true }).setView(
      [41.0082, 28.9784],
      11,
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    // Keep reference for the marker layer below.
    // Store on DOM node to avoid re-creating the map on alert changes.
    // (Simple pattern: one map instance per mount.)
    const node = document.getElementById('resilient-mesh-map')
    if (node) node._leaflet_map = map

    return () => {
      map.remove()
    }
  }, [])

  // Re-draw alert markers whenever IndexedDB alerts change.
  useEffect(() => {
    const node = document.getElementById('resilient-mesh-map')
    const map = node?._leaflet_map
    if (!map || !alerts) return

    // Remove previous alert layer if present.
    if (node._alert_layer) {
      node._alert_layer.remove()
      node._alert_layer = null
    }

    const layer = L.layerGroup()
    for (const a of alerts) {
      L.circleMarker([a.latitude, a.longitude], {
        radius: 9,
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.5,
      })
        .bindPopup(
          `<b>${String(a.distress_type).toUpperCase()}</b><br/>${a.latitude.toFixed(5)}, ${a.longitude.toFixed(5)}<br/>${new Date(a.timestamp).toLocaleString()}`,
        )
        .addTo(layer)
    }
    layer.addTo(map)
    node._alert_layer = layer
  }, [alerts])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <div id="resilient-mesh-map" className="h-64 w-full sm:h-80" />
      <p className="bg-slate-900 px-3 py-2 text-xs text-slate-400">
        Tiles cache automatically for offline use (Workbox CacheFirst). Alerts:{' '}
        <span className="font-semibold text-slate-200">{alerts?.length ?? '…'}</span>
      </p>
    </div>
  )
}
