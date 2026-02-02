'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import type { User } from '@/types'

export default function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usuario, setUsuario] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'vendedor' as 'admin' | 'vendedor' | 'armador',
    activo: true,
  })

  useEffect(() => {
    fetchUsuario()
  }, [])

  const fetchUsuario = async () => {
    try {
      const response = await fetch(`/api/usuarios/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setUsuario(data.data)
        setFormData({
          nombre: data.data.nombre,
          email: data.data.email,
          rol: data.data.rol,
          activo: data.data.activo,
        })
      } else {
        toast.error(data.error)
        router.push('/admin/usuarios')
      }
    } catch (error) {
      toast.error('Error cargando usuario')
      router.push('/admin/usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/usuarios/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Usuario actualizado correctamente')
        router.push('/admin/usuarios')
      } else {
        toast.error(data.error || 'Error actualizando usuario')
      }
    } catch (error) {
      toast.error('Error al actualizar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!usuario) {
    return null
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
        <h1 className="text-2xl font-bold text-secondary-900">Editar Usuario</h1>
        <p className="text-secondary-600 mt-1">
          Modificar información del usuario
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.rol}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rol: e.target.value as 'admin' | 'vendedor' | 'armador',
                  })
                }
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="vendedor">Vendedor</option>
                <option value="armador">Armador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
                className="h-5 w-5"
              />
              <label htmlFor="activo" className="text-sm text-secondary-700">
                Usuario activo (puede iniciar sesión)
              </label>
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
