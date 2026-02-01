'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export function useProducts() {
  const [productos, setProductos] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/productos')
      const data = await response.json()

      if (data.success) {
        setProductos(data.data)
      } else {
        setError(data.error)
        toast.error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Error cargando productos')
    } finally {
      setIsLoading(false)
    }
  }

  const buscarProductos = (query: string) => {
    if (!query) return productos

    const lowerQuery = query.toLowerCase()
    return productos.filter((p) =>
      p.nombreCompleto.toLowerCase().includes(lowerQuery)
    )
  }

  return { productos, isLoading, error, buscarProductos, refetch: fetchProductos }
}
