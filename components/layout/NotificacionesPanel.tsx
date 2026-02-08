'use client'

import { useRouter } from 'next/navigation'
import { Bell, Package, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import type { Notificacion } from '@/hooks/useNotificaciones'

interface NotificacionesPanelProps {
  onClose: () => void
  notificaciones: Notificacion[]
  noLeidas: number
  isLoading: boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  timeAgo: (date: Date) => string
}

export function NotificacionesPanel({
  onClose,
  notificaciones,
  noLeidas,
  isLoading,
  markAsRead,
  markAllAsRead,
  timeAgo,
}: NotificacionesPanelProps) {
  const router = useRouter()

  const getIcon = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'pedido_pendiente':
        return <Clock className="h-5 w-5 text-orange-600" />
      case 'pedido_en_preparacion':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'pedido_listo':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'stock_critico':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Bell className="h-5 w-5 text-secondary-600" />
    }
  }

  const handleClick = (notif: Notificacion) => {
    markAsRead(notif.id)
    onClose()
    router.push(notif.link)
  }

  const panelContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-700" />
          <h3 className="font-semibold text-secondary-900">Notificaciones</h3>
          {noLeidas > 0 && (
            <Badge variant="danger" className="text-xs">
              {noLeidas} nueva{noLeidas !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-secondary-400 hover:text-secondary-600 transition-colors p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Lista */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-sm text-secondary-600">No hay notificaciones</p>
            <p className="text-xs text-secondary-400 mt-1">Todo está al día</p>
          </div>
        ) : (
          <div>
            {notificaciones.map((notif) => (
              <button
                key={notif.id}
                className={`w-full text-left p-4 border-b border-secondary-100 last:border-0 hover:bg-secondary-50 active:bg-secondary-100 transition-colors ${
                  !notif.leida ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleClick(notif)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">{getIcon(notif.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium ${
                          !notif.leida ? 'text-secondary-900' : 'text-secondary-700'
                        }`}
                      >
                        {notif.titulo}
                      </p>
                      {!notif.leida && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-secondary-600 mt-1 truncate">
                      {notif.mensaje}
                    </p>
                    <p className="text-xs text-secondary-500 mt-2">
                      {timeAgo(notif.fecha)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notificaciones.length > 0 && (
        <div className="p-3 border-t border-secondary-200 bg-secondary-50 shrink-0">
          <div className="flex gap-2">
            {noLeidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                onClick={() => {
                  markAllAsRead()
                  toast.success('Notificaciones marcadas como leídas')
                }}
              >
                Marcar todas leídas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-secondary-600 hover:text-secondary-700"
              onClick={() => {
                onClose()
                router.push('/pedidos')
              }}
            >
              Ver pedidos
            </Button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Mobile: bottom sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-secondary-200 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="w-8 h-1 bg-secondary-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />
        {panelContent}
      </div>

      {/* Desktop: dropdown */}
      <div className="hidden md:flex absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-secondary-200 z-50 max-h-[32rem] overflow-hidden flex-col">
        {panelContent}
      </div>
    </>
  )
}
