'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import { useUsuarios } from '@/hooks/useUsuarios'

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const { crearUsuario } = useUsuarios()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'vendedor',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await crearUsuario(formData)

    if (result.success) {
      router.push('/admin/usuarios')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-secondary-900">Nuevo Usuario</h1>
        <p className="text-secondary-600 mt-1">
          Crear una nueva cuenta de usuario
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Datos del Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre completo"
              required
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Juan Pérez"
            />

            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="juan@alebet.com"
            />

            <Input
              label="Contraseña temporal"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              helperText="El usuario deberá cambiarla en su primer acceso"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.rol}
                onChange={(e) =>
                  setFormData({ ...formData, rol: e.target.value })
                }
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="vendedor">Vendedor</option>
                <option value="armador">Armador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Crear Usuario
          </Button>
        </div>
      </form>
    </div>
  )
}
