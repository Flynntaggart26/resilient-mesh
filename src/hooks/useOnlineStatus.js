import { useEffect, useState } from 'react'

/**
 * useOnlineStatus — tracks navigator.onLine via window events.
 * Used to show "OFFLINE — data saved locally" banners.
 * (No server ping: offline-first means local writes always succeed.)
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
