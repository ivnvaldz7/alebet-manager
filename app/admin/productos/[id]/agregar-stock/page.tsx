'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PackagePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function AgregarStockPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [producto, setProducto] = useState<Product | null>(null)
  const [numeroLote, setNumeroLote] = useState('')
  const [loteAutomatico, setLoteAutomatico] = useState(true)
  const [formData, setFormData] = useState({
    cajas: 0,
    sueltos: 0,
    fechaProduccion: new Date().toISOString().slice(0, 7),
    fechaVencimiento: '',
  })

  useEffect(() => {
    fetchProducto()
  }, [])

  useEffect(() => {
    // Calcular vencimiento automáticamente (+2 años)
    if (formData.fechaProduccion) {
      const [año, mes] = formData.fechaProduccion.split('-').map(Number)
      const añoVenc = año + 2
      setFormData((prev) => ({
        ...prev,
        fechaVencimiento: `${añoVenc}-${mes.toString().padStart(2, '0')}`,
      }))
    }
  }, [formData.fechaProduccion])

  const generarLoteSugerido = () => {
    if (!producto) return ''
    const prefijo = producto.codigoSKU
    const numeros = producto.lotes
      .map((l) => {
        const match = l.numero.match(/\d+$/)
        return match ? parseInt(match[0], 10) : 0
      })
      .filter((num) => !isNaN(num))
    const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0
    return `${prefijo}${(maxNumero + 1).toString().padStart(4, '0')}`
  }

  useEffect(() => {
    if (producto && loteAutomatico) {
      setNumeroLote(generarLoteSugerido())
    }
  }, [producto, loteAutomatico])

  const fetchProducto = async () => {
    try {
      const response = await fetch(`/api/productos/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setProducto(data.data)
      } else {
        toast.error(data.error)
        router.back()
      }
    } catch (error) {
      toast.error('Error cargando producto')
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
      toast.error('Debes agregar al menos cajas o sueltos')
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
        `/api/productos/${resolvedParams.id}/lotes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numeroLote: numeroLote || generarLoteSugerido(),
            cajas: formData.cajas,
            sueltos: formData.sueltos,
            fechaProduccion: formData.fechaProduccion,
            fechaVencimiento: formData.fechaVencimiento,
            motivo: 'Ingreso de mercadería',
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Lote agregado correctamente')
        router.push(`/admin/productos/${resolvedParams.id}`)
      } else {
        toast.error(data.error || 'Error al agregar lote')
      }
    } catch (error) {
      toast.error('Error al agregar lote')
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

  const unidadesTotales =
    formData.cajas * producto.stockTotal.unidadesPorCaja + formData.sueltos

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
          Agregar Nuevo Lote
        </h1>
        <p className="text-secondary-600 mt-1">{producto.nombreCompleto}</p>
      </div>

      {/* Info actual */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Stock actual:</p>
              <p className="text-2xl font-bold text-secondary-900">
                {producto.stockTotal.totalUnidades} unidades
              </p>
              <p className="text-sm text-secondary-600 mt-1">
                {producto.lotes.length} lote
                {producto.lotes.length !== 1 ? 's' : ''} activo
                {producto.lotes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <PackagePlus className="h-12 w-12 text-primary-600" />
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuevo Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Numero de Lote */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Numero de Lote <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setLoteAutomatico(!loteAutomatico)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {loteAutomatico ? 'Ingresar manual' : 'Usar automatico'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={numeroLote}
                  onChange={(e) => {
                    setNumeroLote(e.target.value.toUpperCase())
                    setLoteAutomatico(false)
                  }}
                  disabled={loteAutomatico}
                  className={`w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono ${
                    loteAutomatico ? 'bg-secondary-50 text-secondary-600' : ''
                  }`}
                  placeholder={generarLoteSugerido()}
                />
                {loteAutomatico && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Automatico
                    </span>
                  </div>
                )}
              </div>
              {!loteAutomatico && (
                <p className="text-xs text-secondary-500 mt-1">
                  Sugerido: <span className="font-mono font-semibold">{generarLoteSugerido()}</span>
                </p>
              )}
            </div>

            {/* Cantidades */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Cantidades
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
                        cajas: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    {producto.stockTotal.unidadesPorCaja} unidades por caja
                  </p>
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
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0)
                      const max = producto.stockTotal.unidadesPorCaja - 1
                      setFormData({ ...formData, sueltos: Math.min(val, max) })
                    }}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Maximo {producto.stockTotal.unidadesPorCaja - 1} sueltos
                  </p>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Producción */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha de Produccion <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  required
                  value={formData.fechaProduccion}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaProduccion: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="month"
                  value={formData.fechaVencimiento}
                  disabled
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg bg-secondary-50 text-secondary-600"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Automatico (+2 años)
                </p>
              </div>
            </div>

            {/* Resumen */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900 mb-2">
                Resumen del ingreso
              </p>
              <div className="space-y-1 text-sm text-green-800">
                <p>
                  Unidades a ingresar: <strong>{unidadesTotales}</strong>
                </p>
                <p>
                  Stock resultante:{' '}
                  <strong>
                    {producto.stockTotal.totalUnidades + unidadesTotales}{' '}
                    unidades
                  </strong>
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
            disabled={isSubmitting || unidadesTotales === 0}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Agregar Lote
          </Button>
        </div>
      </form>
    </div>
  )
}
