'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, PackagePlus, Boxes, Plus, Minus, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

// Calcular vencimiento (2 años después de producción)
const calcularVencimiento = (fechaProd: string): string => {
  if (!fechaProd) return ''

  const [año, mes] = fechaProd.split('-').map(Number)
  const añoVenc = año + 2

  return `${añoVenc}-${mes.toString().padStart(2, '0')}`
}

export default function AgregarStockPage() {
  const router = useRouter()
  const params = useParams()
  const productoId = params.id as string

  const fechaActual = new Date().toISOString().slice(0, 7) // YYYY-MM

  const [producto, setProducto] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tipoOperacion, setTipoOperacion] = useState<'agregar' | 'ajustar' | 'quitar'>('agregar')
  const [formData, setFormData] = useState({
    cajas: 0,
    sueltos: 0,
    fechaProduccion: fechaActual,
    fechaVencimiento: calcularVencimiento(fechaActual),
    motivo: 'Ingreso de mercaderia',
  })

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await fetch(`/api/productos/${productoId}`)
        const data = await res.json()

        if (data.success) {
          setProducto(data.data)
        } else {
          toast.error('Producto no encontrado')
          router.push('/admin/productos')
        }
      } catch (error) {
        toast.error('Error al cargar producto')
        router.push('/admin/productos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducto()
  }, [productoId, router])

  // Actualizar motivo cuando cambia el tipo de operación
  useEffect(() => {
    const motivos = {
      agregar: 'Ingreso de mercaderia',
      ajustar: 'Ajuste de inventario',
      quitar: 'Rotura/Vencimiento',
    }
    setFormData(prev => ({ ...prev, motivo: motivos[tipoOperacion] }))
  }, [tipoOperacion])

  const handleCajasChange = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, cajas: parseInt(soloNumeros) || 0 }))
  }

  const handleSueltosChange = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '')
    const num = parseInt(soloNumeros) || 0
    if (producto && num < producto.stockTotal.unidadesPorCaja) {
      setFormData(prev => ({ ...prev, sueltos: num }))
    }
  }

  const handleFechaProduccionChange = (fecha: string) => {
    setFormData(prev => ({
      ...prev,
      fechaProduccion: fecha,
      fechaVencimiento: calcularVencimiento(fecha),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.cajas === 0 && formData.sueltos === 0) {
      toast.error('Debe especificar cajas o sueltos')
      return
    }

    if (producto && formData.sueltos >= producto.stockTotal.unidadesPorCaja) {
      toast.error(
        `Los sueltos deben ser menor a ${producto.stockTotal.unidadesPorCaja}`
      )
      return
    }

    // Validar que al quitar stock no quede negativo
    if (tipoOperacion === 'quitar' && producto) {
      const unidadesAQuitar =
        formData.cajas * producto.stockTotal.unidadesPorCaja + formData.sueltos

      if (unidadesAQuitar > producto.stockTotal.totalUnidades) {
        toast.error(
          `No puedes quitar ${unidadesAQuitar} unidades. Solo hay ${producto.stockTotal.totalUnidades} disponibles.`
        )
        return
      }
    }

    setIsSaving(true)

    try {
      const res = await fetch(`/api/productos/${productoId}/lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cajas: tipoOperacion === 'quitar' ? -formData.cajas : formData.cajas,
          sueltos: tipoOperacion === 'quitar' ? -formData.sueltos : formData.sueltos,
          fechaProduccion: formData.fechaProduccion ? `${formData.fechaProduccion}-01` : undefined,
          fechaVencimiento: formData.fechaVencimiento ? `${formData.fechaVencimiento}-01` : undefined,
          motivo: formData.motivo,
          tipoOperacion: tipoOperacion,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message || 'Stock actualizado exitosamente')
        router.push('/admin/productos')
      } else {
        toast.error(data.error || 'Error al actualizar stock')
      }
    } catch (error) {
      toast.error('Error al actualizar stock')
    } finally {
      setIsSaving(false)
    }
  }

  // Calcular unidades totales del cambio
  const unidadesCambio = producto
    ? formData.cajas * producto.stockTotal.unidadesPorCaja + formData.sueltos
    : 0

  // Calcular stock resultante
  const stockResultante = producto
    ? tipoOperacion === 'quitar'
      ? producto.stockTotal.totalUnidades - unidadesCambio
      : producto.stockTotal.totalUnidades + unidadesCambio
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!producto) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-secondary-900">Gestionar Stock</h1>
        <p className="text-secondary-600 mt-1">
          Agregar o ajustar inventario del producto
        </p>
      </div>

      {/* Info del Producto */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package className="h-8 w-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-secondary-900">
                {producto.nombreCompleto}
              </h2>
              <p className="text-sm text-secondary-600">{producto.codigoSKU}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-secondary-600">Stock actual</p>
              <p className="text-2xl font-bold text-secondary-900">
                {producto.stockTotal.totalUnidades}
              </p>
              <p className="text-xs text-secondary-500">
                {producto.stockTotal.cajas} cajas + {producto.stockTotal.sueltos}{' '}
                sueltos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipo de operación */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTipoOperacion('agregar')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
            tipoOperacion === 'agregar'
              ? 'border-green-500 bg-green-50 text-green-700 font-medium'
              : 'border-secondary-300 text-secondary-600 hover:border-secondary-400'
          }`}
        >
          <Plus className="h-4 w-4" />
          Agregar Stock
        </button>
        <button
          type="button"
          onClick={() => setTipoOperacion('ajustar')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
            tipoOperacion === 'ajustar'
              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
              : 'border-secondary-300 text-secondary-600 hover:border-secondary-400'
          }`}
        >
          <Settings2 className="h-4 w-4" />
          Ajustar
        </button>
        <button
          type="button"
          onClick={() => setTipoOperacion('quitar')}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
            tipoOperacion === 'quitar'
              ? 'border-red-500 bg-red-50 text-red-700 font-medium'
              : 'border-secondary-300 text-secondary-600 hover:border-secondary-400'
          }`}
        >
          <Minus className="h-4 w-4" />
          Quitar Stock
        </button>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            {tipoOperacion === 'agregar' && 'Nuevo Lote'}
            {tipoOperacion === 'ajustar' && 'Ajuste de Inventario'}
            {tipoOperacion === 'quitar' && 'Quitar del Inventario'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cajas y Sueltos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Cajas
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.cajas || ''}
                  onChange={(e) => handleCajasChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 text-center text-lg border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  {producto.stockTotal.unidadesPorCaja} unidades por caja
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sueltos
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.sueltos || ''}
                  onChange={(e) => handleSueltosChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 text-center text-lg border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Maximo {producto.stockTotal.unidadesPorCaja - 1} sueltos
                </p>
              </div>
            </div>

            {/* Fechas - Solo para agregar */}
            {tipoOperacion === 'agregar' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Fecha de Produccion <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.fechaProduccion}
                    onChange={(e) => handleFechaProduccionChange(e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

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
                    Se calcula automaticamente (+2 años)
                  </p>
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Motivo
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Motivo del movimiento"
              />
            </div>

            {/* Resumen */}
            <div className={`rounded-lg p-4 ${
              tipoOperacion === 'quitar' ? 'bg-red-50' :
              tipoOperacion === 'ajustar' ? 'bg-blue-50' : 'bg-primary-50'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Boxes className={`h-5 w-5 ${
                  tipoOperacion === 'quitar' ? 'text-red-600' :
                  tipoOperacion === 'ajustar' ? 'text-blue-600' : 'text-primary-600'
                }`} />
                <p className={`font-medium ${
                  tipoOperacion === 'quitar' ? 'text-red-900' :
                  tipoOperacion === 'ajustar' ? 'text-blue-900' : 'text-primary-900'
                }`}>
                  Resumen del movimiento
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-600">
                    Unidades a {tipoOperacion === 'quitar' ? 'quitar' : tipoOperacion === 'ajustar' ? 'ajustar' : 'ingresar'}:
                  </p>
                  <p className={`text-2xl font-bold ${
                    tipoOperacion === 'quitar' ? 'text-red-700' :
                    tipoOperacion === 'ajustar' ? 'text-blue-700' : 'text-primary-700'
                  }`}>
                    {tipoOperacion === 'quitar' ? '-' : '+'}{unidadesCambio}
                  </p>
                </div>
                <div>
                  <p className="text-secondary-600">Stock resultante:</p>
                  <p className={`text-2xl font-bold ${
                    stockResultante < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {stockResultante}
                  </p>
                </div>
              </div>
              {stockResultante < 0 && (
                <p className="text-red-600 text-sm mt-2 font-medium">
                  No hay suficiente stock para quitar esta cantidad
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving || unidadesCambio === 0 || stockResultante < 0}
                className={`flex-1 ${
                  tipoOperacion === 'quitar' ? 'bg-red-600 hover:bg-red-700' :
                  tipoOperacion === 'ajustar' ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    {tipoOperacion === 'agregar' && <Plus className="h-4 w-4 mr-2" />}
                    {tipoOperacion === 'ajustar' && <Settings2 className="h-4 w-4 mr-2" />}
                    {tipoOperacion === 'quitar' && <Minus className="h-4 w-4 mr-2" />}
                    {tipoOperacion === 'agregar' && 'Agregar Lote'}
                    {tipoOperacion === 'ajustar' && 'Aplicar Ajuste'}
                    {tipoOperacion === 'quitar' && 'Quitar Stock'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
