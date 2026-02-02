'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Package,
  Settings,
  BarChart3,
  FileText,
  Database,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react'

export default function PanelAdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Mostrar loading mientras carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Verificar que sea admin (después de cargar)
  if (!user || user.role !== 'admin') {
    router.push('/inicio')
    return null
  }

  const adminModules = [
    {
      title: 'Gestión de Usuarios',
      description: 'Crear, editar y eliminar usuarios del sistema',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/usuarios',
      actions: ['Agregar usuario', 'Asignar roles', 'Desactivar usuarios'],
    },
    {
      title: 'Gestión de Productos',
      description: 'Administrar productos, lotes y stock',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/productos',
      actions: ['Crear productos', 'Gestionar lotes', 'Ajustar stock'],
    },
    {
      title: 'Auditoría del Sistema',
      description: 'Ver historial completo de movimientos',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/historial',
      actions: ['Ver movimientos', 'Filtrar por usuario', 'Exportar logs'],
    },
    {
      title: 'Reportes y Analytics',
      description: 'Estadísticas de ventas y rendimiento',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/reportes',
      actions: ['Ventas por período', 'Top productos', 'Rendimiento'],
    },
    {
      title: 'Configuración',
      description: 'Ajustes generales del sistema',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      link: '/admin/configuracion',
      actions: ['Datos empresa', 'Preferencias', 'Backup'],
    },
    {
      title: 'Seguridad',
      description: 'Permisos y control de acceso',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '#',
      actions: ['Logs de acceso', 'Sesiones activas', 'Políticas'],
    },
  ]

  const stats = [
    { label: 'Usuarios activos', value: '4', icon: Users },
    { label: 'Productos totales', value: '10', icon: Package },
    { label: 'Pedidos este mes', value: '127', icon: FileText },
    { label: 'Espacio usado', value: '2.4 GB', icon: Database },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Panel de Administración
        </h1>
        <p className="text-secondary-600 mt-2">
          Control total del sistema Ale-Bet Manager
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-secondary-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Módulos administrativos */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Módulos Administrativos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => {
            const Icon = module.icon
            return (
              <Card
                key={module.title}
                className="hover:shadow-lg transition-shadow group cursor-pointer"
                onClick={() => router.push(module.link)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <p className="text-sm text-secondary-600 mt-2">
                    {module.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.actions.map((action, index) => (
                      <li
                        key={index}
                        className="text-sm text-secondary-700 flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Accesos directos */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="secondary"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => router.push('/admin/usuarios/nuevo')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Nuevo Usuario</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => router.push('/admin/productos')}
            >
              <Package className="h-6 w-6" />
              <span className="text-sm">Nuevo Producto</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => router.push('/historial')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Ver Auditoría</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => router.push('/admin/configuracion')}
            >
              <Settings className="h-6 w-6" />
              <span className="text-sm">Configuración</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
