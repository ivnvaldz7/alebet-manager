'use client'

import { useEffect } from 'react'

export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox

      // Cuando hay un SW esperando, activarlo inmediatamente
      const promptNewVersionAvailable = () => {
        // skipWaiting ya está habilitado en next.config.ts
        // pero enviamos el mensaje por si acaso
        wb.messageSkipWaiting()
      }

      wb.addEventListener('waiting', promptNewVersionAvailable)

      // Cuando el SW se activa, recargar para usar la nueva versión
      wb.addEventListener('controlling', () => {
        window.location.reload()
      })

      // Registrar el SW
      wb.register()
    }
  }, [])
}
