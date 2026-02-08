'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download, Filter } from 'lucide-react'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { usePedidos } from '@/hooks/usePedidos'
import type { Order } from '@/types'

interface ActivityItem {
  id: string
  fecha: Date
  accion: string
  detalle: string
  usuario: string
  tipo: 'pedido'
  status: string
}

function buildActivity(pedidos: Order[]): ActivityItem[] {
  const eventos: ActivityItem[] = []

  pedidos.forEach((p) => {
    eventos.push({
      id: `${p._id}-creado`,
      fecha: new Date(p.fechaCreacion),
      accion: 'Pedido creado',
      detalle: `${p.numeroPedido} - ${p.cliente.nombre}`,
      usuario: p.creadoPor?.nombre || 'Sistema',
      tipo: 'pedido',
      status: 'pendiente',
    })
    if (p.fechaInicioPreparacion) {
      eventos.push({
        id: `${p._id}-prep`,
        fecha: new Date(p.fechaInicioPreparacion),
        accion: 'Pedido en preparación',
        detalle: `${p.numeroPedido} - ${p.cliente.nombre}`,
        usuario: p.armadoPor?.nombre || 'Armador',
        tipo: 'pedido',
        status: 'info',
      })
    }
    if (p.fechaAprobado) {
      eventos.push({
        id: `${p._id}-aprobado`,
        fecha: new Date(p.fechaAprobado),
        accion: 'Pedido aprobado',
        detalle: `${p.numeroPedido} - ${p.cliente.nombre}`,
        usuario: p.armadoPor?.nombre || 'Sistema',
        tipo: 'pedido',
        status: 'success',
      })
    }
    if (p.fechaListo) {
      eventos.push({
        id: `${p._id}-listo`,
        fecha: new Date(p.fechaListo),
        accion: 'Pedido listo',
        detalle: `${p.numeroPedido} - ${p.cliente.nombre}`,
        usuario: p.armadoPor?.nombre || 'Sistema',
        tipo: 'pedido',
        status: 'success',
      })
    }
    if (p.fechaCancelacion) {
      eventos.push({
        id: `${p._id}-cancelado`,
        fecha: new Date(p.fechaCancelacion),
        accion: 'Pedido cancelado',
        detalle: `${p.numeroPedido} - ${p.cliente.nombre}`,
        usuario: p.canceladoPor?.nombre || 'Sistema',
        tipo: 'pedido',
        status: 'cancelado',
      })
    }
  })

  return eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
}

function formatFecha(fecha: Date) {
  return fecha.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistorialPage() {
  const { pedidos, isLoading } = usePedidos()
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    fechaDesde: '',
    fechaHasta: '',
  })

  const historialCompleto = useMemo(() => buildActivity(pedidos), [pedidos])

  let historialFiltrado = historialCompleto

  if (busqueda) {
    historialFiltrado = historialFiltrado.filter(
      (item) =>
        item.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.usuario.toLowerCase().includes(busqueda.toLowerCase())
    )
  }

  if (filtros.tipo !== 'todos') {
    historialFiltrado = historialFiltrado.filter((item) => item.tipo === filtros.tipo)
  }

  if (filtros.fechaDesde) {
    historialFiltrado = historialFiltrado.filter(
      (item) => item.fecha >= new Date(filtros.fechaDesde)
    )
  }

  if (filtros.fechaHasta) {
    const hasta = new Date(filtros.fechaHasta)
    hasta.setHours(23, 59, 59, 999)
    historialFiltrado = historialFiltrado.filter((item) => item.fecha <= hasta)
  }

  const exportarCSV = () => {
    const csvContent = [
      ['Fecha', 'Acción', 'Detalle', 'Usuario', 'Estado'].join(','),
      ...historialFiltrado.map((item) =>
        [
          formatFecha(item.fecha),
          `"${item.accion}"`,
          `"${item.detalle}"`,
          item.usuario,
          item.status,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historial_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Historial exportado correctamente')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">
          Historial Completo
        </h1>
        <p className="text-secondary-600 mt-1">
          Todos los movimientos del sistema
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <Input
                type="text"
                placeholder="Buscar en historial..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="secondary"
              className="sm:w-auto"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {(filtros.tipo !== 'todos' || filtros.fechaDesde || filtros.fechaHasta) && (
                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                  Activos
                </span>
              )}
            </Button>
            <Button
              variant="secondary"
              className="sm:w-auto"
              onClick={exportarCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {mostrarFiltros && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tipo de acción
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todos">Todos</option>
                  <option value="pedido">Pedidos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            {(filtros.tipo !== 'todos' || filtros.fechaDesde || filtros.fechaHasta) && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFiltros({ tipo: 'todos', fechaDesde: '', fechaHasta: '' })
                    toast.success('Filtros eliminados')
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? 'Cargando...' : `${historialFiltrado.length} registro${historialFiltrado.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : historialFiltrado.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-8">
              Sin registros para mostrar
            </p>
          ) : (
            <>
            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-secondary-100">
              {historialFiltrado.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {item.accion}
                    </p>
                    <p className="text-sm text-secondary-600 truncate mt-0.5">
                      {item.detalle}
                    </p>
                    <p className="text-xs text-secondary-400 mt-1">
                      {item.usuario} · {formatFecha(item.fecha)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.status === 'success'
                        ? 'success'
                        : item.status === 'cancelado'
                        ? 'secondary'
                        : item.status === 'info'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {item.status === 'pendiente'
                      ? 'nuevo'
                      : item.status === 'info'
                      ? 'en prep.'
                      : item.status === 'success'
                      ? 'ok'
                      : item.status}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                      Acción
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                      Detalle
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                      Usuario
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historialFiltrado.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-secondary-600">
                        {formatFecha(item.fecha)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-secondary-900">
                        {item.accion}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary-700">
                        {item.detalle}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary-600">
                        {item.usuario}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            item.status === 'success'
                              ? 'success'
                              : item.status === 'cancelado'
                              ? 'secondary'
                              : item.status === 'info'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {item.status === 'pendiente'
                            ? 'nuevo'
                            : item.status === 'info'
                            ? 'en prep.'
                            : item.status === 'success'
                            ? 'ok'
                            : item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
