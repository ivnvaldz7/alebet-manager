'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Bell, Database, Save, Download } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ConfiguracionPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Configuracion guardada')
    setIsSaving(false)
  }

  const handleBackup = async () => {
    try {
      toast.loading('Generando backup...')

      // Exportar datos principales
      const [productos, pedidos, clientes, usuarios] = await Promise.all([
        fetch('/api/productos').then((r) => r.json()),
        fetch('/api/pedidos').then((r) => r.json()),
        fetch('/api/clientes').then((r) => r.json()),
        fetch('/api/usuarios').then((r) => r.json()),
      ])

      const backup = {
        fecha: new Date().toISOString(),
        version: '1.0',
        datos: {
          productos: productos.data || [],
          pedidos: pedidos.data || [],
          clientes: clientes.data || [],
          usuarios: (usuarios.data || []).map((u: { nombre: string; email: string; rol: string; activo: boolean }) => ({
            nombre: u.nombre,
            email: u.email,
            rol: u.rol,
            activo: u.activo,
          })),
        },
      }

      // Descargar como JSON
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ale-bet-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()

      toast.dismiss()
      toast.success('Backup descargado correctamente')
    } catch (error) {
      toast.dismiss()
      toast.error('Error generando backup')
    }
  }

  const handleActivarNotificaciones = async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones')
      return
    }

    if (Notification.permission === 'granted') {
      toast.success('Las notificaciones ya estan activadas')
      // Mostrar notificacion de prueba
      new Notification('Ale-Bet Manager', {
        body: 'Las notificaciones estan funcionando correctamente',
        icon: '/logo-completo.png',
      })
      return
    }

    if (Notification.permission === 'denied') {
      toast.error(
        'Has bloqueado las notificaciones. Activalas en configuracion del navegador'
      )
      return
    }

    // Solicitar permiso
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      try {
        // Enviar al servidor
        await fetch('/api/notificaciones/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'current-user' }),
        })

        toast.success('Notificaciones activadas correctamente!')

        // Mostrar notificacion de prueba
        new Notification('Ale-Bet Manager', {
          body: 'Las notificaciones estan activadas',
          icon: '/logo-completo.png',
        })
      } catch (error) {
        toast.error('Error activando notificaciones')
      }
    } else {
      toast.error('Permiso de notificaciones denegado')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Configuracion</h1>
        <p className="text-secondary-600 mt-1">
          Ajustes generales del sistema
        </p>
      </div>

      {/* Datos de la empresa */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Datos de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre de la empresa"
            defaultValue="Laboratorio Ale-Bet"
            placeholder="Ale-Bet"
          />
          <Input
            label="CUIT"
            defaultValue="20-12345678-9"
            placeholder="20-12345678-9"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefono" placeholder="+54 11 1234-5678" />
            <Input
              label="Email"
              type="email"
              defaultValue="contacto@alebet.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">Stock critico</p>
              <p className="text-sm text-secondary-600 mt-1">
                Alertar cuando un producto este por debajo del minimo
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">
                Lotes por vencer
              </p>
              <p className="text-sm text-secondary-600 mt-1">
                Avisar 30 dias antes del vencimiento
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones Push */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              <p className="font-medium text-blue-900">
                Activar notificaciones push
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Recibe alertas en tiempo real en tu dispositivo
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleActivarNotificaciones}
            >
              Activar Ahora
            </Button>
          </div>

          <div className="text-sm text-secondary-600 space-y-2">
            <p className="font-medium">Que notificaciones recibiras?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Nuevos pedidos asignados</li>
              <li>Stock critico en productos</li>
              <li>Lotes proximos a vencer</li>
              <li>Actualizaciones del sistema</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Base de datos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">Backup de datos</p>
              <p className="text-sm text-secondary-600 mt-1">
                Exporta todos los datos del sistema
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleBackup}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Backup
            </Button>
          </div>

          <div className="p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-secondary-900">Espacio usado</p>
              <p className="text-sm font-medium text-secondary-900">~0.5 MB</p>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: '0.5%' }}
              ></div>
            </div>
            <p className="text-xs text-secondary-600 mt-2">
              Base de datos MongoDB Atlas (512 MB gratis incluidos)
            </p>
            <p className="text-xs text-secondary-500 mt-1">
              Incluye: productos, pedidos, clientes, usuarios, historial
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Boton guardar */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        isLoading={isSaving}
        className="w-full"
      >
        <Save className="h-5 w-5 mr-2" />
        Guardar Configuracion
      </Button>
    </div>
  )
}
