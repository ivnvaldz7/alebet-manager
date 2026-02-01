'use client'

import { useState, useEffect } from 'react'
import type { Order, OrderStatus } from '@/types'
import toast from 'react-hot-toast'

export function usePedidos(estadoFiltro?: OrderStatus) {
  const [pedidos, setPedidos] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPedidos = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (estadoFiltro) {
        params.append('estado', estadoFiltro)
      }

      const response = await fetch(`/api/pedidos?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPedidos(data.data)
      } else {
        setError(data.error)
        toast.error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Error cargando pedidos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPedidos()
  }, [estadoFiltro])

  const refetch = () => {
    fetchPedidos()
  }

  return { pedidos, isLoading, error, refetch }
}

export function usePedido(id: string) {
  const [pedido, setPedido] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPedido = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/pedidos/${id}`)
      const data = await response.json()

      if (data.success) {
        setPedido(data.data)
      } else {
        setError(data.error)
        toast.error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Error cargando pedido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPedido()
    }
  }, [id])

  const tomarPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tomar' }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setPedido(data.data)
        return true
      } else {
        toast.error(data.error)
        return false
      }
    } catch (error) {
      toast.error('Error tomando pedido')
      return false
    }
  }

  const confirmarPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirmar' }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setPedido(data.data)
        return true
      } else {
        toast.error(data.error)
        return false
      }
    } catch (error) {
      toast.error('Error confirmando pedido')
      return false
    }
  }

  const marcarListo = async () => {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listo' }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setPedido(data.data)
        return true
      } else {
        toast.error(data.error)
        return false
      }
    } catch (error) {
      toast.error('Error marcando como listo')
      return false
    }
  }

  const cancelarPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancelar' }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setPedido(data.data)
        return true
      } else {
        toast.error(data.error)
        return false
      }
    } catch (error) {
      toast.error('Error cancelando pedido')
      return false
    }
  }

  return {
    pedido,
    isLoading,
    error,
    tomarPedido,
    confirmarPedido,
    marcarListo,
    cancelarPedido,
    refetch: fetchPedido,
  }
}
