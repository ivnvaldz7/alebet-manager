'use client'

import { useState, useEffect } from 'react'
import type { Customer, CreateCustomerInput } from '@/types'
import toast from 'react-hot-toast'

export function useClientes() {
  const [clientes, setClientes] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = async (q?: string) => {
    try {
      setIsLoading(true)
      const url = q ? `/api/clientes?q=${encodeURIComponent(q)}` : '/api/clientes'
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setClientes(data.data)
      } else {
        setError(data.error)
        toast.error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Error cargando clientes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const crearCliente = async (data: CreateCustomerInput) => {
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        await fetchClientes()
        return { success: true, data: result.data }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      toast.error('Error creando cliente')
      return { success: false, error: error.message }
    }
  }

  const actualizarCliente = async (id: string, data: Partial<Customer>) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        await fetchClientes()
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false }
      }
    } catch {
      toast.error('Error actualizando cliente')
      return { success: false }
    }
  }

  const eliminarCliente = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        await fetchClientes()
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false }
      }
    } catch {
      toast.error('Error eliminando cliente')
      return { success: false }
    }
  }

  return {
    clientes,
    isLoading,
    error,
    refetch: fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  }
}
