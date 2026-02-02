'use client'

import { useState } from 'react'
import { Bell, Package, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface Notificacion {
  id: string
  tipo: 'pedido' | 'stock' | 'sistema'
  titulo: string
  mensaje: string
  leida: boolean
  fecha: string
}

interface NotificacionesPanelProps {
  onClose: () => void
}

export function NotificacionesPanel({ onClose }: NotificacionesPanelProps) {
  // Datos dummy - después conectar con API real
  const notificacionesIniciales: Notificacion[] = [
    {
      id: '1',
      tipo: 'pedido',
      titulo: 'Nuevo pedido creado',
      mensaje: 'Pedido P-20260201-1234 de DROVET',
      leida: false,
      fecha: 'Hace 5 min',
    },
    {
      id: '2',
      tipo: 'stock',
      titulo: 'Stock crítico',
      mensaje: 'AMINOÁCIDOS 20ML tiene solo 15 unidades',
      leida: false,
      fecha: 'Hace 1 hora',
    },
    {
      id: '3',
      tipo: 'pedido',
      titulo: 'Pedido confirmado',
      mensaje: 'Pedido P-20260201-5678 listo para entrega',
      leida: true,
      fecha: 'Hace 2 horas',
    },
    {
      id: '4',
      tipo: 'sistema',
      titulo: 'Backup completado',
      mensaje: 'Backup automático realizado correctamente',
      leida: true,
      fecha: 'Hace 3 horas',
    },
  ]

  const [notificaciones, setNotificaciones] = useState(notificacionesIniciales)

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'stock':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'sistema':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-secondary-600" />
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-secondary-200 z-50 max-h-[32rem] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-secondary-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-700" />
            <h3 className="font-semibold text-secondary-900">Notificaciones</h3>
            {noLeidas > 0 && (
              <Badge variant="danger" className="text-xs">
                {noLeidas} nuevas
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1">
          {notificaciones.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-sm text-secondary-600">
                No hay notificaciones
              </p>
            </div>
          ) : (
            <div>
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors cursor-pointer ${
                    !notif.leida ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    // Marcar como leída
                    setNotificaciones(
                      notificaciones.map((n) =>
                        n.id === notif.id ? { ...n, leida: true } : n
                      )
                    )
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">{getIcon(notif.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${
                          !notif.leida ? 'text-secondary-900' : 'text-secondary-700'
                        }`}>
                          {notif.titulo}
                        </p>
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 mt-1">
                        {notif.mensaje}
                      </p>
                      <p className="text-xs text-secondary-500 mt-2">
                        {notif.fecha}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notificaciones.length > 0 && (
          <div className="p-3 border-t border-secondary-200 bg-secondary-50">
            <div className="flex gap-2">
              {noLeidas > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  onClick={() => {
                    setNotificaciones(
                      notificaciones.map((n) => ({ ...n, leida: true }))
                    )
                    toast.success('Notificaciones marcadas como leídas')
                  }}
                >
                  Marcar todas como leídas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-secondary-600 hover:text-secondary-700"
                onClick={() => {
                  // TODO: Ver todas las notificaciones
                  console.log('Ver todas')
                  onClose()
                }}
              >
                Ver todas
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
