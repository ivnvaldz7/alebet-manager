'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { usePedido } from '@/hooks/usePedidos'
import { useClientes } from '@/hooks/useClientes'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Plus, Minus, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface ProductoSeleccionado {
  producto: Product
  cajas: number
  sueltos: number
}

export default function EditarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { pedido, isLoading: pedidoLoading } = usePedido(resolvedParams.id)
  const { clientes } = useClientes()
  const { productos } = useProducts()

  const [productosSeleccionados, setProductosSeleccionados] = useState<
    ProductoSeleccionado[]
  >([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (pedido && productos.length > 0) {
      // Cargar productos del pedido existente con info actualizada
      const productosConInfo = pedido.productos
        .map((item) => {
          // Buscar el producto actualizado en la lista de productos
          const productoActualizado = productos.find(
            (p) => p._id === item.producto._id
          )
          if (!productoActualizado) return null
          return {
            producto: productoActualizado,
            cajas: item.cajas,
            sueltos: item.sueltos,
          }
        })
        .filter(Boolean) as ProductoSeleccionado[]
      setProductosSeleccionados(productosConInfo)
    }
  }, [pedido, productos])

  const agregarProducto = (producto: Product) => {
    if (productosSeleccionados.find((p) => p.producto._id === producto._id)) {
      toast.error('Este producto ya esta en el pedido')
      return
    }

    setProductosSeleccionados([
      ...productosSeleccionados,
      { producto, cajas: 0, sueltos: 0 },
    ])
    setBusquedaProducto('')
  }

  const quitarProducto = (productoId: string) => {
    setProductosSeleccionados(
      productosSeleccionados.filter((p) => p.producto._id !== productoId)
    )
  }

  const actualizarCantidad = (
    productoId: string,
    tipo: 'cajas' | 'sueltos',
    valor: number
  ) => {
    setProductosSeleccionados(
      productosSeleccionados.map((item) => {
        if (item.producto._id !== productoId) return item

        if (tipo === 'cajas') {
          return { ...item, cajas: Math.max(0, valor) }
        } else {
          const max = item.producto.stockTotal.unidadesPorCaja - 1
          return { ...item, sueltos: Math.max(0, Math.min(valor, max)) }
        }
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (productosSeleccionados.length === 0) {
      toast.error('Debes agregar al menos un producto')
      return
    }

    if (productosSeleccionados.some((p) => p.cajas === 0 && p.sueltos === 0)) {
      toast.error('Todos los productos deben tener cantidad mayor a 0')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/pedidos/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: productosSeleccionados.map((item) => ({
            producto: item.producto._id,
            cajas: item.cajas,
            sueltos: item.sueltos,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Pedido actualizado correctamente')
        router.push(`/pedidos/${resolvedParams.id}`)
      } else {
        toast.error(data.error || 'Error al actualizar pedido')
      }
    } catch (error) {
      toast.error('Error al actualizar pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (pedidoLoading || !pedido) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Solo se puede editar si está pendiente
  if (pedido.estado !== 'pendiente') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          No se puede editar este pedido
        </h2>
        <p className="text-secondary-600 mb-6">
          Solo los pedidos en estado &quot;Pendiente&quot; pueden ser editados.
          Este pedido esta en estado: <strong>{pedido.estado}</strong>
        </p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    )
  }

  const productosFiltrados = busquedaProducto
    ? productos.filter((p) =>
        p.nombreCompleto.toLowerCase().includes(busquedaProducto.toLowerCase())
      )
    : []

  const stockInsuficiente = productosSeleccionados.some((item) => {
    const requerido =
      item.cajas * item.producto.stockTotal.unidadesPorCaja + item.sueltos
    return requerido > item.producto.stockTotal.totalUnidades
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          Editar Pedido {pedido.numeroPedido}
        </h1>
        <p className="text-secondary-600 mt-1">
          Cliente: {pedido.cliente.nombre}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Productos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Productos del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Input
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                placeholder="Buscar producto para agregar..."
              />

              {/* Resultados */}
              {busquedaProducto && productosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {productosFiltrados.slice(0, 5).map((producto) => (
                    <button
                      key={producto._id}
                      type="button"
                      onClick={() => agregarProducto(producto)}
                      className="w-full px-4 py-3 text-left hover:bg-secondary-50 border-b border-secondary-100 last:border-0"
                    >
                      <p className="font-medium text-secondary-900">
                        {producto.nombreCompleto}
                      </p>
                      <p className="text-sm text-secondary-600">
                        Stock: {producto.stockTotal.totalUnidades} unidades
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de productos */}
            {productosSeleccionados.length === 0 ? (
              <div className="text-center py-8 text-secondary-600">
                No hay productos en el pedido
              </div>
            ) : (
              <div className="space-y-3">
                {productosSeleccionados.map((item) => {
                  const stockDisponible = item.producto.stockTotal.totalUnidades
                  const requerido =
                    item.cajas * item.producto.stockTotal.unidadesPorCaja +
                    item.sueltos
                  const excede = requerido > stockDisponible

                  return (
                    <div
                      key={item.producto._id}
                      className={`p-4 border-2 rounded-lg ${
                        excede
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-secondary-200'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-secondary-900">
                            {item.producto.nombreCompleto}
                          </h4>
                          <p className="text-sm text-secondary-600">
                            Stock disponible: {stockDisponible} unidades
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => quitarProducto(item.producto._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Cantidades */}
                      <div className="space-y-3">
                        {/* Cajas */}
                        <div>
                          <label className="block text-xs font-medium text-secondary-600 mb-1">
                            Cajas
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                actualizarCantidad(
                                  item.producto._id,
                                  'cajas',
                                  item.cajas - 1
                                )
                              }
                              className="p-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.cajas}
                              onChange={(e) =>
                                actualizarCantidad(
                                  item.producto._id,
                                  'cajas',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="flex-1 text-center px-2 py-2 border border-secondary-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                actualizarCantidad(
                                  item.producto._id,
                                  'cajas',
                                  item.cajas + 1
                                )
                              }
                              className="p-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Sueltos */}
                        <div>
                          <label className="block text-xs font-medium text-secondary-600 mb-1">
                            Sueltos
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                actualizarCantidad(
                                  item.producto._id,
                                  'sueltos',
                                  item.sueltos - 1
                                )
                              }
                              className="p-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={item.producto.stockTotal.unidadesPorCaja - 1}
                              value={item.sueltos}
                              onChange={(e) =>
                                actualizarCantidad(
                                  item.producto._id,
                                  'sueltos',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="flex-1 text-center px-2 py-2 border border-secondary-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                actualizarCantidad(
                                  item.producto._id,
                                  'sueltos',
                                  item.sueltos + 1
                                )
                              }
                              className="p-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="pt-2 border-t border-secondary-200">
                          <p className="text-sm text-secondary-700">
                            Total: <strong>{requerido} unidades</strong>
                            {excede && (
                              <span className="ml-2 text-yellow-700">
                                Excede stock disponible
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advertencia stock */}
        {stockInsuficiente && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">
                  Advertencia: Stock insuficiente
                </p>
                <p className="text-sm text-yellow-700">
                  Algunos productos exceden el stock disponible. El pedido se
                  guardara pero el armador debera ajustar las cantidades.
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={isSubmitting || productosSeleccionados.length === 0}
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
