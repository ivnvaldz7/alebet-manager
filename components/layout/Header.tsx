'use client'

import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { Bell, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { AdminContext } from '@/types'
import toast from 'react-hot-toast'

export function Header() {
  const { user, cambiarContexto } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const handleCambiarContexto = async (nuevoContexto: AdminContext) => {
    try {
      await cambiarContexto(nuevoContexto)
      toast.success(`Cambiado a modo ${nuevoContexto}`)
      setShowContextMenu(false)
    } catch (error) {
      toast.error('Error al cambiar contexto')
    }
  }

  const getContextoBadge = () => {
    if (user?.role !== 'admin') return null

    const contexto = user.contexto || 'admin'
    const labels: Record<AdminContext, string> = {
      admin: '⚙️ Admin',
      vendedor: '💼 Vendedor',
      armador: '🎯 Armador',
    }

    return (
      <button
        onClick={() => setShowContextMenu(!showContextMenu)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-200 hover:bg-primary-100 transition-colors"
      >
        <span className="text-sm font-medium text-primary-700">
          {labels[contexto]}
        </span>
        <svg
          className="w-4 h-4 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-secondary-200 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ale-Bet"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">
                Ale-Bet Manager
              </h1>
              {user && (
                <p className="text-xs text-secondary-500">Hola, {user.name}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Context Switcher (solo admin) */}
            {user?.role === 'admin' && (
              <div className="relative">
                {getContextoBadge()}

                {/* Context Menu */}
                {showContextMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowContextMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50">
                      <button
                        onClick={() => handleCambiarContexto('admin')}
                        className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <span>⚙️</span>
                        <span className="text-sm">Administrador</span>
                      </button>
                      <button
                        onClick={() => handleCambiarContexto('vendedor')}
                        className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <span>💼</span>
                        <span className="text-sm">Vendedor</span>
                      </button>
                      <button
                        onClick={() => handleCambiarContexto('armador')}
                        className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <span>🎯</span>
                        <span className="text-sm">Armador</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <UserIcon className="h-5 w-5" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-secondary-200">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {user?.email}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-2 text-xs"
                      >
                        {user?.role === 'admin'
                          ? 'Administrador'
                          : user?.role === 'vendedor'
                          ? 'Vendedor'
                          : 'Armador'}
                      </Badge>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        window.location.href = '/perfil'
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2 text-sm text-secondary-700"
                    >
                      <UserIcon className="h-4 w-4" />
                      Mi Perfil
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          window.location.href = '/admin/panel'
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2 text-sm text-secondary-700"
                      >
                        <Settings className="h-4 w-4" />
                        Panel Admin
                      </button>
                    )}

                    <div className="border-t border-secondary-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
