'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function QuitarStockPage({
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
    motivo: 'Rotura',
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

    const lote = producto.lotes.find(
      (l: { numero: string }) => l.numero === resolvedParams.numero
    )
    if (!lote) return

    // Validaciones
    if (formData.cajas === 0 && formData.sueltos === 0) {
      toast.error('Debes especificar cajas o sueltos a quitar')
      return
    }

    const unidadesAQuitar =
      formData.cajas * producto.stockTotal.unidadesPorCaja + formData.sueltos

    if (unidadesAQuitar > lote.unidades) {
      toast.error(
        `No puedes quitar ${unidadesAQuitar} unidades. ` +
          `El lote solo tiene ${lote.unidades} unidades disponibles.`
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/productos/${resolvedParams.id}/lotes/${resolvedParams.numero}/quitar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cajas: formData.cajas,
            sueltos: formData.sueltos,
            motivo: formData.motivo,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Stock descontado correctamente')
        router.push(`/admin/productos/${resolvedParams.id}`)
      } else {
        toast.error(data.error || 'Error al quitar stock')
      }
    } catch (error) {
      toast.error('Error al quitar stock')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !producto) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const lote = producto.lotes.find(
    (l: { numero: string }) => l.numero === resolvedParams.numero
  )
  if (!lote) return null

  const unidadesAQuitar =
    formData.cajas * producto.stockTotal.unidadesPorCaja + formData.sueltos

  const excede = unidadesAQuitar > lote.unidades

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
          Quitar Stock del Lote {lote.numero}
        </h1>
        <p className="text-secondary-600 mt-1">{producto.nombreCompleto}</p>
      </div>

      {/* Stock actual */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div>
            <p className="text-sm text-secondary-600 mb-2">
              Stock disponible del lote:
            </p>
            <p className="text-2xl font-bold text-secondary-900">
              {lote.cajas} cajas + {lote.sueltos} sueltos = {lote.unidades}{' '}
              unidades
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cantidad a Quitar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Cajas */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Cajas a quitar
                </label>
                <input
                  type="number"
                  min="0"
                  max={lote.cajas}
                  value={formData.cajas}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0)
                    setFormData({
                      ...formData,
                      cajas: Math.min(val, lote.cajas),
                    })
                  }}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Maximo {lote.cajas} cajas disponibles
                </p>
              </div>

              {/* Sueltos */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sueltos a quitar
                </label>
                <input
                  type="number"
                  min="0"
                  max={lote.sueltos}
                  value={formData.sueltos}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0)
                    setFormData({
                      ...formData,
                      sueltos: Math.min(val, lote.sueltos),
                    })
                  }}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Maximo {lote.sueltos} sueltos disponibles
                </p>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Motivo <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.motivo}
                  onChange={(e) =>
                    setFormData({ ...formData, motivo: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Rotura">Rotura</option>
                  <option value="Vencimiento">Vencimiento</option>
                  <option value="Devolucion">Devolucion</option>
                  <option value="Deterioro">Deterioro</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Resumen */}
            <div
              className={`p-4 rounded-lg border ${
                excede
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <p
                className={`text-sm font-medium mb-2 ${
                  excede ? 'text-red-900' : 'text-yellow-900'
                }`}
              >
                {excede ? 'Error' : 'Resumen'}
              </p>
              <div
                className={`space-y-1 text-sm ${
                  excede ? 'text-red-800' : 'text-yellow-800'
                }`}
              >
                <p>
                  Unidades a quitar: <strong>{unidadesAQuitar}</strong>
                </p>
                <p>
                  Stock resultante:{' '}
                  <strong>{lote.unidades - unidadesAQuitar} unidades</strong>
                </p>
                {excede && (
                  <p className="text-red-700 font-semibold">
                    No hay suficiente stock en este lote
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advertencia */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Atencion:</strong> Esta accion registrara una perdida de
            inventario. El stock se descontara permanentemente del lote.
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
            disabled={isSubmitting || unidadesAQuitar === 0 || excede}
            isLoading={isSubmitting}
            variant="danger"
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Quitar Stock
          </Button>
        </div>
      </form>
    </div>
  )
}
