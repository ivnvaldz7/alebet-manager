'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function EditarLotePage({
  params,
}: {
  params: Promise<{ id: string; numero: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [producto, setProducto] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    cajas: 0,
    sueltos: 0,
    fechaProduccion: '',
    fechaVencimiento: '',
  })

  useEffect(() => {
    fetchProducto()
  }, [])

  const fetchProducto = async () => {
    try {
      const response = await fetch(`/api/productos/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        const producto = data.data
        const lote = producto.lotes.find(
          (l: { numero: string }) => l.numero === resolvedParams.numero
        )

        if (!lote) {
          toast.error('Lote no encontrado')
          router.back()
          return
        }

        setProducto(producto)
        setFormData({
          cajas: lote.cajas,
          sueltos: lote.sueltos,
          fechaProduccion: new Date(lote.fechaProduccion)
            .toISOString()
            .slice(0, 7),
          fechaVencimiento: lote.fechaVencimiento
            ? new Date(lote.fechaVencimiento).toISOString().slice(0, 7)
            : '',
        })
      } else {
        toast.error(data.error)
        router.back()
      }
    } catch (error) {
      toast.error('Error cargando lote')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!producto) return

    // Validaciones
    if (formData.cajas === 0 && formData.sueltos === 0) {
      toast.error('Debes tener al menos cajas o sueltos')
      return
    }

    if (formData.sueltos >= producto.stockTotal.unidadesPorCaja) {
      toast.error(
        `Los sueltos deben ser menores a ${producto.stockTotal.unidadesPorCaja}`
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/productos/${resolvedParams.id}/lotes/${resolvedParams.numero}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Lote actualizado correctamente')
        router.push(`/admin/productos/${resolvedParams.id}`)
      } else {
        toast.error(data.error || 'Error al actualizar lote')
      }
    } catch (error) {
      toast.error('Error al actualizar lote')
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

  const lote = producto.lotes.find((l) => l.numero === resolvedParams.numero)

  if (!lote) {
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
        <h1 className="text-2xl font-bold text-secondary-900">
          Editar Lote {lote.numero}
        </h1>
        <p className="text-secondary-600 mt-1">{producto.nombreCompleto}</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informacion del Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stock Actual */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Stock actual del lote:
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {lote.cajas} cajas + {lote.sueltos} sueltos = {lote.unidades}{' '}
                unidades
              </p>
            </div>

            {/* Ajuste de Cantidades */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Ajustar cantidades
              </label>

              <div className="space-y-4">
                {/* Cajas */}
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-2">
                    Cajas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cajas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cajas: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Sueltos */}
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-2">
                    Sueltos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={producto.stockTotal.unidadesPorCaja - 1}
                    value={formData.sueltos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sueltos: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Maximo {producto.stockTotal.unidadesPorCaja - 1} sueltos
                  </p>
                </div>
              </div>

              {/* Resumen */}
              <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-700">
                  Nuevo total:{' '}
                  <span className="font-semibold text-secondary-900">
                    {formData.cajas * producto.stockTotal.unidadesPorCaja +
                      formData.sueltos}{' '}
                    unidades
                  </span>
                </p>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha Producción */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha de Produccion
                </label>
                <input
                  type="month"
                  value={formData.fechaProduccion}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaProduccion: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Fecha Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="month"
                  value={formData.fechaVencimiento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fechaVencimiento: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advertencia */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Los cambios en las cantidades se
            registraran en el historial de movimientos. Asegurate de que los
            valores sean correctos.
          </p>
        </div>

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
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
