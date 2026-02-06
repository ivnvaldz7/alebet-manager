'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePedido } from '@/hooks/usePedidos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  User,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatearFecha, formatearFechaHora } from '@/lib/utils/format'
import { useState, use } from 'react'

export default function DetallePedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const {
    pedido,
    isLoading,
    tomarPedido,
    confirmarPedido,
    marcarListo,
    cancelarPedido,
    refetch,
  } = usePedido(id)

  const [isProcessing, setIsProcessing] = useState(false)

  const puedeArmar =
    user?.role === 'armador' ||
    (user?.role === 'admin' && user?.contexto === 'armador')

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, any> = {
      pendiente: { variant: 'warning', label: 'Pendiente' },
      en_preparacion: { variant: 'info', label: 'En Armado' },
      aprobado: { variant: 'success', label: 'Aprobado' },
      listo: { variant: 'success', label: 'Listo' },
      cancelado: { variant: 'secondary', label: 'Cancelado' },
    }

    const config = variants[estado] || variants.pendiente

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleTomarPedido = async () => {
    setIsProcessing(true)
    const success = await tomarPedido()
    setIsProcessing(false)
    if (success) refetch()
  }

  const handleConfirmarPedido = async () => {
    if (
      !confirm(
        'CONFIRMAR ARMADO\n\n' +
          'Esta accion:\n' +
          '- Descontara el stock automaticamente (FIFO)\n' +
          '- Asignara lotes especificos\n' +
          '- Registrara los movimientos\n' +
          '- Cambiara el estado a "Aprobado"\n\n' +
          '¿Confirmar?'
      )
    ) {
      return
    }

    setIsProcessing(true)
    const success = await confirmarPedido()
    setIsProcessing(false)
    if (success) refetch()
  }

  const handleMarcarListo = async () => {
    setIsProcessing(true)
    const success = await marcarListo()
    setIsProcessing(false)
    if (success) refetch()
  }

  const handleCancelar = async () => {
    const motivo = prompt(
      '¿Por que deseas cancelar este pedido?\n\n' +
        'Ejemplos:\n' +
        '- Cliente cancelo\n' +
        '- Sin stock disponible\n' +
        '- Error en pedido\n' +
        '- Duplicado'
    )

    if (!motivo || motivo.trim() === '') {
      toast.error('Debes especificar un motivo')
      return
    }

    if (
      !confirm(
        `CANCELAR PEDIDO\n\n` +
          `Pedido: ${pedido.numeroPedido}\n` +
          `Cliente: ${pedido.cliente.nombre}\n` +
          `Motivo: ${motivo}\n\n` +
          `Esta accion no se puede deshacer.\n\n` +
          `¿Confirmar cancelacion?`
      )
    ) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/pedidos/${pedido._id}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Pedido cancelado correctamente')
        refetch()
      } else {
        toast.error(data.error || 'Error al cancelar pedido')
      }
    } catch (error) {
      toast.error('Error al cancelar pedido')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Package className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Pedido no encontrado
        </h2>
        <Button onClick={() => router.push('/pedidos')}>
          Volver a pedidos
        </Button>
      </div>
    )
  }

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {pedido.numeroPedido}
            </h1>
            <p className="text-secondary-600 mt-1">
              {formatearFecha(pedido.fechaCreacion)}
            </p>
          </div>
          {getEstadoBadge(pedido.estado)}
        </div>
      </div>

      {/* Alertas */}
      {pedido.stockInsuficiente && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">
              Stock insuficiente en algunos productos
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Este pedido tiene productos que exceden el stock disponible
            </p>
          </div>
        </div>
      )}

      {/* Cliente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-secondary-400 mt-0.5" />
            <div>
              <p className="font-medium text-secondary-900">
                {pedido.cliente.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-secondary-400 mt-0.5" />
            <div>
              <p className="text-secondary-700">
                {pedido.cliente.direccion.calle}{' '}
                {pedido.cliente.direccion.numero}
              </p>
              <p className="text-sm text-secondary-600">
                {pedido.cliente.direccion.localidad}
              </p>
            </div>
          </div>

          {pedido.cliente.telefono && (
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-secondary-400 mt-0.5" />
              <p className="text-secondary-700">{pedido.cliente.telefono}</p>
            </div>
          )}

          {pedido.cliente.observaciones && (
            <div className="pt-3 border-t border-secondary-100">
              <p className="text-sm text-secondary-600">
                <strong>Observaciones:</strong> {pedido.cliente.observaciones}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Productos del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pedido.productos.map((item, index) => (
              <div
                key={index}
                className="border border-secondary-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-secondary-900">
                      {item.nombreCompleto}
                    </h4>
                    <p className="text-sm text-secondary-600 mt-1">
                      {item.codigoSKU}
                    </p>
                  </div>
                  <Package className="h-5 w-5 text-secondary-400" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-600">Cajas</p>
                    <p className="font-semibold text-secondary-900">
                      {item.cantidadCajas}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Sueltos</p>
                    <p className="font-semibold text-secondary-900">
                      {item.cantidadSueltos}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Total</p>
                    <p className="font-semibold text-primary-600">
                      {item.totalUnidades} unid
                    </p>
                  </div>
                </div>

                {/* Lotes asignados (si ya se confirmó) */}
                {item.lotesAsignados && item.lotesAsignados.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-secondary-100">
                    <p className="text-xs font-medium text-secondary-700 mb-2">
                      Lotes utilizados:
                    </p>
                    <div className="space-y-1">
                      {item.lotesAsignados.map((lote, loteIndex) => (
                        <p key={loteIndex} className="text-xs text-secondary-600">
                          • {lote.numero}: {lote.unidades} unidades
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary-600">Creado por:</span>
            <span className="font-medium text-secondary-900">
              {pedido.creadoPor.nombre}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-secondary-600">Fecha de creación:</span>
            <span className="font-medium text-secondary-900">
              {formatearFechaHora(pedido.fechaCreacion)}
            </span>
          </div>

          {pedido.armadoPor && (
            <>
              <div className="flex justify-between">
                <span className="text-secondary-600">Armador:</span>
                <span className="font-medium text-secondary-900">
                  {pedido.armadoPor.nombre}
                </span>
              </div>

              {pedido.fechaInicioPreparacion && (
                <div className="flex justify-between">
                  <span className="text-secondary-600">Inicio armado:</span>
                  <span className="font-medium text-secondary-900">
                    {formatearFechaHora(pedido.fechaInicioPreparacion)}
                  </span>
                </div>
              )}
            </>
          )}

          {pedido.fechaAprobado && (
            <div className="flex justify-between">
              <span className="text-secondary-600">Confirmado:</span>
              <span className="font-medium text-secondary-900">
                {formatearFechaHora(pedido.fechaAprobado)}
              </span>
            </div>
          )}

          {pedido.fechaListo && (
            <div className="flex justify-between">
              <span className="text-secondary-600">Listo:</span>
              <span className="font-medium text-secondary-900">
                {formatearFechaHora(pedido.fechaListo)}
              </span>
            </div>
          )}

          {pedido.observaciones && (
            <div className="pt-3 border-t border-secondary-100">
              <p className="text-secondary-600 mb-1">Observaciones:</p>
              <p className="text-secondary-900">{pedido.observaciones}</p>
            </div>
          )}

          {/* Info de cancelación */}
          {pedido.estado === 'cancelado' && pedido.motivoCancelacion && (
            <div className="pt-3 border-t border-red-200 bg-red-50 -mx-6 px-6 py-3 -mb-6 rounded-b-lg">
              <p className="text-red-800 font-medium mb-1">Pedido cancelado</p>
              <p className="text-sm text-red-700">
                <strong>Motivo:</strong> {pedido.motivoCancelacion}
              </p>
              {pedido.canceladoPor && (
                <p className="text-sm text-red-600 mt-1">
                  Cancelado por: {pedido.canceladoPor.nombre}
                  {pedido.fechaCancelacion &&
                    ` - ${formatearFechaHora(pedido.fechaCancelacion)}`}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="space-y-3">
        {/* Tomar pedido (armador, estado pendiente) */}
        {puedeArmar && pedido.estado === 'pendiente' && (
          <Button
            onClick={handleTomarPedido}
            disabled={isProcessing}
            isLoading={isProcessing}
            className="w-full"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Tomar Pedido
          </Button>
        )}

        {/* Confirmar armado (armador, en preparación, es quien lo tomó) */}
        {puedeArmar &&
          pedido.estado === 'en_preparacion' &&
          pedido.armadoPor?._id === user?.id && (
            <Button
              onClick={handleConfirmarPedido}
              disabled={isProcessing}
              isLoading={isProcessing}
              className="w-full"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirmar Armado (Descuenta Stock)
            </Button>
          )}

        {/* Marcar como listo */}
        {puedeArmar && pedido.estado === 'aprobado' && (
          <Button
            onClick={handleMarcarListo}
            disabled={isProcessing}
            isLoading={isProcessing}
            className="w-full"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Marcar como Listo
          </Button>
        )}

        {/* Editar (solo pendiente, vendedor/admin) */}
        {pedido.estado === 'pendiente' &&
          (user?.role === 'admin' || user?.role === 'vendedor') && (
            <Button
              onClick={() => router.push(`/pedidos/${pedido._id}/editar`)}
              variant="secondary"
              className="w-full"
            >
              <Edit className="h-5 w-5 mr-2" />
              Editar Pedido
            </Button>
          )}

        {/* Cancelar (pendiente o en_preparacion, vendedor/admin) */}
        {(pedido.estado === 'pendiente' ||
          pedido.estado === 'en_preparacion') &&
          (user?.role === 'admin' || user?.role === 'vendedor') && (
            <Button
              variant="danger"
              onClick={handleCancelar}
              disabled={isProcessing}
              className="w-full"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Cancelar Pedido
            </Button>
          )}
      </div>
    </div>
  )
}
