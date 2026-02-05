'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [producto, setProducto] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    presentacion: '',
    codigoSKU: '',
    unidadesPorCaja: 20,
    stockMinimo: 100,
    activo: true,
  })

  useEffect(() => {
    fetchProducto()
  }, [])

  const fetchProducto = async () => {
    try {
      const response = await fetch(`/api/productos/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setProducto(data.data)
        setFormData({
          nombre: data.data.nombre,
          presentacion: data.data.presentacion,
          codigoSKU: data.data.codigoSKU,
          unidadesPorCaja: data.data.stockTotal.unidadesPorCaja,
          stockMinimo: data.data.stockMinimo,
          activo: data.data.activo,
        })
      } else {
        toast.error(data.error)
        router.push('/admin/productos')
      }
    } catch (error) {
      toast.error('Error cargando producto')
      router.push('/admin/productos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/productos/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Producto actualizado correctamente')
        router.push('/admin/productos')
      } else {
        toast.error(data.error || 'Error actualizando producto')
      }
    } catch (error) {
      toast.error('Error al actualizar producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!producto) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-secondary-900">Editar Producto</h1>
        <p className="text-secondary-600 mt-1">
          Modificar informacion del producto
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informacion del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre del producto"
              required
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="OLIVITASAN"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Presentacion <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.presentacion}
                onChange={(e) =>
                  setFormData({ ...formData, presentacion: e.target.value })
                }
                list="presentaciones-comunes"
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <datalist id="presentaciones-comunes">
                <option value="25 ML" />
                <option value="100 ML" />
                <option value="250 ML" />
                <option value="500 ML" />
                <option value="1 L" />
              </datalist>
            </div>

            <Input
              label="Codigo SKU"
              required
              value={formData.codigoSKU}
              onChange={(e) =>
                setFormData({ ...formData, codigoSKU: e.target.value.toUpperCase() })
              }
              placeholder="OL"
            />

            <Input
              label="Unidades por caja"
              type="number"
              required
              min="1"
              value={formData.unidadesPorCaja}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unidadesPorCaja: parseInt(e.target.value) || 1,
                })
              }
            />

            <Input
              label="Stock minimo"
              type="number"
              required
              min="0"
              value={formData.stockMinimo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stockMinimo: parseInt(e.target.value) || 0,
                })
              }
              helperText="Alerta cuando el stock este por debajo de este numero"
            />

            <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
                className="h-5 w-5"
              />
              <label htmlFor="activo" className="text-sm text-secondary-700">
                Producto activo (visible en el sistema)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">Vista previa:</p>
                <p className="text-lg font-semibold text-secondary-900">
                  {formData.nombre} {formData.presentacion}
                </p>
                <p className="text-sm text-secondary-600 mt-1">
                  SKU: {formData.codigoSKU} - {formData.unidadesPorCaja} unid/caja
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
