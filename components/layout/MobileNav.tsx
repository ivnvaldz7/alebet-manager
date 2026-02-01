'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Archive, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/hooks/useAuth'

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    {
      href: '/inicio',
      label: 'Inicio',
      icon: Home,
      roles: ['admin', 'vendedor', 'armador'],
    },
    {
      href: '/pedidos',
      label: 'Pedidos',
      icon: Package,
      roles: ['admin', 'vendedor', 'armador'],
    },
    {
      href: '/stock',
      label: 'Stock',
      icon: Archive,
      roles: ['admin', 'vendedor', 'armador'],
    },
    {
      href: '/perfil',
      label: 'Perfil',
      icon: User,
      roles: ['admin', 'vendedor', 'armador'],
    },
  ]

  const visibleItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  )

  return (
    <nav className="bottom-nav">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                )}
              >
                <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5]')} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
