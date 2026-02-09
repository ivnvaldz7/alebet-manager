'use client'

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'

export function PWAHandler() {
  useServiceWorkerUpdate()
  return null
}
