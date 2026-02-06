'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [producto, setProducto] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducto()
  }, [])

  const fetchProducto = async () => {
    try {
      const response = await fetch(`/api/productos/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setProducto(data.data)
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

  const eliminarLote = async (numeroLote: string) => {
    if (
      !confirm(
        `¿Eliminar lote ${numeroLote}?\n\n` +
          `Esta accion no se puede deshacer.`
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `/api/productos/${resolvedParams.id}/lotes/${numeroLote}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Lote eliminado correctamente')
        fetchProducto()
      } else {
        toast.error(data.error || 'Error al eliminar lote')
      }
    } catch (error) {
      toast.error('Error al eliminar lote')
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

  const stockBajo = producto.stockTotal.totalUnidades <= producto.stockMinimo

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {producto.nombreCompleto}
            </h1>
            <p className="text-secondary-600 mt-1">SKU: {producto.codigoSKU}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                router.push(`/admin/productos/${producto._id}/editar`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              onClick={() =>
                router.push(`/admin/productos/${producto._id}/agregar-stock`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Stock
            </Button>
          </div>
        </div>
      </div>

      {/* Info General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary-600" />
              <div>
                <p className="text-sm text-secondary-600">Stock Total</p>
                <p
                  className={`text-2xl font-bold ${
                    stockBajo ? 'text-yellow-600' : 'text-secondary-900'
                  }`}
                >
                  {producto.stockTotal.totalUnidades}
                </p>
                <p className="text-xs text-secondary-500">unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-secondary-600 mb-2">Cajas y Sueltos</p>
              <p className="text-lg font-semibold text-secondary-900">
                {producto.stockTotal.cajas} cajas + {producto.stockTotal.sueltos}{' '}
                sueltos
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                {producto.stockTotal.unidadesPorCaja} unidades por caja
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-secondary-600 mb-2">Lotes Activos</p>
              <p className="text-2xl font-bold text-secondary-900">
                {producto.lotes.length}
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                Stock minimo: {producto.stockMinimo}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta stock bajo */}
      {stockBajo && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                Stock por debajo del minimo
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Stock actual: {producto.stockTotal.totalUnidades} unidades -
                Minimo requerido: {producto.stockMinimo} unidades
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Lotes */}
      <Card>
        <CardHeader>
          <CardTitle>Lotes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {producto.lotes.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 mb-4">
                No hay lotes registrados para este producto
              </p>
              <Button
                onClick={() =>
                  router.push(`/admin/productos/${producto._id}/agregar-stock`)
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Lote
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                      Lote
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                      Stock
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                      Produccion
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                      Vencimiento
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                      Orden FIFO
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-secondary-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {producto.lotes
                    .sort((a, b) => a.orden - b.orden)
                    .map((lote) => {
                      const hoyMs = new Date().getTime()
                      const vencMs = lote.fechaVencimiento
                        ? new Date(lote.fechaVencimiento).getTime()
                        : null
                      const diasParaVencer =
                        vencMs !== null
                          ? Math.floor((vencMs - hoyMs) / (1000 * 60 * 60 * 24))
                          : null
                      const proximoAVencer =
                        diasParaVencer !== null && diasParaVencer <= 60

                      return (
                        <tr
                          key={lote.numero}
                          className="border-b border-secondary-100 hover:bg-secondary-50"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono font-medium text-secondary-900">
                              {lote.numero}
                            </span>
                            {proximoAVencer && (
                              <Badge variant="warning" className="ml-2 text-xs">
                                Vence pronto
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-secondary-900">
                              {lote.cajas} cajas + {lote.sueltos} sueltos
                            </p>
                            <p className="text-xs text-secondary-500">
                              {lote.unidades} unidades
                            </p>
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-700">
                            {new Date(lote.fechaProduccion).toLocaleDateString(
                              'es-AR',
                              {
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {lote.fechaVencimiento ? (
                              <span
                                className={
                                  proximoAVencer
                                    ? 'text-yellow-700 font-medium'
                                    : 'text-secondary-700'
                                }
                              >
                                {new Date(
                                  lote.fechaVencimiento
                                ).toLocaleDateString('es-AR', {
                                  month: 'short',
                                  year: 'numeric',
                                })}
                                {diasParaVencer !== null && (
                                  <span className="block text-xs text-secondary-500">
                                    {diasParaVencer > 0
                                      ? `${diasParaVencer} dias`
                                      : 'Vencido'}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-secondary-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                lote.orden === 1 ? 'success' : 'secondary'
                              }
                            >
                              {lote.orden === 1 ? 'Proximo' : `#${lote.orden}`}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/admin/productos/${producto._id}/lotes/${lote.numero}/ajustar`
                                  )
                                }
                                title="Ajustar cantidades"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/admin/productos/${producto._id}/lotes/${lote.numero}/quitar`
                                  )
                                }
                                title="Quitar stock (rotura/vencimiento)"
                              >
                                -
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => eliminarLote(lote.numero)}
                                title="Eliminar lote completo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
