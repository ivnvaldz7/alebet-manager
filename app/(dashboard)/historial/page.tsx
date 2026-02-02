'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download, Filter } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function HistorialPage() {
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    fechaDesde: '',
    fechaHasta: '',
  })

  // Datos dummy - después conectar con API real
  const historialCompleto = [
    {
      id: 1,
      fecha: '2025-02-01 14:30',
      accion: 'Pedido creado',
      detalle: 'PED-2025-001 - DROVET',
      usuario: 'Juan Pérez',
      tipo: 'pedido',
      status: 'pendiente',
    },
    {
      id: 2,
      fecha: '2025-02-01 14:15',
      accion: 'Stock actualizado',
      detalle: 'OLIVITASAN 500 ML - Confirmación armado',
      usuario: 'Sistema',
      tipo: 'stock',
      status: 'success',
    },
    {
      id: 3,
      fecha: '2025-02-01 13:45',
      accion: 'Pedido armado',
      detalle: 'PED-2025-002 confirmado',
      usuario: 'Carlos Gómez',
      tipo: 'pedido',
      status: 'success',
    },
  ]

  let historialFiltrado = historialCompleto

  // Filtro por búsqueda
  if (busqueda) {
    historialFiltrado = historialFiltrado.filter(
      (item) =>
        item.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.usuario.toLowerCase().includes(busqueda.toLowerCase())
    )
  }

  // Filtro por tipo
  if (filtros.tipo !== 'todos') {
    historialFiltrado = historialFiltrado.filter((item) => item.tipo === filtros.tipo)
  }

  // Filtro por fecha desde
  if (filtros.fechaDesde) {
    historialFiltrado = historialFiltrado.filter(
      (item) => item.fecha >= filtros.fechaDesde
    )
  }

  // Filtro por fecha hasta
  if (filtros.fechaHasta) {
    historialFiltrado = historialFiltrado.filter(
      (item) => item.fecha <= filtros.fechaHasta
    )
  }

  // Función de exportar a CSV
  const exportarCSV = () => {
    const csvContent = [
      ['Fecha', 'Acción', 'Detalle', 'Usuario', 'Estado'].join(','),
      ...historialFiltrado.map((item) =>
        [
          item.fecha,
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
      {/* Header */}
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

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo */}
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
                  <option value="stock">Stock</option>
                  <option value="usuario">Usuarios</option>
                </select>
              </div>

              {/* Fecha desde */}
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

              {/* Fecha hasta */}
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

            {/* Limpiar filtros */}
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

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>
            {historialFiltrado.length} registro
            {historialFiltrado.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                      {item.fecha}
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
                            : item.status === 'warning'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
