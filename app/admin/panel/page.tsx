'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUsuarios } from '@/hooks/useUsuarios'
import { useProducts } from '@/hooks/useProducts'
import { usePedidos } from '@/hooks/usePedidos'
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
  UserCheck,
} from 'lucide-react'

export default function PanelAdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { usuarios } = useUsuarios()
  const { productos } = useProducts()
  const { pedidos } = usePedidos()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    router.push('/inicio')
    return null
  }

  const usuariosActivos = usuarios.filter((u) => u.activo).length
  const productosTotal = productos.length

  const mesActual = new Date()
  const pedidosMes = pedidos.filter((p) => {
    const fecha = new Date(p.fechaCreacion)
    return (
      fecha.getFullYear() === mesActual.getFullYear() &&
      fecha.getMonth() === mesActual.getMonth()
    )
  }).length

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
      title: 'Gestión de Clientes',
      description: 'Base de datos de clientes',
      icon: UserCheck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      link: '/clientes',
      actions: ['Agregar cliente', 'Editar información', 'Buscar clientes'],
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
    { label: 'Usuarios activos', value: usuariosActivos.toString(), icon: Users },
    { label: 'Productos totales', value: productosTotal.toString(), icon: Package },
    { label: 'Pedidos este mes', value: pedidosMes.toString(), icon: FileText },
    { label: 'Versión', value: 'v1.3', icon: Database },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
          Panel de Administración
        </h1>
        <p className="text-secondary-600 mt-2">
          Control total del sistema Ale-Bet Manager
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold text-secondary-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-secondary-600 truncate">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Módulos */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-4">
          Módulos Administrativos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {adminModules.map((module) => {
            const Icon = module.icon
            return (
              <Card
                key={module.title}
                className="hover:shadow-lg active:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                onClick={() => router.push(module.link)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {module.title}
                  </CardTitle>
                  <p className="text-sm text-secondary-600 mt-1">
                    {module.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {module.actions.map((action, index) => (
                      <li
                        key={index}
                        className="text-sm text-secondary-700 flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
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

      {/* Accesos rápidos */}
      <Card className="mt-6 sm:mt-8">
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Button
              variant="secondary"
              className="h-auto py-3 sm:py-4 flex flex-col gap-1.5 sm:gap-2 active:scale-95 transition-transform"
              onClick={() => router.push('/admin/usuarios/nuevo')}
            >
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Nuevo Usuario</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto py-3 sm:py-4 flex flex-col gap-1.5 sm:gap-2 active:scale-95 transition-transform"
              onClick={() => router.push('/admin/productos')}
            >
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Nuevo Producto</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto py-3 sm:py-4 flex flex-col gap-1.5 sm:gap-2 active:scale-95 transition-transform"
              onClick={() => router.push('/historial')}
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Ver Auditoría</span>
            </Button>
            <Button
              variant="secondary"
              className="h-auto py-3 sm:py-4 flex flex-col gap-1.5 sm:gap-2 active:scale-95 transition-transform"
              onClick={() => router.push('/admin/configuracion')}
            >
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Configuración</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
