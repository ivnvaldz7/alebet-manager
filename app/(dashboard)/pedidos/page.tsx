'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePedidos } from '@/hooks/usePedidos'
import { PedidoCard } from '@/components/pedidos/PedidoCard'
import { Button } from '@/components/ui/button'
import { Plus, Search, X, Calendar } from 'lucide-react'
import type { OrderStatus } from '@/types'

function PedidosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [filtroEstado, setFiltroEstado] = useState<OrderStatus | 'todos'>('todos')
  const [fechaFiltro, setFechaFiltro] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [ordenamiento, setOrdenamiento] = useState<'reciente' | 'antiguo' | 'cliente'>('reciente')

  // Aplicar filtro de URL al cargar
  useEffect(() => {
    const estadoParam = searchParams.get('estado')
    const fechaParam = searchParams.get('fecha')
    if (estadoParam && estadoParam !== 'todos') {
      setFiltroEstado(estadoParam as OrderStatus)
    }
    if (fechaParam) {
      setFechaFiltro(fechaParam)
    }
  }, [searchParams])

  const { pedidos: pedidosRaw, isLoading, refetch } = usePedidos()

  // Aplicar filtros localmente
  let pedidosFiltrados = pedidosRaw

  // Filtro por busqueda
  if (busqueda) {
    const busquedaLower = busqueda.toLowerCase()
    pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
      return (
        pedido.numeroPedido.toLowerCase().includes(busquedaLower) ||
        pedido.cliente.nombre.toLowerCase().includes(busquedaLower) ||
        pedido.productos.some((p) =>
          p.nombreCompleto.toLowerCase().includes(busquedaLower)
        )
      )
    })
  }

  // Filtro por estado
  if (filtroEstado !== 'todos') {
    pedidosFiltrados = pedidosFiltrados.filter(
      (pedido) => pedido.estado === filtroEstado
    )
  }

  // Filtro por fecha
  if (fechaFiltro) {
    pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
      const fechaPedido = new Date(pedido.fechaCreacion).toISOString().split('T')[0]
      return fechaPedido === fechaFiltro
    })
  }

  // Ordenamiento
  pedidosFiltrados = [...pedidosFiltrados].sort((a, b) => {
    switch (ordenamiento) {
      case 'reciente':
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      case 'antiguo':
        return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
      case 'cliente':
        return a.cliente.nombre.localeCompare(b.cliente.nombre)
      default:
        return 0
    }
  })

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

  const hayFiltrosActivos = fechaFiltro || busqueda || filtroEstado !== 'todos'

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Pedidos</h1>
          <p className="text-secondary-600 mt-1">
            {pedidosRaw.length} pedido{pedidosRaw.length !== 1 ? 's' : ''} total
            {pedidosFiltrados.length !== pedidosRaw.length &&
              ` - ${pedidosFiltrados.length} filtrado${pedidosFiltrados.length !== 1 ? 's' : ''}`}
          </p>
          {/* Badges de filtros activos */}
          {hayFiltrosActivos && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {fechaFiltro && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {new Date(fechaFiltro + 'T12:00:00').toLocaleDateString('es-AR')}
                  <button
                    onClick={() => setFechaFiltro('')}
                    className="hover:text-blue-900 ml-1"
                  >
                    x
                  </button>
                </span>
              )}
              {busqueda && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  &quot;{busqueda}&quot;
                  <button
                    onClick={() => setBusqueda('')}
                    className="hover:text-purple-900 ml-1"
                  >
                    x
                  </button>
                </span>
              )}
              {filtroEstado !== 'todos' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {estados.find((e) => e.value === filtroEstado)?.label}
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className="hover:text-green-900 ml-1"
                  >
                    x
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {puedeCrearPedidos && (
          <Button
            onClick={() => router.push('/pedidos/nuevo')}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            Nuevo Pedido
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por numero, cliente o producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtro de fecha y ordenamiento */}
      <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-5 w-5 text-secondary-600 shrink-0" />
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          {fechaFiltro && (
            <button
              onClick={() => setFechaFiltro('')}
              className="text-sm text-secondary-600 hover:text-secondary-900 shrink-0"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary-600 shrink-0">Ordenar:</span>
          <div className="flex gap-1">
            {(['reciente', 'antiguo', 'cliente'] as const).map((op) => (
              <button
                key={op}
                onClick={() => setOrdenamiento(op)}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  ordenamiento === op
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {op === 'reciente' ? 'Recientes' : op === 'antiguo' ? 'Antiguos' : 'A-Z'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros de estado */}
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
      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No hay pedidos
          </h3>
          <p className="text-secondary-600 mb-6">
            {hayFiltrosActivos
              ? 'No se encontraron pedidos con los filtros aplicados'
              : 'Todavia no se creo ningun pedido'}
          </p>
          {hayFiltrosActivos ? (
            <Button
              variant="secondary"
              onClick={() => {
                setBusqueda('')
                setFechaFiltro('')
                setFiltroEstado('todos')
              }}
            >
              Limpiar filtros
            </Button>
          ) : (
            puedeCrearPedidos && (
              <Button onClick={() => router.push('/pedidos/nuevo')}>
                Crear primer pedido
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosFiltrados.map((pedido) => (
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

export default function PedidosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <PedidosContent />
    </Suspense>
  )
}
