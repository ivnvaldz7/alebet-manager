'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Bell, Database, Save } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ConfiguracionPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Configuración guardada')
    setIsSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Configuración</h1>
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
            <Input label="Teléfono" placeholder="+54 11 1234-5678" />
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
              <p className="font-medium text-secondary-900">Stock crítico</p>
              <p className="text-sm text-secondary-600 mt-1">
                Alertar cuando un producto esté por debajo del mínimo
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
                Avisar 30 días antes del vencimiento
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
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
              <p className="font-medium text-secondary-900">Backup automático</p>
              <p className="text-sm text-secondary-600 mt-1">
                Último backup: Hoy a las 03:00
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Crear Backup
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">Espacio usado</p>
              <p className="text-sm text-secondary-600 mt-1">2.4 GB de 10 GB</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-secondary-900">24%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón guardar */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        isLoading={isSaving}
        className="w-full"
      >
        <Save className="h-5 w-5 mr-2" />
        Guardar Configuración
      </Button>
    </div>
  )
}
