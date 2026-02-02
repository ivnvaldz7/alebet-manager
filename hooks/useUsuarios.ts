'use client'

import { useState, useEffect } from 'react'
import type { User, CreateUserInput } from '@/types'
import toast from 'react-hot-toast'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/usuarios')
      const data = await response.json()

      if (data.success) {
        setUsuarios(data.data)
      } else {
        setError(data.error)
        toast.error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Error cargando usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const crearUsuario = async (data: CreateUserInput) => {
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        await fetchUsuarios()
        return { success: true, data: result.data }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      toast.error('Error creando usuario')
      return { success: false, error: error.message }
    }
  }

  const actualizarUsuario = async (id: string, data: Partial<User>) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        await fetchUsuarios()
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false }
      }
    } catch (error) {
      toast.error('Error actualizando usuario')
      return { success: false }
    }
  }

  const eliminarUsuario = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        await fetchUsuarios()
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false }
      }
    } catch (error) {
      toast.error('Error eliminando usuario')
      return { success: false }
    }
  }

  return {
    usuarios,
    isLoading,
    error,
    refetch: fetchUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
  }
}
