'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const SW_UPDATED_KEY = 'sw_updated'

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const registeredRef = useRef(false)
  const wbRef = useRef<Workbox | null>(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      window.workbox === undefined
    ) {
      return
    }

    // Only register once (StrictMode guard)
    if (registeredRef.current) return
    registeredRef.current = true

    const wb = window.workbox
    wbRef.current = wb

    // Clear the reload guard if there's no SW waiting
    // (allows future updates to trigger reload)
    if (!navigator.serviceWorker.controller) {
      sessionStorage.removeItem(SW_UPDATED_KEY)
    }

    // When a new SW is installed and waiting, show the update banner
    wb.addEventListener('waiting', () => {
      setUpdateAvailable(true)
    })

    // Also check if there's already a SW waiting (e.g. page was refreshed
    // while a SW was already in waiting state)
    wb.addEventListener('controlling', () => {
      // Only reload if we initiated the update (flag is set by applyUpdate)
      if (sessionStorage.getItem(SW_UPDATED_KEY) === '1') {
        sessionStorage.removeItem(SW_UPDATED_KEY)
        window.location.reload()
      }
    })

    wb.register()
  }, [])

  const applyUpdate = useCallback(() => {
    const wb = wbRef.current
    if (!wb) return

    // Guard against reload loops
    if (sessionStorage.getItem(SW_UPDATED_KEY) === '1') return

    // Set flag BEFORE triggering skip waiting
    sessionStorage.setItem(SW_UPDATED_KEY, '1')

    // Tell the waiting SW to activate
    wb.messageSkipWaiting()
  }, [])

  return { updateAvailable, applyUpdate }
}
