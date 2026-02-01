import type { Product, Lote, StockInfo } from '@/types'

/**
 * Recalcula el stock total de un producto sumando todos sus lotes
 */
export function recalcularStockTotal(producto: Product): StockInfo {
  let totalCajas = 0
  let totalSueltos = 0
  let totalUnidades = 0

  for (const lote of producto.lotes) {
    totalCajas += lote.cajas
    totalSueltos += lote.sueltos
    totalUnidades += lote.unidades
  }

  // Normalizar sueltos (si hay más sueltos que unidades por caja, convertir a cajas)
  if (totalSueltos >= producto.stockTotal.unidadesPorCaja) {
    const cajasExtra = Math.floor(totalSueltos / producto.stockTotal.unidadesPorCaja)
    totalCajas += cajasExtra
    totalSueltos = totalSueltos % producto.stockTotal.unidadesPorCaja
  }

  return {
    cajas: totalCajas,
    sueltos: totalSueltos,
    unidadesPorCaja: producto.stockTotal.unidadesPorCaja,
    totalUnidades,
  }
}

/**
 * Verifica si un producto tiene stock bajo
 */
export function tieneStockBajo(producto: Product): boolean {
  return producto.stockTotal.totalUnidades <= producto.stockMinimo
}

/**
 * Verifica si un producto tiene stock suficiente para un pedido
 */
export function tieneStockSuficiente(
  producto: Product,
  cajasRequeridas: number,
  sueltosRequeridos: number
): boolean {
  const unidadesRequeridas =
    cajasRequeridas * producto.stockTotal.unidadesPorCaja + sueltosRequeridos
  return producto.stockTotal.totalUnidades >= unidadesRequeridas
}

/**
 * Obtiene el lote más antiguo (orden más bajo)
 */
export function obtenerLoteMasAntiguo(lotes: Lote[]): Lote | null {
  if (lotes.length === 0) return null
  return lotes.reduce((oldest, current) =>
    current.orden < oldest.orden ? current : oldest
  )
}

/**
 * Verifica si algún lote está próximo a vencer
 * @param dias - Días antes del vencimiento para considerar "próximo"
 */
export function lotesProximosAVencer(
  lotes: Lote[],
  dias: number = 30
): Lote[] {
  const hoy = new Date()
  const limite = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000)

  return lotes.filter((lote) => {
    if (!lote.fechaVencimiento) return false
    return lote.fechaVencimiento <= limite && lote.fechaVencimiento > hoy
  })
}

/**
 * Elimina lotes agotados (0 unidades) de un array
 */
export function eliminarLotesAgotados(lotes: Lote[]): Lote[] {
  return lotes.filter((lote) => lote.unidades > 0)
}

/**
 * Reordena los lotes después de eliminar alguno
 * Mantiene el orden FIFO correcto
 */
export function reordenarLotes(lotes: Lote[]): Lote[] {
  return lotes
    .sort((a, b) => a.orden - b.orden)
    .map((lote, index) => ({
      ...lote,
      orden: index + 1,
    }))
}
