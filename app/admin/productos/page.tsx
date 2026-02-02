'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  PackagePlus,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProductosPage() {
  const router = useRouter()
  const { productos, isLoading, mutate } = useProducts()
  const [busqueda, setBusqueda] = useState('')

  // Función para extraer el número de ML/L de la presentación
  const extraerMililitros = (presentacion: string): number => {
    // Buscar patrón: número + ML/L
    const match = presentacion.match(/(\d+)\s*(ML|L)/i)
    if (!match) return 999999 // Si no tiene formato, va al final

    const valor = parseInt(match[1])
    const unidad = match[2].toUpperCase()

    // Convertir litros a mililitros para comparación uniforme
    return unidad === 'L' ? valor * 1000 : valor
  }

  // Filtrar y ordenar productos
  let productosFiltrados = busqueda
    ? productos.filter(
        (p) =>
          p.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.codigoSKU.toLowerCase().includes(busqueda.toLowerCase())
      )
    : productos

  // Ordenar por nombre, luego por presentación (menor a mayor)
  productosFiltrados = [...productosFiltrados].sort((a, b) => {
    // Primero por nombre
    const nombreCompare = a.nombre.localeCompare(b.nombre)
    if (nombreCompare !== 0) return nombreCompare

    // Si tienen el mismo nombre, ordenar por presentación
    return extraerMililitros(a.presentacion) - extraerMililitros(b.presentacion)
  })

  const handleDesactivar = async (productoId: string, nombreCompleto: string) => {
    if (!confirm(`¿Desactivar ${nombreCompleto}?`)) return

    try {
      const res = await fetch(`/api/productos/${productoId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Producto desactivado')
        mutate()
      } else {
        toast.error(data.error || 'Error al desactivar')
      }
    } catch (error) {
      toast.error('Error al desactivar producto')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Gestión de Productos
          </h1>
          <p className="text-secondary-600 mt-1">
            Administrar productos y stock
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/productos/nuevo')}
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-600">
            {busqueda ? 'No se encontraron productos' : 'No hay productos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productosFiltrados.map((producto) => {
            const stockBajo =
              producto.stockTotal.totalUnidades <= producto.stockMinimo

            return (
              <Card
                key={producto._id}
                className={`hover:shadow-md transition-shadow ${
                  stockBajo ? 'border-yellow-300' : ''
                }`}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 mb-1">
                        {producto.nombreCompleto}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {producto.codigoSKU}
                      </p>
                    </div>
                    {stockBajo && (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Stock */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Stock:</span>
                      <span
                        className={`font-semibold ${
                          stockBajo ? 'text-yellow-600' : 'text-secondary-900'
                        }`}
                      >
                        {producto.stockTotal.totalUnidades} unidades
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Lotes:</span>
                      <span className="font-medium text-secondary-900">
                        {producto.lotes.length}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-4 border-t border-secondary-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(
                          `/admin/productos/${producto._id}/agregar-stock`
                        )
                      }
                    >
                      <PackagePlus className="h-4 w-4 mr-1" />
                      Stock
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/productos/${producto._id}`)
                      }
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleDesactivar(producto._id, producto.nombreCompleto)
                      }
                      title="Desactivar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
