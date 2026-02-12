'use client'

import { useEffect, useState } from 'react'
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'

const CHUNK_ERROR_KEY = 'chunk_error_recovery'

export function PWAHandler() {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate()
  const [dismissed, setDismissed] = useState(false)
  const [show, setShow] = useState(false)

  // Animate in when update is available
  useEffect(() => {
    if (updateAvailable && !dismissed) {
      // Small delay to trigger CSS transition
      const timer = setTimeout(() => setShow(true), 50)
      return () => clearTimeout(timer)
    }
    setShow(false)
  }, [updateAvailable, dismissed])

  // ChunkLoadError recovery
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || ''
      const isChunkError =
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch dynamically imported module')

      if (!isChunkError) return

      // Prevent infinite recovery loops
      if (sessionStorage.getItem(CHUNK_ERROR_KEY) === '1') return

      try {
        sessionStorage.setItem(CHUNK_ERROR_KEY, '1')

        // Unregister SW and clear caches, then reload
        navigator.serviceWorker
          ?.getRegistrations()
          .then((registrations) => {
            const unregisterPromises = registrations.map((r) => r.unregister())
            return Promise.all(unregisterPromises)
          })
          .then(() => caches.keys())
          .then((cacheNames) => {
            const deletePromises = cacheNames
              .filter(
                (name) =>
                  name.startsWith('workbox-') ||
                  name.startsWith('next-') ||
                  name === 'apis'
              )
              .map((name) => caches.delete(name))
            return Promise.all(deletePromises)
          })
          .then(() => {
            window.location.reload()
          })
          .catch(() => {
            window.location.reload()
          })
      } catch {
        // Never break the app
      }
    }

    // Clear recovery flag on successful load
    sessionStorage.removeItem(CHUNK_ERROR_KEY)

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (!updateAvailable || dismissed) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#43a047',
          color: 'white',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <span>Nueva versión disponible</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={applyUpdate}
            style={{
              padding: '6px 16px',
              backgroundColor: 'white',
              color: '#43a047',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Cerrar"
            style={{
              padding: '4px 8px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
