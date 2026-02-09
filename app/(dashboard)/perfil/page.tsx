'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Briefcase, Camera } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { signOut } from 'next-auth/react'
import { APP_VERSION } from '@/lib/constants/version'

export default function PerfilPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [ultimoAcceso, setUltimoAcceso] = useState<string>('')

  const [formData, setFormData] = useState({
    nombre: user?.name || '',
    email: user?.email || '',
  })

  // Estados para cambio de contraseña
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Guardar último acceso en localStorage
  useEffect(() => {
    const ahora = new Date()
    const fechaFormateada = ahora.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Recuperar último acceso anterior
    const ultimoAccesoAnterior = localStorage.getItem('ultimoAcceso')
    if (ultimoAccesoAnterior) {
      setUltimoAcceso(ultimoAccesoAnterior)
    } else {
      setUltimoAcceso(fechaFormateada)
    }

    // Guardar el acceso actual para la próxima vez
    localStorage.setItem('ultimoAcceso', fechaFormateada)
  }, [])

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      vendedor: 'Vendedor',
      armador: 'Armador',
    }
    return labels[rol] || rol
  }

  const getRolIcon = (rol: string) => {
    if (rol === 'admin') return 'A'
    if (rol === 'vendedor') return 'V'
    if (rol === 'armador') return 'R'
    return 'U'
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (passwordForm.passwordNueva !== passwordForm.passwordConfirmar) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordForm.passwordNueva.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch(`/api/usuarios/${user?.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordActual: passwordForm.passwordActual,
          passwordNueva: passwordForm.passwordNueva,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Contraseña actualizada correctamente')
        setShowChangePassword(false)
        setPasswordForm({
          passwordActual: '',
          passwordNueva: '',
          passwordConfirmar: '',
        })
      } else {
        toast.error(data.error || 'Error al cambiar contraseña')
      }
    } catch (error) {
      toast.error('Error al cambiar contraseña')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Error: No se pudo identificar el usuario')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Perfil actualizado correctamente')
        setIsEditing(false)

        // Forzar cierre de sesión y re-login
        setTimeout(async () => {
          await signOut({ redirect: false })
          window.location.href = '/login'
        }, 1500)
      } else {
        toast.error(data.error || 'Error actualizando perfil')
        setIsSaving(false)
      }
    } catch (error) {
      toast.error('Error al actualizar perfil')
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Mi Perfil</h1>
        <p className="text-secondary-600 mt-1">
          Información personal y configuración
        </p>
      </div>

      {/* Avatar y rol */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {getRolIcon(user?.role || 'vendedor')}
              </div>
              <>
                <input
                  type="file"
                  id="foto-perfil"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      toast('Función de foto próximamente', { icon: 'ℹ️' })
                    }
                  }}
                />
                <label
                  htmlFor="foto-perfil"
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-secondary-200 hover:bg-secondary-50 transition-colors cursor-pointer"
                  title="Cambiar foto"
                >
                  <Camera className="h-4 w-4 text-secondary-600" />
                </label>
              </>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-secondary-900">
                {user?.name}
              </h2>
              <p className="text-secondary-600 mt-1">{user?.email}</p>
              <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                <Badge variant="default">
                  {getRolLabel(user?.role || 'vendedor')}
                </Badge>
                {user?.role === 'admin' && user?.contexto && (
                  <Badge variant="secondary">
                    Modo: {getRolLabel(user.contexto)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información personal */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Información Personal</CardTitle>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
              <User className="h-4 w-4" />
              Nombre completo
            </label>
            <Input
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!isEditing}
              placeholder="juan@alebet.com"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
              <Briefcase className="h-4 w-4" />
              Rol
            </label>
            <Input
              value={getRolLabel(user?.role || 'vendedor')}
              disabled
              className="bg-secondary-50"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Solo el administrador puede cambiar roles
            </p>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-secondary-200">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                isLoading={isSaving}
                className="flex-1"
              >
                Guardar Cambios
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    nombre: user?.name || '',
                    email: user?.email || '',
                  })
                }}
                disabled={isSaving}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          {!showChangePassword ? (
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">
                  Cambiar contraseña
                </p>
                <p className="text-sm text-secondary-600 mt-1">
                  Actualiza tu contraseña periodicamente
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowChangePassword(true)}
              >
                Cambiar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contraseña actual <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.passwordActual}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      passwordActual: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="********"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Nueva contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.passwordNueva}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      passwordNueva: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="********"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Minimo 6 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirmar nueva contraseña{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.passwordConfirmar}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      passwordConfirmar: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="********"
                />
                {passwordForm.passwordNueva &&
                  passwordForm.passwordConfirmar &&
                  passwordForm.passwordNueva !==
                    passwordForm.passwordConfirmar && (
                    <p className="text-xs text-red-600 mt-1">
                      Las contraseñas no coinciden
                    </p>
                  )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowChangePassword(false)
                    setPasswordForm({
                      passwordActual: '',
                      passwordNueva: '',
                      passwordConfirmar: '',
                    })
                  }}
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isChangingPassword ||
                    !passwordForm.passwordActual ||
                    !passwordForm.passwordNueva ||
                    passwordForm.passwordNueva !== passwordForm.passwordConfirmar
                  }
                  isLoading={isChangingPassword}
                  className="flex-1"
                >
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Información del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary-600">Versión:</span>
            <span className="font-medium text-secondary-900">{APP_VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-600">Último acceso:</span>
            <span className="font-medium text-secondary-900">
              {ultimoAcceso || 'Cargando...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-600">ID de usuario:</span>
            <span className="font-mono text-xs text-secondary-700">
              {user?.id?.slice(0, 8) || 'N/A'}...
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
