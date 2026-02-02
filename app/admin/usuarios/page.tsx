'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserX,
  UserCheck,
} from 'lucide-react'
import { useUsuarios } from '@/hooks/useUsuarios'

export default function UsuariosPage() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const { usuarios, isLoading, actualizarUsuario, eliminarUsuario } = useUsuarios()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const usuariosFiltrados = busqueda
    ? usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    : usuarios

  const getRolBadge = (rol: string) => {
    const config: Record<string, { variant: 'default' | 'info' | 'success'; label: string }> = {
      admin: { variant: 'default', label: 'Admin' },
      vendedor: { variant: 'info', label: 'Vendedor' },
      armador: { variant: 'success', label: 'Armador' },
    }
    return config[rol] || config.vendedor
  }

  const getRolIcon = (rol: string) => {
    if (rol === 'admin') return 'A'
    if (rol === 'vendedor') return 'V'
    if (rol === 'armador') return 'R'
    return 'U'
  }

  const handleDesactivar = async (id: string, nombre: string) => {
    if (confirm(`¿Desactivar usuario ${nombre}?`)) {
      await actualizarUsuario(id, { activo: false })
    }
  }

  const handleActivar = async (id: string, nombre: string) => {
    await actualizarUsuario(id, { activo: true })
  }

  const handleEliminar = async (id: string, nombre: string) => {
    if (
      confirm(
        `¿ELIMINAR PERMANENTEMENTE a ${nombre}?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      await eliminarUsuario(id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Usuarios</h1>
          <p className="text-secondary-600 mt-1">
            Gestión de usuarios del sistema
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/usuarios/nuevo')}
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <Input
              type="text"
              placeholder="Buscar usuarios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      {usuarios.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No hay usuarios
          </h3>
          <p className="text-secondary-600 mb-6">
            Crea el primer usuario para comenzar
          </p>
          <Button onClick={() => router.push('/admin/usuarios/nuevo')}>
            Crear usuario
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuariosFiltrados.map((usuario) => {
            const rolConfig = getRolBadge(usuario.rol)
            return (
              <Card
                key={usuario._id}
                className={`${
                  !usuario.activo ? 'opacity-60 border-secondary-300' : ''
                }`}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                        {getRolIcon(usuario.rol)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900">
                          {usuario.nombre}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          {usuario.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <Badge variant={rolConfig.variant}>{rolConfig.label}</Badge>
                    <Badge variant={usuario.activo ? 'success' : 'secondary'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-4 border-t border-secondary-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/usuarios/${usuario._id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>

                    {usuario.activo ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleDesactivar(usuario._id, usuario.nombre)
                        }
                        title="Desactivar usuario"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleActivar(usuario._id, usuario.nombre)
                        }
                        title="Activar usuario"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleEliminar(usuario._id, usuario.nombre)}
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
