'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Users, Package, FileText, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    {
      label: 'Usuarios',
      icon: Users,
      path: '/admin/usuarios',
    },
    {
      label: 'Productos',
      icon: Package,
      path: '/admin/productos',
    },
    {
      label: 'Historial',
      icon: FileText,
      path: '/historial',
    },
    {
      label: 'Reportes',
      icon: BarChart3,
      path: '/admin/reportes',
    },
    {
      label: 'Configuración',
      icon: Settings,
      path: '/admin/configuracion',
    },
  ]

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-secondary-200 min-h-screen">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-1">
            Administración
          </h2>
          <p className="text-xs text-secondary-600">Panel de control</p>
        </div>

        <nav className="flex-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.path)

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-secondary-700 hover:bg-secondary-50'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary-600')} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Tabs Mobile */}
      <div className="md:hidden relative bg-white border-b border-secondary-200">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex px-3 min-w-max">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.path)

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-3 whitespace-nowrap border-b-2 transition-colors',
                    isActive
                      ? 'border-primary-600 text-primary-700 font-medium'
                      : 'border-transparent text-secondary-600 active:text-secondary-900'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        {/* Fade gradient to indicate overflow */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </>
  )
}
