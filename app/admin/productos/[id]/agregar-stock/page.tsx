'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Package, PackagePlus, Boxes } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function AgregarStockPage() {
  const router = useRouter()
  const params = useParams()
  const productoId = params.id as string

  const [producto, setProducto] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    cajas: 0,
    sueltos: 0,
    fechaProduccion: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
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

    setIsSaving(true)

    try {
      const res = await fetch(`/api/productos/${productoId}/lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cajas: formData.cajas,
          sueltos: formData.sueltos,
          fechaProduccion: formData.fechaProduccion || undefined,
          fechaVencimiento: formData.fechaVencimiento || undefined,
          motivo: formData.motivo,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message || 'Stock agregado exitosamente')
        router.push('/admin/productos')
      } else {
        toast.error(data.error || 'Error al agregar stock')
      }
    } catch (error) {
      toast.error('Error al agregar stock')
    } finally {
      setIsSaving(false)
    }
  }

  // Calcular unidades totales del nuevo lote
  const unidadesNuevas = producto
    ? formData.cajas * producto.stockTotal.unidadesPorCaja + formData.sueltos
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
        <h1 className="text-2xl font-bold text-secondary-900">Agregar Stock</h1>
        <p className="text-secondary-600 mt-1">
          Agregar un nuevo lote de mercadería
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

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Nuevo Lote
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
                <Input
                  type="number"
                  name="cajas"
                  value={formData.cajas}
                  onChange={handleChange}
                  min={0}
                />
                <p className="text-xs text-secondary-500 mt-1">
                  {producto.stockTotal.unidadesPorCaja} unidades por caja
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Sueltos
                </label>
                <Input
                  type="number"
                  name="sueltos"
                  value={formData.sueltos}
                  onChange={handleChange}
                  min={0}
                  max={producto.stockTotal.unidadesPorCaja - 1}
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Máximo {producto.stockTotal.unidadesPorCaja - 1} sueltos
                </p>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha de Producción
                </label>
                <input
                  type="date"
                  name="fechaProduccion"
                  value={formData.fechaProduccion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Motivo
              </label>
              <select
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Ingreso de mercaderia">
                  Ingreso de mercadería
                </option>
                <option value="Ajuste de inventario">
                  Ajuste de inventario
                </option>
                <option value="Devolucion">Devolución</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Resumen */}
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Boxes className="h-5 w-5 text-primary-600" />
                <p className="font-medium text-primary-900">
                  Resumen del ingreso
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-600">Unidades a ingresar:</p>
                  <p className="text-2xl font-bold text-primary-700">
                    {unidadesNuevas}
                  </p>
                </div>
                <div>
                  <p className="text-secondary-600">Stock resultante:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {producto.stockTotal.totalUnidades + unidadesNuevas}
                  </p>
                </div>
              </div>
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
                disabled={isSaving || unidadesNuevas === 0}
                className="flex-1"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Agregar Lote
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
