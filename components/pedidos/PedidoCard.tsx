'use client'

import { Order } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatearFecha, formatearStock } from '@/lib/utils/format'
import { Package, User, Clock, MapPin } from 'lucide-react'

interface PedidoCardProps {
  pedido: Order
  onClick?: () => void
}

export function PedidoCard({ pedido, onClick }: PedidoCardProps) {
  const getEstadoBadge = (estado: Order['estado']) => {
    const variants = {
      pendiente: 'warning' as const,
      en_preparacion: 'info' as const,
      aprobado: 'success' as const,
      listo: 'success' as const,
      cancelado: 'secondary' as const,
    }

    const labels = {
      pendiente: 'Pendiente',
      en_preparacion: 'En Armado',
      aprobado: 'Aprobado',
      listo: 'Listo',
      cancelado: 'Cancelado',
    }

    return (
      <Badge variant={variants[estado]}>
        {labels[estado]}
      </Badge>
    )
  }

  const totalUnidades = pedido.productos.reduce(
    (sum, p) => sum + p.totalUnidades,
    0
  )

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-secondary-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-secondary-900">
            {pedido.numeroPedido}
          </h3>
          <p className="text-sm text-secondary-600 mt-1">
            {pedido.cliente.nombre}
          </p>
        </div>
        {getEstadoBadge(pedido.estado)}
      </div>

      {/* Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <MapPin className="h-4 w-4" />
          <span>
            {pedido.cliente.direccion.calle} {pedido.cliente.direccion.numero},{' '}
            {pedido.cliente.direccion.localidad}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Package className="h-4 w-4" />
          <span>
            {pedido.productos.length} producto
            {pedido.productos.length !== 1 ? 's' : ''} • {totalUnidades} unidades
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <User className="h-4 w-4" />
          <span>Creado por {pedido.creadoPor.nombre}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Clock className="h-4 w-4" />
          <span>{formatearFecha(pedido.fechaCreacion)}</span>
        </div>
      </div>

      {/* Armador */}
      {pedido.armadoPor && (
        <div className="pt-3 border-t border-secondary-100">
          <p className="text-xs text-secondary-500">
            Armador: <span className="font-medium">{pedido.armadoPor.nombre}</span>
          </p>
        </div>
      )}

      {/* Alerta stock */}
      {pedido.stockInsuficiente && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            Stock insuficiente en algunos productos
          </p>
        </div>
      )}
    </div>
  )
}
