'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react'
import { usePedidos } from '@/hooks/usePedidos'
import { useProducts } from '@/hooks/useProducts'

const PERIODOS = [
  { label: 'Este mes', value: 'mes' },
  { label: 'Últimos 3 meses', value: 'trimestre' },
  { label: 'Este año', value: 'anio' },
] as const

type Periodo = (typeof PERIODOS)[number]['value']

export default function ReportesPage() {
  const { pedidos, isLoading: pedidosLoading } = usePedidos()
  const { productos, isLoading: productosLoading } = useProducts()
  const [periodo, setPeriodo] = useState<Periodo>('mes')

  const isLoading = pedidosLoading || productosLoading

  const fechaCorte = useMemo(() => {
    const ahora = new Date()
    if (periodo === 'mes') {
      return new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    } else if (periodo === 'trimestre') {
      const d = new Date(ahora)
      d.setMonth(d.getMonth() - 3)
      return d
    } else {
      return new Date(ahora.getFullYear(), 0, 1)
    }
  }, [periodo])

  const pedidosPeriodo = useMemo(
    () =>
      pedidos.filter((p) => {
        const fecha = new Date(p.fechaCreacion)
        return fecha >= fechaCorte && p.estado !== 'cancelado'
      }),
    [pedidos, fechaCorte]
  )

  const stats = useMemo(() => {
    const totalPedidos = pedidosPeriodo.length
    const totalUnidades = pedidosPeriodo.reduce(
      (sum, p) => sum + p.productos.reduce((s, prod) => s + prod.totalUnidades, 0),
      0
    )
    const pedidosEntregados = pedidosPeriodo.filter((p) => p.estado === 'listo').length
    const pedidosPendientes = pedidosPeriodo.filter((p) => p.estado === 'pendiente').length

    return { totalPedidos, totalUnidades, pedidosEntregados, pedidosPendientes }
  }, [pedidosPeriodo])

  const topProductos = useMemo(() => {
    const acumulado: Record<string, { nombre: string; sku: string; unidades: number }> = {}
    pedidosPeriodo.forEach((p) => {
      p.productos.forEach((prod) => {
        if (!acumulado[prod.productoId]) {
          acumulado[prod.productoId] = {
            nombre: prod.nombreCompleto,
            sku: prod.codigoSKU,
            unidades: 0,
          }
        }
        acumulado[prod.productoId].unidades += prod.totalUnidades
      })
    })
    return Object.values(acumulado)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5)
  }, [pedidosPeriodo])

  const ventasPorVendedor = useMemo(() => {
    const acumulado: Record<string, { nombre: string; pedidos: number }> = {}
    pedidosPeriodo.forEach((p) => {
      const id = p.creadoPor?._id || 'desconocido'
      if (!acumulado[id]) {
        acumulado[id] = { nombre: p.creadoPor?.nombre || 'Desconocido', pedidos: 0 }
      }
      acumulado[id].pedidos++
    })
    return Object.values(acumulado).sort((a, b) => b.pedidos - a.pedidos)
  }, [pedidosPeriodo])

  const stockStats = useMemo(() => {
    const activos = productos.filter((p) => p.activo).length
    const stockBajo = productos.filter(
      (p) => p.activo && p.stockTotal.totalUnidades <= p.stockMinimo
    ).length
    return { total: productos.length, activos, stockBajo }
  }, [productos])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Reportes y Analytics</h1>
          <p className="text-secondary-600 mt-1">Métricas del negocio en tiempo real</p>
        </div>

        {/* Selector período */}
        <div className="flex gap-1 bg-secondary-100 p-1 rounded-lg">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                periodo === p.value
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalPedidos}</p>
                <p className="text-xs text-secondary-500">Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalUnidades}</p>
                <p className="text-xs text-secondary-500">Unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.pedidosEntregados}
                </p>
                <p className="text-xs text-secondary-500">Entregados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.pedidosPendientes}
                </p>
                <p className="text-xs text-secondary-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top productos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              Productos más pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProductos.length === 0 ? (
              <p className="text-sm text-secondary-500 py-4 text-center">
                Sin datos en este período
              </p>
            ) : (
              <div className="space-y-3">
                {topProductos.map((prod, i) => {
                  const max = topProductos[0]?.unidades || 1
                  const pct = Math.round((prod.unidades / max) * 100)
                  return (
                    <div key={prod.sku}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-secondary-400 w-4">
                            #{i + 1}
                          </span>
                          <span className="text-sm text-secondary-800 truncate">
                            {prod.nombre}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-secondary-900 ml-2 shrink-0">
                          {prod.unidades} u.
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ventas por vendedor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Pedidos por vendedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ventasPorVendedor.length === 0 ? (
              <p className="text-sm text-secondary-500 py-4 text-center">
                Sin datos en este período
              </p>
            ) : (
              <div className="space-y-3">
                {ventasPorVendedor.map((v, i) => {
                  const max = ventasPorVendedor[0]?.pedidos || 1
                  const pct = Math.round((v.pedidos / max) * 100)
                  return (
                    <div key={v.nombre}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-secondary-400 w-4">
                            #{i + 1}
                          </span>
                          <span className="text-sm text-secondary-800">{v.nombre}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {v.pedidos} pedido{v.pedidos !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Estado del inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-secondary-50 rounded-lg">
                <p className="text-2xl font-bold text-secondary-900">{stockStats.total}</p>
                <p className="text-xs text-secondary-500 mt-1">Total productos</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{stockStats.activos}</p>
                <p className="text-xs text-secondary-500 mt-1">Activos</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{stockStats.stockBajo}</p>
                <p className="text-xs text-secondary-500 mt-1">Stock bajo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen período */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Resumen del período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  label: 'Tasa de entrega',
                  value:
                    stats.totalPedidos > 0
                      ? `${Math.round((stats.pedidosEntregados / stats.totalPedidos) * 100)}%`
                      : '—',
                  color: 'text-green-600',
                },
                {
                  label: 'Promedio unidades/pedido',
                  value:
                    stats.totalPedidos > 0
                      ? Math.round(stats.totalUnidades / stats.totalPedidos).toString()
                      : '—',
                  color: 'text-blue-600',
                },
                {
                  label: 'Pedidos cancelados',
                  value: pedidos
                    .filter((p) => {
                      const fecha = new Date(p.fechaCreacion)
                      return fecha >= fechaCorte && p.estado === 'cancelado'
                    })
                    .length.toString(),
                  color: 'text-red-600',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0"
                >
                  <span className="text-sm text-secondary-600">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
