'use client'

import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { usePedidos } from '@/hooks/usePedidos'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Package,
  Archive,
  AlertTriangle,
  TrendingUp,
  Plus,
  FileText,
  MessageCircle,
  Crown,
  ArrowRight,
} from 'lucide-react'
import { useState } from 'react'

export default function InicioPage() {
  const { user } = useAuth()
  const { productos } = useProducts()
  const { pedidos } = usePedidos()
  const router = useRouter()
  const [actividadVisible, setActividadVisible] = useState(10)

  // Calcular stats reales
  const pedidosHoy = pedidos.filter((p) => {
    const hoy = new Date().toISOString().split('T')[0]
    const pedidoFecha = new Date(p.fechaCreacion).toISOString().split('T')[0]
    return pedidoFecha === hoy
  }).length

  const enArmado = pedidos.filter((p) => p.estado === 'en_preparacion').length

  const stockCritico = productos.filter(
    (p) => p.stockTotal.totalUnidades <= p.stockMinimo
  ).length

  const stats = [
    {
      title: 'Stock Crítico',
      value: stockCritico.toString(),
      subtitle: stockCritico > 0 ? `${stockCritico} producto${stockCritico !== 1 ? 's' : ''}` : null,
      icon: AlertTriangle,
      variant: stockCritico > 0 ? 'alert' : 'neutral',
      onClick: () => router.push('/stock?critico=true'),
    },
    {
      title: 'Pedidos Hoy',
      value: pedidosHoy.toString(),
      subtitle: pedidosHoy > 0 ? `Últimos ${pedidosHoy}` : null,
      icon: Package,
      variant: 'neutral',
      onClick: () => {
        const hoy = new Date().toISOString().split('T')[0]
        router.push(`/pedidos?fecha=${hoy}`)
      },
    },
    {
      title: 'En Armado',
      value: enArmado.toString(),
      subtitle: enArmado > 0 ? `En preparación` : null,
      icon: TrendingUp,
      variant: 'neutral',
      onClick: () => router.push('/pedidos?estado=en_preparacion'),
    },
    {
      title: 'Productos',
      value: productos.length.toString(),
      subtitle: 'Inventario',
      icon: Archive,
      variant: 'neutral',
      onClick: () => router.push('/stock'),
    },
  ]

  // Derivar actividad real de los pedidos cargados
  const tiempoRelativo = (fecha: string | Date) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `Hace ${mins} min`
    const hs = Math.floor(mins / 60)
    if (hs < 24) return `Hace ${hs} h`
    const dias = Math.floor(hs / 24)
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`
  }

  const actividadCompleta = pedidos
    .flatMap((p) => {
      const eventos: { action: string; user: string; date: Date; status: string }[] = []
      eventos.push({
        action: `Pedido ${p.numeroPedido} creado`,
        user: p.creadoPor?.nombre || 'Sistema',
        date: new Date(p.fechaCreacion),
        status: 'pendiente',
      })
      if (p.fechaInicioPreparacion) {
        eventos.push({
          action: `Pedido ${p.numeroPedido} en preparación`,
          user: p.armadoPor?.nombre || 'Armador',
          date: new Date(p.fechaInicioPreparacion),
          status: 'info',
        })
      }
      if (p.fechaAprobado) {
        eventos.push({
          action: `Pedido ${p.numeroPedido} aprobado`,
          user: p.armadoPor?.nombre || 'Sistema',
          date: new Date(p.fechaAprobado),
          status: 'success',
        })
      }
      if (p.fechaListo) {
        eventos.push({
          action: `Pedido ${p.numeroPedido} listo`,
          user: p.armadoPor?.nombre || 'Sistema',
          date: new Date(p.fechaListo),
          status: 'success',
        })
      }
      if (p.fechaCancelacion) {
        eventos.push({
          action: `Pedido ${p.numeroPedido} cancelado`,
          user: p.canceladoPor?.nombre || 'Sistema',
          date: new Date(p.fechaCancelacion),
          status: 'cancelado',
        })
      }
      return eventos
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50)
    .map((e) => ({ ...e, time: tiempoRelativo(e.date) }))

  const getWelcomeMessage = () => {
    if (!user) return 'Bienvenido'

    const contexto = user.contexto || user.role
    const messages: Record<string, string> = {
      admin: 'Panel de administración listo',
      vendedor: 'Listo para crear pedidos?',
      armador: 'Pedidos esperando ser armados',
    }

    return messages[contexto] || 'Bienvenido al sistema'
  }

  const getQuickActions = () => {
    const contexto = user?.contexto || user?.role

    if (contexto === 'armador') {
      return [
        {
          icon: Package,
          title: 'Ver Pendientes',
          subtitle: 'Pedidos para armar',
          action: () => router.push('/pedidos?estado=pendiente'),
        },
        {
          icon: Archive,
          title: 'Ver Stock',
          subtitle: 'Inventario actual',
          action: () => router.push('/stock'),
        },
        {
          icon: MessageCircle,
          title: 'Soporte',
          subtitle: 'WhatsApp grupo logística',
          action: () => {
            window.open(
              'https://wa.me/5491112345678?text=Hola, consulta sobre logística',
              '_blank'
            )
          },
        },
      ]
    }

    // Admin y Vendedor
    return [
      {
        icon: Plus,
        title: 'Nuevo Pedido',
        subtitle: 'Crear pedido rápido',
        action: () => router.push('/pedidos/nuevo'),
      },
      {
        icon: Archive,
        title: 'Ver Stock',
        subtitle: 'Inventario actual',
        action: () => router.push('/stock'),
      },
      {
        icon: MessageCircle,
        title: 'Soporte',
        subtitle: 'WhatsApp grupo logística',
        action: () => {
          window.open(
            'https://wa.me/5491112345678?text=Hola, necesito ayuda',
            '_blank'
          )
        },
      },
    ]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Hola, {user?.name}!
        </h1>
        <p className="text-secondary-600 mt-2">{getWelcomeMessage()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isAlert = stat.variant === 'alert'

          return (
            <button
              key={stat.title}
              onClick={stat.onClick}
              className={`
                group relative overflow-hidden
                bg-white rounded-lg
                border transition-all duration-200
                ${isAlert
                  ? 'border-orange-200 hover:border-orange-300 hover:shadow-sm'
                  : 'border-secondary-200/50 hover:border-secondary-300 hover:shadow-sm'
                }
                p-4 sm:p-5
                text-left
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            >
              {/* Header con icono pequeño */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-secondary-600 uppercase tracking-wide">
                  {stat.title}
                </span>
                <Icon className={`
                  h-4 w-4 flex-shrink-0 transition-transform duration-200
                  ${isAlert ? 'text-orange-500 group-hover:scale-110' : 'text-secondary-400'}
                `} />
              </div>

              {/* Número hero */}
              <div className="mb-2">
                <span className={`
                  text-4xl sm:text-5xl font-bold tabular-nums
                  transition-all duration-200
                  ${isAlert ? 'text-orange-600' : 'text-secondary-900 group-hover:text-primary-700'}
                `}>
                  {stat.value}
                </span>
              </div>

              {/* Subtitle funcional (solo cuando hay info útil) */}
              {stat.subtitle && (
                <div className="text-sm font-medium text-secondary-500">
                  {stat.subtitle}
                </div>
              )}

              {/* Indicador de alerta (barra sutil) */}
              {isAlert && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Actividad Reciente</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/historial')}
            className="text-primary-600 hover:text-primary-700"
          >
            Ver todo
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {actividadCompleta.length === 0 && (
              <p className="text-sm text-secondary-500 text-center py-4">
                Sin actividad registrada aún
              </p>
            )}
            {actividadCompleta.slice(0, actividadVisible).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">
                    {activity.user} - {activity.time}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.status === 'success'
                      ? 'success'
                      : activity.status === 'warning'
                      ? 'warning'
                      : activity.status === 'cancelado'
                      ? 'secondary'
                      : 'info'
                  }
                >
                  {activity.status === 'pendiente'
                    ? 'nuevo'
                    : activity.status === 'info'
                    ? 'en prep.'
                    : activity.status === 'success'
                    ? 'ok'
                    : activity.status}
                </Badge>
              </div>
            ))}

            {actividadVisible < actividadCompleta.length && (
              <button
                onClick={() => setActividadVisible(actividadVisible + 10)}
                className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Cargar más...
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {getQuickActions().map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.action}
                className="p-6 bg-white rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <p className="font-medium text-secondary-900 group-hover:text-primary-700 transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  {action.subtitle}
                </p>
              </button>
            )
          })}

          {/* Feature Premium: Chat integrado */}
          {user?.role === 'admin' && (
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300 relative overflow-hidden">
              <Badge
                variant="warning"
                className="absolute top-3 right-3 text-xs"
              >
                Premium +
              </Badge>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="font-medium text-secondary-900">Chat Integrado</p>
              <p className="text-xs text-secondary-600 mt-1">
                Grupo WhatsApp en la app
              </p>
              <p className="text-xs text-yellow-700 mt-2 font-medium">
                Próximamente
              </p>
            </div>
          )}

          {/* Feature Premium: Facturación AFIP */}
          {user?.role === 'admin' && (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 relative overflow-hidden">
              <Badge variant="info" className="absolute top-3 right-3 text-xs">
                Premium +
              </Badge>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="font-medium text-secondary-900">
                Facturación AFIP
              </p>
              <p className="text-xs text-secondary-600 mt-1">
                Facturas A/B/C automáticas
              </p>
              <p className="text-xs text-blue-700 mt-2 font-medium">
                Próximamente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
