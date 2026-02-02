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
      title: 'Pedidos Hoy',
      value: pedidosHoy.toString(),
      change: pedidosHoy > 0 ? `+${pedidosHoy}` : '0',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => {
        const hoy = new Date().toISOString().split('T')[0]
        router.push(`/pedidos?fecha=${hoy}`)
      },
    },
    {
      title: 'En Armado',
      value: enArmado.toString(),
      change: enArmado > 0 ? `${enArmado} pendientes` : 'Todo al día',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => router.push('/pedidos?estado=en_preparacion'),
    },
    {
      title: 'Stock Crítico',
      value: stockCritico.toString(),
      change: stockCritico > 0 ? 'Revisar' : 'OK',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => router.push('/stock?critico=true'),
    },
    {
      title: 'Productos',
      value: productos.length.toString(),
      change: 'Total activos',
      icon: Archive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => router.push('/stock'),
    },
  ]

  // Actividad reciente (últimos 50, pero mostramos de a 10)
  const actividadCompleta = [
    {
      action: 'Pedido #PED-2025-001 creado',
      user: 'Juan Pérez',
      time: 'Hace 5 min',
      status: 'pendiente',
    },
    {
      action: 'Stock actualizado: Olivitasan 500ML',
      user: 'Sistema',
      time: 'Hace 12 min',
      status: 'success',
    },
    {
      action: 'Pedido #PED-2025-002 armado',
      user: 'Carlos Gómez',
      time: 'Hace 25 min',
      status: 'success',
    },
    {
      action: 'Nuevo cliente: Veterinaria Sur',
      user: 'María López',
      time: 'Hace 1 hora',
      status: 'success',
    },
    {
      action: 'Pedido #PED-2025-003 cancelado',
      user: 'Juan Pérez',
      time: 'Hace 2 horas',
      status: 'cancelado',
    },
    {
      action: 'Stock crítico: Aminoácidos 20ML',
      user: 'Sistema',
      time: 'Hace 3 horas',
      status: 'warning',
    },
    {
      action: 'Pedido #PED-2025-004 listo',
      user: 'Carlos Gómez',
      time: 'Hace 4 horas',
      status: 'success',
    },
    {
      action: 'Nuevo lote: Energizante 100ML',
      user: user?.name || 'Admin',
      time: 'Hace 5 horas',
      status: 'success',
    },
  ]

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              onClick={stat.onClick}
              className={`hover:shadow-md transition-shadow ${
                stat.isPremium ? 'border-yellow-300 relative overflow-hidden' : ''
              } ${stat.onClick ? 'cursor-pointer hover:scale-105' : ''}`}
            >
              {stat.isPremium && (
                <div className="absolute top-2 right-2">
                  <Badge variant="warning" className="text-xs">
                    Premium
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-secondary-600 mb-1">
                      {stat.title}
                    </p>
                    {stat.isPremium ? (
                      <div className="mt-2">
                        <p className="text-sm text-secondary-700 font-medium">
                          Métricas de negocio
                        </p>
                        <p className="text-xs text-secondary-500 mt-1">
                          Próximamente
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-secondary-900">
                          {stat.value}
                        </p>
                        {stat.change && (
                          <p className="text-xs text-secondary-500 mt-2">
                            {stat.change}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  {activity.status}
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
