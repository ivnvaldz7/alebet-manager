'use client'

import { useState, useRef, useEffect } from 'react'
import { Product } from '@/types'
import { Search, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatearStock } from '@/lib/utils/format'

interface ProductoAutocompleteProps {
  productos: Product[]
  onSelect: (producto: Product) => void
  placeholder?: string
}

export function ProductoAutocomplete({
  productos,
  onSelect,
  placeholder = 'Buscar producto...',
}: ProductoAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const resultados = query
    ? productos.filter((p) =>
        p.nombreCompleto.toLowerCase().includes(query.toLowerCase())
      )
    : []

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

  const handleSelect = (producto: Product) => {
    onSelect(producto)
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

      {isOpen && resultados.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-secondary-200 max-h-60 overflow-y-auto"
        >
          {resultados.map((producto) => (
            <button
              key={producto._id}
              onClick={() => handleSelect(producto)}
              className="w-full px-4 py-3 text-left hover:bg-secondary-50 border-b border-secondary-100 last:border-0 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-secondary-900">
                    {producto.nombreCompleto}
                  </p>
                  <p className="text-sm text-secondary-600 mt-1">
                    {formatearStock(
                      producto.stockTotal.cajas,
                      producto.stockTotal.sueltos
                    )}{' '}
                    • {producto.stockTotal.totalUnidades} unidades
                  </p>
                </div>
                {producto.stockTotal.totalUnidades <= producto.stockMinimo && (
                  <Badge variant="warning" className="ml-2">
                    Stock bajo
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && resultados.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-secondary-200 p-4 text-center">
          <Package className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
          <p className="text-sm text-secondary-600">
            No se encontraron productos
          </p>
        </div>
      )}
    </div>
  )
}
