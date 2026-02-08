'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail, X } from 'lucide-react'
import { useClientes } from '@/hooks/useClientes'
import { useAuth } from '@/hooks/useAuth'
import type { Customer, CreateCustomerInput } from '@/types'

interface ClienteForm {
  nombre: string
  calle: string
  numero: string
  localidad: string
  telefono: string
  email: string
  observaciones: string
}

const emptyForm: ClienteForm = {
  nombre: '',
  calle: '',
  numero: '',
  localidad: '',
  telefono: '',
  email: '',
  observaciones: '',
}

export default function ClientesPage() {
  const { user } = useAuth()
  const { clientes, isLoading, crearCliente, actualizarCliente, eliminarCliente } =
    useClientes()
  const [busqueda, setBusqueda] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Customer | null>(null)
  const [form, setForm] = useState<ClienteForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  const clientesFiltrados = busqueda
    ? clientes.filter((c) => {
        const q = busqueda.toLowerCase()
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.direccion.localidad.toLowerCase().includes(q) ||
          c.telefono?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
        )
      })
    : clientes

  const handleOpenCreate = () => {
    setEditando(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleOpenEdit = (cliente: Customer) => {
    setEditando(cliente)
    setForm({
      nombre: cliente.nombre,
      calle: cliente.direccion.calle,
      numero: cliente.direccion.numero,
      localidad: cliente.direccion.localidad,
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      observaciones: cliente.observaciones || '',
    })
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditando(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const payload: CreateCustomerInput = {
      nombre: form.nombre,
      direccion: {
        calle: form.calle,
        numero: form.numero,
        localidad: form.localidad,
      },
      telefono: form.telefono || undefined,
      email: form.email || undefined,
      observaciones: form.observaciones || undefined,
    }

    if (editando) {
      await actualizarCliente(editando._id, payload)
    } else {
      await crearCliente(payload)
    }

    setSubmitting(false)
    handleClose()
  }

  const handleEliminar = async (id: string, nombre: string) => {
    if (confirm(`¿Eliminar cliente "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      await eliminarCliente(id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Clientes</h1>
          <p className="text-secondary-600 mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado
            {clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, localidad, teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {clientes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No hay clientes registrados
          </h3>
          <p className="text-secondary-600 mb-6">
            Agregá el primer cliente para comenzar
          </p>
          <Button onClick={handleOpenCreate}>Crear cliente</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((cliente) => (
            <Card key={cliente._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Nombre */}
                <div className="mb-3">
                  <h3 className="font-semibold text-secondary-900 text-base">
                    {cliente.nombre}
                  </h3>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm text-secondary-600 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary-400" />
                    <span>
                      {cliente.direccion.calle} {cliente.direccion.numero},{' '}
                      {cliente.direccion.localidad}
                    </span>
                  </div>
                  {cliente.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-secondary-400" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-secondary-400" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.observaciones && (
                    <p className="text-xs text-secondary-500 italic truncate">
                      {cliente.observaciones}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-3 border-t border-secondary-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenEdit(cliente)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  {user?.role === 'admin' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleEliminar(cliente._id, cliente.nombre)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {clientesFiltrados.length === 0 && busqueda && (
            <div className="col-span-full text-center py-8">
              <p className="text-secondary-500">
                Sin resultados para &quot;{busqueda}&quot;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />

          {/* Mobile: bottom sheet */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-secondary-200 max-h-[90vh] overflow-y-auto">
            <div className="w-8 h-1 bg-secondary-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <FormContent
              form={form}
              setForm={setForm}
              editando={editando}
              submitting={submitting}
              onSubmit={handleSubmit}
              onClose={handleClose}
            />
          </div>

          {/* Desktop: centered modal */}
          <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-secondary-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <FormContent
                form={form}
                setForm={setForm}
                editando={editando}
                submitting={submitting}
                onSubmit={handleSubmit}
                onClose={handleClose}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function FormContent({
  form,
  setForm,
  editando,
  submitting,
  onSubmit,
  onClose,
}: {
  form: ClienteForm
  setForm: (f: ClienteForm) => void
  editando: Customer | null
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-secondary-900">
          {editando ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-secondary-400 hover:text-secondary-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          placeholder="Nombre del cliente"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Calle *"
            placeholder="Calle"
            value={form.calle}
            onChange={(e) => setForm({ ...form, calle: e.target.value })}
            required
          />
          <Input
            label="Número *"
            placeholder="Nro."
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            required
          />
        </div>

        <Input
          label="Localidad *"
          placeholder="Ciudad / localidad"
          value={form.localidad}
          onChange={(e) => setForm({ ...form, localidad: e.target.value })}
          required
        />

        <Input
          label="Teléfono"
          placeholder="+54 9 11 1234-5678"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />

        <Input
          label="Email"
          type="email"
          placeholder="cliente@ejemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Observaciones
          </label>
          <textarea
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={3}
            placeholder="Notas adicionales..."
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
