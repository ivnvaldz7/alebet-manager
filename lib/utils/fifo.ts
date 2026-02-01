import type { Lote, Product } from '@/types'

/**
 * Interfaz para el resultado del descuento FIFO
 */
export interface FifoResult {
  success: boolean
  lotesAfectados: Array<{
    numero: string
    cajasDescontadas: number
    sueltosDescontados: number
    unidadesDescontadas: number
    cajasRestantes: number
    sueltosRestantes: number
    agotado: boolean
  }>
  error?: string
}

/**
 * Descuenta stock de un producto usando FIFO
 *
 * @param producto - Producto del cual descontar
 * @param cajasRequeridas - Cantidad de cajas a descontar
 * @param sueltosRequeridos - Cantidad de sueltos a descontar
 * @returns Resultado con lotes afectados o error
 */
export function descontarStockFIFO(
  producto: Product,
  cajasRequeridas: number,
  sueltosRequeridos: number
): FifoResult {
  // Validaciones
  if (cajasRequeridas < 0 || sueltosRequeridos < 0) {
    return {
      success: false,
      lotesAfectados: [],
      error: 'Las cantidades no pueden ser negativas',
    }
  }

  if (producto.lotes.length === 0) {
    return {
      success: false,
      lotesAfectados: [],
      error: 'El producto no tiene lotes disponibles',
    }
  }

  // Calcular total de unidades requeridas
  const unidadesRequeridas =
    cajasRequeridas * producto.stockTotal.unidadesPorCaja + sueltosRequeridos

  // Verificar stock disponible
  if (unidadesRequeridas > producto.stockTotal.totalUnidades) {
    return {
      success: false,
      lotesAfectados: [],
      error: `Stock insuficiente. Requerido: ${unidadesRequeridas}, Disponible: ${producto.stockTotal.totalUnidades}`,
    }
  }

  // Ordenar lotes por orden (FIFO: orden 1 = más viejo)
  const lotesOrdenados = [...producto.lotes].sort((a, b) => a.orden - b.orden)

  let unidadesPendientes = unidadesRequeridas
  const lotesAfectados: FifoResult['lotesAfectados'] = []

  // Descontar de los lotes en orden
  for (const lote of lotesOrdenados) {
    if (unidadesPendientes <= 0) break

    const unidadesDisponiblesLote = lote.unidades
    const unidadesADescontar = Math.min(unidadesPendientes, unidadesDisponiblesLote)

    // Convertir unidades a descontar en cajas + sueltos
    const cajasADescontar = Math.floor(
      unidadesADescontar / producto.stockTotal.unidadesPorCaja
    )
    const sueltosADescontar =
      unidadesADescontar % producto.stockTotal.unidadesPorCaja

    // Calcular stock restante del lote
    let cajasRestantes = lote.cajas
    let sueltosRestantes = lote.sueltos

    // Descontar sueltos primero
    if (sueltosADescontar > 0) {
      if (sueltosRestantes >= sueltosADescontar) {
        sueltosRestantes -= sueltosADescontar
      } else {
        // No hay suficientes sueltos, descontar de una caja
        if (cajasRestantes > 0) {
          cajasRestantes -= 1
          sueltosRestantes =
            producto.stockTotal.unidadesPorCaja - sueltosADescontar + sueltosRestantes
        }
      }
    }

    // Descontar cajas
    if (cajasADescontar > 0) {
      cajasRestantes -= cajasADescontar
    }

    // Registrar lote afectado
    lotesAfectados.push({
      numero: lote.numero,
      cajasDescontadas: cajasADescontar,
      sueltosDescontados: sueltosADescontar,
      unidadesDescontadas: unidadesADescontar,
      cajasRestantes,
      sueltosRestantes,
      agotado: cajasRestantes === 0 && sueltosRestantes === 0,
    })

    unidadesPendientes -= unidadesADescontar
  }

  return {
    success: true,
    lotesAfectados,
  }
}

/**
 * Calcula el próximo número de lote basado en los existentes
 *
 * @param codigoSKU - Código base del producto (ej: "OL")
 * @param lotesExistentes - Array de lotes actuales
 * @returns Próximo número de lote (ej: "OL0902")
 */
export function generarProximoLote(
  codigoSKU: string,
  lotesExistentes: Lote[]
): string {
  if (lotesExistentes.length === 0) {
    return `${codigoSKU}0001`
  }

  // Extraer números de los lotes existentes
  const numeros = lotesExistentes
    .map((lote) => {
      const match = lote.numero.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    })
    .filter((num) => !isNaN(num))

  const maxNumero = Math.max(...numeros)
  const siguienteNumero = maxNumero + 1

  // Formatear con padding (4 dígitos)
  return `${codigoSKU}${siguienteNumero.toString().padStart(4, '0')}`
}

/**
 * Valida que un lote tenga datos correctos
 */
export function validarLote(
  cajas: number,
  sueltos: number,
  unidadesPorCaja: number
): { valid: boolean; error?: string } {
  if (cajas < 0) {
    return { valid: false, error: 'Las cajas no pueden ser negativas' }
  }

  if (sueltos < 0) {
    return { valid: false, error: 'Los sueltos no pueden ser negativos' }
  }

  if (sueltos >= unidadesPorCaja) {
    return {
      valid: false,
      error: `Los sueltos (${sueltos}) deben ser menores a unidades por caja (${unidadesPorCaja})`,
    }
  }

  if (cajas === 0 && sueltos === 0) {
    return { valid: false, error: 'El lote debe tener al menos 1 unidad' }
  }

  return { valid: true }
}

/**
 * Calcula unidades totales desde cajas + sueltos
 */
export function calcularUnidadesTotales(
  cajas: number,
  sueltos: number,
  unidadesPorCaja: number
): number {
  return cajas * unidadesPorCaja + sueltos
}

/**
 * Convierte unidades totales a cajas + sueltos
 */
export function convertirUnidadesACajasSueltos(
  unidadesTotales: number,
  unidadesPorCaja: number
): { cajas: number; sueltos: number } {
  const cajas = Math.floor(unidadesTotales / unidadesPorCaja)
  const sueltos = unidadesTotales % unidadesPorCaja

  return { cajas, sueltos }
}
