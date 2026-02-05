'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { ProductoAutocomplete } from '@/components/productos/ProductoAutocomplete'
import { ClienteAutocomplete } from '@/components/clientes/ClienteAutocomplete'
import type { Customer } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Minus, X, Package, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface ProductoEnPedido {
  producto: Product
  cajas: number
  sueltos: number
  totalUnidades: number
}

export default function NuevoPedidoPage() {
  const router = useRouter()
  const { productos, isLoading: loadingProductos } = useProducts()

  // Estado del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    calle: '',
    numero: '',
    localidad: '',
    telefono: '',
    observaciones: '',
  })

  const [productosSeleccionados, setProductosSeleccionados] = useState<
    ProductoEnPedido[]
  >([])
  const [observaciones, setObservaciones] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const agregarProducto = (producto: Product) => {
    // Verificar si ya está agregado
    const yaExiste = productosSeleccionados.find(
      (p) => p.producto._id === producto._id
    )

    if (yaExiste) {
      toast.error('Este producto ya está en el pedido')
      return
    }

    setProductosSeleccionados([
      ...productosSeleccionados,
      {
        producto,
        cajas: 0,
        sueltos: 0,
        totalUnidades: 0,
      },
    ])
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
        if (item.producto._id === productoId) {
          const nuevaCantidad = Math.max(0, valor)
          const nuevoItem = { ...item, [tipo]: nuevaCantidad }

          // Recalcular total
          nuevoItem.totalUnidades =
            nuevoItem.cajas * item.producto.stockTotal.unidadesPorCaja +
            nuevoItem.sueltos

          return nuevoItem
        }
        return item
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!cliente.nombre.trim()) {
      toast.error('El nombre del cliente es requerido')
      return
    }

    if (!cliente.calle.trim() || !cliente.numero.trim() || !cliente.localidad.trim()) {
      toast.error('La dirección completa es requerida')
      return
    }

    if (productosSeleccionados.length === 0) {
      toast.error('Debe agregar al menos un producto')
      return
    }

    // Validar que todos los productos tengan cantidad
    const productosSinCantidad = productosSeleccionados.filter(
      (p) => p.totalUnidades === 0
    )

    if (productosSinCantidad.length > 0) {
      toast.error('Todos los productos deben tener al menos 1 unidad')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: {
            nombre: cliente.nombre,
            direccion: {
              calle: cliente.calle,
              numero: cliente.numero,
              localidad: cliente.localidad,
            },
            telefono: cliente.telefono || undefined,
            observaciones: cliente.observaciones || undefined,
          },
          productos: productosSeleccionados.map((item) => ({
            productoId: item.producto._id,
            cantidadCajas: item.cajas,
            cantidadSueltos: item.sueltos,
          })),
          observaciones,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Pedido creado exitosamente')
        router.push('/pedidos')
      } else {
        toast.error(data.error || 'Error creando pedido')
      }
    } catch (error) {
      toast.error('Error al crear el pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalUnidadesPedido = productosSeleccionados.reduce(
    (sum, p) => sum + p.totalUnidades,
    0
  )

  const totalCajasPedido = productosSeleccionados.reduce(
    (sum, p) => sum + p.cajas,
    0
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-secondary-900">Nuevo Pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buscador de clientes */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Buscar cliente frecuente
              </label>
              <ClienteAutocomplete
                onSelect={(clienteSeleccionado: Customer) => {
                  setCliente({
                    nombre: clienteSeleccionado.nombre,
                    calle: clienteSeleccionado.direccion.calle,
                    numero: clienteSeleccionado.direccion.numero,
                    localidad: clienteSeleccionado.direccion.localidad,
                    telefono: clienteSeleccionado.telefono || '',
                    observaciones: clienteSeleccionado.observaciones || '',
                  })
                }}
                placeholder="Buscar cliente por nombre..."
              />
              <p className="text-xs text-secondary-500 mt-2">
                O ingresá los datos manualmente abajo
              </p>
            </div>

            <div className="border-t border-secondary-200 pt-4">
              <Input
                label="Nombre del cliente"
                required
                value={cliente.nombre}
                onChange={(e) =>
                  setCliente({ ...cliente, nombre: e.target.value })
                }
                placeholder="Veterinaria del Sol"
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  label="Calle"
                  required
                  value={cliente.calle}
                  onChange={(e) =>
                    setCliente({ ...cliente, calle: e.target.value })
                  }
                  placeholder="San Martín"
                />
                <Input
                  label="Número"
                  required
                  value={cliente.numero}
                  onChange={(e) =>
                    setCliente({ ...cliente, numero: e.target.value })
                  }
                  placeholder="1234"
                />
              </div>

              <Input
                label="Localidad"
                required
                value={cliente.localidad}
                onChange={(e) =>
                  setCliente({ ...cliente, localidad: e.target.value })
                }
                placeholder="Buenos Aires"
                className="mt-4"
              />

              <Input
                label="Teléfono"
                type="tel"
                value={cliente.telefono}
                onChange={(e) =>
                  setCliente({ ...cliente, telefono: e.target.value })
                }
                placeholder="+54 11 1234-5678"
                className="mt-4"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={cliente.observaciones}
                  onChange={(e) =>
                    setCliente({ ...cliente, observaciones: e.target.value })
                  }
                  placeholder="Entregar por la mañana"
                  rows={2}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buscador */}
            <ProductoAutocomplete
              productos={productos}
              onSelect={agregarProducto}
              placeholder="Buscar producto para agregar..."
            />

            {/* Lista de productos */}
            {productosSeleccionados.length === 0 ? (
              <div className="text-center py-8 text-secondary-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay productos agregados</p>
                <p className="text-sm mt-1">
                  Usa el buscador para agregar productos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {productosSeleccionados.map((item) => (
                  <div
                    key={item.producto._id}
                    className="border border-secondary-200 rounded-lg p-4"
                  >
                    {/* Header del producto */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900">
                          {item.producto.nombreCompleto}
                        </h4>
                        <p className="text-sm text-secondary-600 mt-1">
                          Stock: {item.producto.stockTotal.totalUnidades} unidades •{' '}
                          {item.producto.stockTotal.unidadesPorCaja} por caja
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitarProducto(item.producto._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="space-y-4">
                      {/* Cajas */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
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
                            className="p-2 sm:p-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 flex-shrink-0"
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
                            className="flex-1 text-center px-2 sm:px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0"
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
                            className="p-2 sm:p-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 flex-shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sueltos */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
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
                            className="p-2 sm:p-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 flex-shrink-0"
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
                            className="flex-1 text-center px-2 sm:px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0"
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
                            className="p-2 sm:p-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 flex-shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="mt-3 pt-3 border-t border-secondary-100">
                      <p className="text-sm text-secondary-600">
                        Total:{' '}
                        <span className="font-semibold text-secondary-900">
                          {item.totalUnidades} unidades
                        </span>
                      </p>
                    </div>

                    {/* Alerta stock insuficiente */}
                    {item.totalUnidades >
                      item.producto.stockTotal.totalUnidades && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          Stock insuficiente. Disponible:{' '}
                          {item.producto.stockTotal.totalUnidades} unidades
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observaciones del pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Observaciones del Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre el pedido..."
              rows={3}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </CardContent>
        </Card>

        {/* Resumen */}
        {productosSeleccionados.length > 0 && (
          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Total productos:</span>
                  <span className="font-semibold text-secondary-900">
                    {productosSeleccionados.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Total cajas:</span>
                  <span className="font-semibold text-secondary-900">
                    {totalCajasPedido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Total unidades:</span>
                  <span className="text-lg font-bold text-primary-700">
                    {totalUnidadesPedido}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advertencia de stock insuficiente global */}
        {productosSeleccionados.some(
          (item) =>
            item.totalUnidades > item.producto.stockTotal.totalUnidades
        ) && (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Advertencia: Stock insuficiente
                </p>
                <p className="text-sm text-yellow-800 mb-3">
                  Este pedido incluye productos sin stock suficiente. Puedes
                  crearlo de todas formas, pero el armador debera ajustar las
                  cantidades o esperar reposicion.
                </p>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-900 mb-1">
                    Productos con problema:
                  </p>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    {productosSeleccionados
                      .filter((item) => {
                        const stockDisponible =
                          item.producto.stockTotal.totalUnidades
                        return item.totalUnidades > stockDisponible
                      })
                      .map((item) => {
                        const stockDisponible =
                          item.producto.stockTotal.totalUnidades
                        const faltante = item.totalUnidades - stockDisponible

                        return (
                          <li
                            key={item.producto._id}
                            className="flex items-center gap-2"
                          >
                            <span className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0" />
                            <span>
                              <strong>{item.producto.nombreCompleto}</strong>:
                              faltan {faltante} unidades (disponible:{' '}
                              {stockDisponible}, pedido: {item.totalUnidades})
                            </span>
                          </li>
                        )
                      })}
                  </ul>
                </div>
                <p className="text-xs text-yellow-700 mt-3 italic">
                  El pedido se marcara como &quot;Stock Insuficiente&quot; y el
                  armador sera notificado al tomarlo.
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
            Crear Pedido
          </Button>
        </div>
      </form>
    </div>
  )
}
