/**
 * Formatea un número como moneda argentina
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor)
}

/**
 * Formatea una fecha en español
 */
export function formatearFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/**
 * Formatea fecha y hora
 */
export function formatearFechaHora(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Formatea stock (cajas + sueltos)
 */
export function formatearStock(cajas: number, sueltos: number): string {
  if (sueltos === 0) {
    return `${cajas} ${cajas === 1 ? 'caja' : 'cajas'}`
  }
  return `${cajas} ${cajas === 1 ? 'caja' : 'cajas'} + ${sueltos} ${
    sueltos === 1 ? 'suelto' : 'sueltos'
  }`
}

/**
 * Genera un número de pedido único con formato P-YYYYMMDD-XXXX
 */
export function generarNumeroPedido(): string {
  const fecha = new Date()
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  const timestamp = Date.now().toString().slice(-4) // últimos 4 dígitos para unicidad
  return `P-${año}${mes}${dia}-${timestamp}`
}

/**
 * Trunca texto largo
 */
export function truncar(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto
  return texto.slice(0, maxLength) + '...'
}
