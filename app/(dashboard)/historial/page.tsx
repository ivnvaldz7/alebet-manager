'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download, Filter } from 'lucide-react'
import { useState } from 'react'

export default function HistorialPage() {
  const [busqueda, setBusqueda] = useState('')

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

  const historialFiltrado = busqueda
    ? historialCompleto.filter(
        (item) =>
          item.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
          item.detalle.toLowerCase().includes(busqueda.toLowerCase()) ||
          item.usuario.toLowerCase().includes(busqueda.toLowerCase())
      )
    : historialCompleto

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
            <Button variant="secondary" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="secondary" className="sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

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
