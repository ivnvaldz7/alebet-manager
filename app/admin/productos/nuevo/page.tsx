'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Package, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [skuManual, setSkuManual] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    presentacion: '',
    codigoSKU: '',
    unidadesPorCaja: 20,
    stockMinimo: 100,
  })

  // Auto-generar SKU basado en el nombre
  useEffect(() => {
    if (formData.nombre && !skuManual) {
      const iniciales = formData.nombre
        .split(' ')
        .map((palabra) => palabra[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      setFormData((prev) => ({ ...prev, codigoSKU: iniciales }))
    }
  }, [formData.nombre, skuManual])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!formData.presentacion.trim()) {
      toast.error('La presentación es requerida')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          variante: null,
          presentacion: formData.presentacion.trim(),
          codigoSKU: formData.codigoSKU.trim() || generarSKU(formData.nombre, formData.presentacion),
          unidadesPorCaja: formData.unidadesPorCaja,
          stockMinimo: formData.stockMinimo,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Producto creado exitosamente')
        router.push('/admin/productos')
      } else {
        toast.error(data.error || 'Error al crear producto')
      }
    } catch (error) {
      toast.error('Error al crear producto')
    } finally {
      setIsLoading(false)
    }
  }

  // Generar SKU automático si no se proporciona
  const generarSKU = (nombre: string, presentacion: string): string => {
    const iniciales = nombre
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 3)

    const pres = presentacion.replace(/\s/g, '').toUpperCase()

    return `${iniciales}-${pres}`
  }

  // Preview del SKU
  const skuPreview = formData.codigoSKU ||
    (formData.nombre && formData.presentacion
      ? generarSKU(formData.nombre, formData.presentacion)
      : 'XXX-000ML')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-secondary-900">
          Nuevo Producto
        </h1>
        <p className="text-secondary-600 mt-1">
          Agregar un nuevo producto al catálogo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Datos del Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Nombre del Producto *
              </label>
              <Input
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej: OLIVITASAN"
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                Nombre principal del producto sin variante ni presentación
              </p>
            </div>

            {/* Presentación con datalist */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Presentación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.presentacion}
                onChange={(e) =>
                  setFormData({ ...formData, presentacion: e.target.value })
                }
                placeholder="500 ML"
                list="presentaciones-comunes"
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <datalist id="presentaciones-comunes">
                <option value="25 ML" />
                <option value="100 ML" />
                <option value="250 ML" />
                <option value="500 ML" />
                <option value="1 L" />
                <option value="5 L" />
              </datalist>
              <p className="text-xs text-secondary-500 mt-1">
                Formato recomendado: "100 ML" o "1 L"
              </p>
            </div>

            {/* Código SKU */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Código SKU
              </label>
              <Input
                value={formData.codigoSKU}
                onChange={(e) => {
                  setSkuManual(true)
                  setFormData({ ...formData, codigoSKU: e.target.value.toUpperCase() })
                }}
                placeholder="Auto-generado"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Se genera automáticamente. Edita solo si es necesario.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Unidades por Caja con datalist */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Unidades por caja <span className="text-red-500">*</span>
                </label>
                <input
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
                  list="unidades-comunes"
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <datalist id="unidades-comunes">
                  <option value="12" />
                  <option value="15" />
                  <option value="20" />
                  <option value="24" />
                  <option value="40" />
                </datalist>
                <p className="text-xs text-secondary-500 mt-1">
                  Valores comunes: 12, 20, 24, 40
                </p>
              </div>

              {/* Stock Mínimo */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Stock Mínimo
                </label>
                <Input
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockMinimo: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Alerta cuando el stock sea menor
                </p>
              </div>
            </div>

            {/* Preview mejorado */}
            {formData.nombre && formData.presentacion && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-primary-700 mb-1">Vista previa:</p>
                <p className="font-semibold text-primary-900 text-lg">
                  {formData.nombre} {formData.presentacion}
                </p>
                <p className="text-sm text-primary-600 mt-1">
                  SKU: {formData.codigoSKU || 'Generando...'}
                </p>
              </div>
            )}

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
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Producto
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
