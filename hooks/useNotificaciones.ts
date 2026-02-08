'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Order, Product } from '@/types'

export interface Notificacion {
  id: string
  tipo: 'pedido_pendiente' | 'pedido_en_preparacion' | 'pedido_listo' | 'stock_critico'
  titulo: string
  mensaje: string
  leida: boolean
  fecha: Date
  link: string
}

const STORAGE_KEY = 'notificaciones-leidas'
const POLL_INTERVAL = 60_000 // 1 minuto

function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return new Set(JSON.parse(saved))
  } catch { /* ignore */ }
  return new Set()
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  return `Hace ${diffDays} días`
}

function generarNotificaciones(
  pedidos: Order[],
  productos: Product[],
  readIds: Set<string>
): Notificacion[] {
  const notificaciones: Notificacion[] = []
  const ahora = new Date()
  const hace48h = new Date(ahora.getTime() - 48 * 60 * 60 * 1000)

  // Pedidos pendientes (últimas 48h)
  pedidos
    .filter((p) => p.estado === 'pendiente' && new Date(p.fechaCreacion) >= hace48h)
    .forEach((pedido) => {
      const id = `pedido_pendiente-${pedido._id}`
      notificaciones.push({
        id,
        tipo: 'pedido_pendiente',
        titulo: 'Pedido pendiente',
        mensaje: `${pedido.numeroPedido} — ${pedido.cliente.nombre}`,
        leida: readIds.has(id),
        fecha: new Date(pedido.fechaCreacion),
        link: `/pedidos/${pedido._id}`,
      })
    })

  // Pedidos en preparación
  pedidos
    .filter((p) => p.estado === 'en_preparacion')
    .forEach((pedido) => {
      const id = `pedido_prep-${pedido._id}`
      notificaciones.push({
        id,
        tipo: 'pedido_en_preparacion',
        titulo: 'Pedido en armado',
        mensaje: `${pedido.numeroPedido} — Armado por ${pedido.armadoPor?.nombre || 'sin asignar'}`,
        leida: readIds.has(id),
        fecha: new Date(pedido.fechaInicioPreparacion || pedido.fechaCreacion),
        link: `/pedidos/${pedido._id}`,
      })
    })

  // Pedidos listos (últimas 48h)
  pedidos
    .filter((p) => p.estado === 'listo' && p.fechaListo && new Date(p.fechaListo) >= hace48h)
    .forEach((pedido) => {
      const id = `pedido_listo-${pedido._id}`
      notificaciones.push({
        id,
        tipo: 'pedido_listo',
        titulo: 'Pedido listo',
        mensaje: `${pedido.numeroPedido} — ${pedido.cliente.nombre}`,
        leida: readIds.has(id),
        fecha: new Date(pedido.fechaListo!),
        link: `/pedidos/${pedido._id}`,
      })
    })

  // Stock crítico
  productos
    .filter((p) => p.activo && p.stockTotal.totalUnidades <= p.stockMinimo)
    .forEach((producto) => {
      const id = `stock_critico-${producto._id}`
      notificaciones.push({
        id,
        tipo: 'stock_critico',
        titulo: 'Stock crítico',
        mensaje: `${producto.nombreCompleto} — ${producto.stockTotal.totalUnidades} unidades (mín: ${producto.stockMinimo})`,
        leida: readIds.has(id),
        fecha: new Date(producto.updatedAt),
        link: '/stock?critico=true',
      })
    })

  // Ordenar por fecha descendente
  notificaciones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

  return notificaciones
}

export function useNotificaciones() {
  const [pedidos, setPedidos] = useState<Order[]>([])
  const [productos, setProductos] = useState<Product[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds)
  const [isLoading, setIsLoading] = useState(true)
  const prevNoLeidasRef = useRef<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [pedidosRes, productosRes] = await Promise.all([
        fetch('/api/pedidos'),
        fetch('/api/productos'),
      ])

      const [pedidosData, productosData] = await Promise.all([
        pedidosRes.json(),
        productosRes.json(),
      ])

      if (pedidosData.success) setPedidos(pedidosData.data)
      if (productosData.success) setProductos(productosData.data)
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  const notificaciones = generarNotificaciones(pedidos, productos, readIds)
  const noLeidas = notificaciones.filter((n) => !n.leida).length

  // Browser push notification when new unread appear
  useEffect(() => {
    if (prevNoLeidasRef.current === null) {
      prevNoLeidasRef.current = noLeidas
      return
    }

    if (noLeidas > prevNoLeidasRef.current && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const nuevas = noLeidas - prevNoLeidasRef.current
      new Notification('Ale-Bet Manager', {
        body: `Tenés ${nuevas} notificación${nuevas > 1 ? 'es' : ''} nueva${nuevas > 1 ? 's' : ''}`,
        icon: '/icons/icon-192x192.png',
      })
    }

    prevNoLeidasRef.current = noLeidas
  }, [noLeidas])

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev)
      notificaciones.forEach((n) => next.add(n.id))
      saveReadIds(next)
      return next
    })
  }, [notificaciones])

  const requestPushPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

  return {
    notificaciones,
    noLeidas,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchData,
    requestPushPermission,
    timeAgo,
  }
}
