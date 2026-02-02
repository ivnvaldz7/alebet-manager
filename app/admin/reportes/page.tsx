'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function ReportesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">
          Reportes y Analytics
        </h1>
        <p className="text-secondary-600 mt-1">
          Estadísticas y métricas del negocio
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Próximamente
          </h3>
          <p className="text-secondary-600">
            Dashboard de métricas en desarrollo
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
