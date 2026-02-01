'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePedidos } from '@/hooks/usePedidos'
import { PedidoCard } from '@/components/pedidos/PedidoCard'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import type { OrderStatus } from '@/types'

export default function PedidosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [filtroEstado, setFiltroEstado] = useState<OrderStatus | 'todos'>('todos')

  const { pedidos, isLoading, refetch } = usePedidos(
    filtroEstado === 'todos' ? undefined : filtroEstado
  )

  const puedeCrearPedidos =
    user?.role === 'vendedor' ||
    (user?.role === 'admin' && user?.contexto !== 'armador')

  const estados: Array<{ value: OrderStatus | 'todos'; label: string }> = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'en_preparacion', label: 'En Armado' },
    { value: 'aprobado', label: 'Aprobados' },
    { value: 'listo', label: 'Listos' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Pedidos</h1>
          <p className="text-secondary-600 mt-1">
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {puedeCrearPedidos && (
          <Button
            onClick={() => router.push('/pedidos/nuevo')}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo Pedido</span>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {estados.map((estado) => (
            <button
              key={estado.value}
              onClick={() => setFiltroEstado(estado.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filtroEstado === estado.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-700 border border-secondary-200 hover:bg-secondary-50'
              }`}
            >
              {estado.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {pedidos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No hay pedidos
          </h3>
          <p className="text-secondary-600 mb-6">
            {filtroEstado === 'todos'
              ? 'Todavía no se creó ningún pedido'
              : `No hay pedidos ${estados.find((e) => e.value === filtroEstado)?.label.toLowerCase()}`}
          </p>
          {puedeCrearPedidos && (
            <Button onClick={() => router.push('/pedidos/nuevo')}>
              Crear primer pedido
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido._id}
              pedido={pedido}
              onClick={() => router.push(`/pedidos/${pedido._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
