'use client'

import { useState, useRef, useEffect } from 'react'
import { Customer } from '@/types'
import { Search, MapPin } from 'lucide-react'

interface ClienteAutocompleteProps {
  onSelect: (cliente: Customer) => void
  placeholder?: string
}

export function ClienteAutocomplete({
  onSelect,
  placeholder = 'Buscar cliente...',
}: ClienteAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [clientes, setClientes] = useState<Customer[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const buscarClientes = async () => {
      if (!query) {
        setClientes([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/clientes?q=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (data.success) {
          setClientes(data.data)
        }
      } catch (error) {
        console.error('Error buscando clientes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(buscarClientes, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (cliente: Customer) => {
    onSelect(cliente)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isOpen && (query || clientes.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-secondary-200 max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-secondary-500">
              Buscando...
            </div>
          ) : clientes.length > 0 ? (
            clientes.map((cliente) => (
              <button
                key={cliente._id}
                onClick={() => handleSelect(cliente)}
                className="w-full px-4 py-3 text-left hover:bg-secondary-50 border-b border-secondary-100 last:border-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-secondary-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">
                      {cliente.nombre}
                    </p>
                    <p className="text-sm text-secondary-600 mt-1">
                      {cliente.direccion.calle} {cliente.direccion.numero},{' '}
                      {cliente.direccion.localidad}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : query ? (
            <div className="p-4 text-center">
              <p className="text-sm text-secondary-600">
                No se encontraron clientes
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                Podés crear uno nuevo ingresando los datos manualmente
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
