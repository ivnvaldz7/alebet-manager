import type { UserRole, AdminContext, PermisosPorRol } from '@/types'

/**
 * Obtiene los permisos de un usuario basado en su rol y contexto actual
 */
export function obtenerPermisos(
  rol: UserRole,
  contexto?: AdminContext | null
): PermisosPorRol {
  // Si es admin, los permisos dependen del contexto
  if (rol === 'admin') {
    const contextoActual = contexto || 'admin'

    switch (contextoActual) {
      case 'vendedor':
        return PERMISOS_VENDEDOR
      case 'armador':
        return PERMISOS_ARMADOR
      case 'admin':
      default:
        return PERMISOS_ADMIN
    }
  }

  // Roles normales tienen permisos fijos
  if (rol === 'vendedor') return PERMISOS_VENDEDOR
  if (rol === 'armador') return PERMISOS_ARMADOR

  // Fallback: sin permisos
  return {
    crearPedidos: false,
    verPedidos: false,
    armarPedidos: false,
    verStock: false,
    ajustarStock: false,
    gestionarUsuarios: false,
    gestionarProductos: false,
    verReportes: false,
    configurarSistema: false,
  }
}

const PERMISOS_VENDEDOR: PermisosPorRol = {
  crearPedidos: true,
  verPedidos: true,
  armarPedidos: false,
  verStock: true,
  ajustarStock: false,
  gestionarUsuarios: false,
  gestionarProductos: false,
  verReportes: false,
  configurarSistema: false,
}

const PERMISOS_ARMADOR: PermisosPorRol = {
  crearPedidos: false,
  verPedidos: true,
  armarPedidos: true,
  verStock: true,
  ajustarStock: false,
  gestionarUsuarios: false,
  gestionarProductos: false,
  verReportes: false,
  configurarSistema: false,
}

const PERMISOS_ADMIN: PermisosPorRol = {
  crearPedidos: true,
  verPedidos: true,
  armarPedidos: true,
  verStock: true,
  ajustarStock: true,
  gestionarUsuarios: true,
  gestionarProductos: true,
  verReportes: true,
  configurarSistema: true,
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function tienePermiso(
  rol: UserRole,
  contexto: AdminContext | null | undefined,
  permiso: keyof PermisosPorRol
): boolean {
  const permisos = obtenerPermisos(rol, contexto)
  return permisos[permiso]
}
