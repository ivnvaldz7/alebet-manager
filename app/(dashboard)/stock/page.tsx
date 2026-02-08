'use client'

import { useProducts } from '@/hooks/useProducts'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Package, AlertTriangle, Search } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function StockContent() {
  const { productos, isLoading } = useProducts()
  const [busqueda, setBusqueda] = useState('')
  const searchParams = useSearchParams()
  const mostrarCritico = searchParams.get('critico') === 'true'

  let productosFiltrados = productos

  // Filtro de búsqueda
  if (busqueda) {
    productosFiltrados = productosFiltrados.filter((p) =>
      p.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase())
    )
  }

  // Filtro de stock crítico
  if (mostrarCritico) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.stockTotal.totalUnidades <= p.stockMinimo
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Stock</h1>
        <p className="text-secondary-600 mt-1">
          {productos.length} producto{productos.length !== 1 ? 's' : ''} en inventario
          {mostrarCritico && ' - Mostrando solo stock crítico'}
        </p>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-600">
            {busqueda ? 'No se encontraron productos' : 'No hay productos en stock'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productosFiltrados.map((producto) => {
            const stockBajo =
              producto.stockTotal.totalUnidades <= producto.stockMinimo

            return (
              <Card
                key={producto._id}
                className={`hover:shadow-md transition-shadow ${
                  stockBajo ? 'border-yellow-300' : ''
                }`}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900">
                        {producto.nombreCompleto}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {producto.codigoSKU}
                      </p>
                    </div>
                    {stockBajo && (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Stock */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Cajas:</span>
                      <span className="font-medium text-secondary-900">
                        {producto.stockTotal.cajas}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Sueltos:</span>
                      <span className="font-medium text-secondary-900">
                        {producto.stockTotal.sueltos}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-secondary-100">
                      <span className="text-secondary-600">Total:</span>
                      <span
                        className={`font-bold ${
                          stockBajo ? 'text-yellow-600' : 'text-primary-600'
                        }`}
                      >
                        {producto.stockTotal.totalUnidades} unidades
                      </span>
                    </div>
                  </div>

                  {/* Lotes */}
                  {producto.lotes.length > 0 && (
                    <div className="pt-3 border-t border-secondary-100">
                      <p className="text-xs font-medium text-secondary-700 mb-2">
                        Lotes disponibles:
                      </p>
                      <div className="space-y-1">
                        {producto.lotes.slice(0, 3).map((lote) => (
                          <div
                            key={lote.numero}
                            className="text-xs text-secondary-600"
                          >
                            • {lote.numero}: {lote.unidades} unid
                          </div>
                        ))}
                        {producto.lotes.length > 3 && (
                          <p className="text-xs text-secondary-500">
                            +{producto.lotes.length - 3} lotes más
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alerta stock bajo */}
                  {stockBajo && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        Stock por debajo del mínimo ({producto.stockMinimo})
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function StockPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <StockContent />
    </Suspense>
  )
}
