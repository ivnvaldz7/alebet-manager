// =============== ROLES Y ENUMS ===============

export type UserRole = 'admin' | 'vendedor' | 'armador'
export type AdminContext = 'admin' | 'vendedor' | 'armador'
export type OrderStatus = 'pendiente' | 'en_preparacion' | 'aprobado' | 'listo' | 'cancelado'
export type MovementType = 'ingreso_lote' | 'egreso_pedido' | 'ajuste_manual'

// =============== USER ===============

export interface User {
  _id: string
  nombre: string
  email: string
  password: string
  rol: UserRole
  contextoActual: AdminContext | null
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface CreateUserInput {
  nombre: string
  email: string
  password: string
  rol: UserRole
  activo?: boolean
}

export interface UpdateUserInput {
  nombre?: string
  email?: string
  password?: string
  rol?: UserRole
  contextoActual?: AdminContext | null
  activo?: boolean
}

// =============== CUSTOMER ===============

export interface Customer {
  _id: string
  nombre: string
  direccion: {
    calle: string
    numero: string
    localidad: string
  }
  telefono?: string
  email?: string
  observaciones?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerInput {
  nombre: string
  direccion: {
    calle: string
    numero: string
    localidad: string
  }
  telefono?: string
  email?: string
  observaciones?: string
}

// =============== PRODUCT ===============

export interface Lote {
  numero: string
  cajas: number
  sueltos: number
  unidades: number
  fechaProduccion: Date
  fechaVencimiento?: Date
  orden: number
}

export interface StockInfo {
  cajas: number
  sueltos: number
  unidadesPorCaja: number
  totalUnidades: number
}

export interface Product {
  _id: string
  nombre: string
  variante: string | null
  presentacion: string
  nombreCompleto: string
  codigoSKU: string
  stockTotal: StockInfo
  lotes: Lote[]
  stockMinimo: number
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductInput {
  nombre: string
  variante?: string | null
  presentacion: string
  codigoSKU: string
  unidadesPorCaja: number
  stockMinimo?: number
  activo?: boolean
}

export interface CreateLoteInput {
  numero: string
  cajas: number
  sueltos: number
  fechaProduccion: Date
  fechaVencimiento?: Date
}

export interface AjustarStockInput {
  productoId: string
  loteNumero: string
  tipo: 'suma' | 'resta'
  cajas: number
  sueltos: number
  motivo: string
  notas?: string
}

// =============== ORDER ===============

export interface ProductoPedido {
  productoId: string
  nombreCompleto: string
  codigoSKU: string
  cantidadCajas: number
  cantidadSueltos: number
  unidadesPorCaja: number
  totalUnidades: number
  lotesAsignados: Array<{
    numero: string
    cajas: number
    sueltos: number
    unidades: number
  }>
}

export interface Order {
  _id: string
  numeroPedido: string
  cliente: {
    nombre: string
    direccion: {
      calle: string
      numero: string
      localidad: string
    }
    telefono?: string
    observaciones?: string
  }
  productos: ProductoPedido[]
  estado: OrderStatus
  creadoPor: {
    _id: string
    nombre: string
  }
  armadoPor: {
    _id: string
    nombre: string
  } | null
  fechaCreacion: Date
  fechaInicioPreparacion: Date | null
  fechaAprobado: Date | null
  fechaListo: Date | null
  stockInsuficiente: boolean
  notificacionEnviada: boolean
  observaciones: string
  etiquetas: {
    generadas: boolean
    cantidadTotal: number
    urlPDF: string | null
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrderInput {
  cliente: {
    nombre: string
    direccion: {
      calle: string
      numero: string
      localidad: string
    }
    telefono?: string
    observaciones?: string
  }
  productos: Array<{
    productoId: string
    cantidadCajas: number
    cantidadSueltos: number
  }>
  observaciones?: string
}

export interface TomarPedidoInput {
  orderId: string
  armadorId: string
  armadorNombre: string
}

export interface ConfirmarArmadoInput {
  orderId: string
  productos: Array<{
    productoId: string
    cantidadCajas: number
    cantidadSueltos: number
  }>
}

// =============== STOCK MOVEMENT ===============

export interface LoteMovement {
  numero: string
  cajasAntes: number
  sueltosAntes: number
  cajasDespues: number
  sueltosDespues: number
  unidadesCambiadas: number
}

export interface StockMovement {
  _id: string
  tipo: MovementType
  producto: {
    _id: string
    nombreCompleto: string
    codigoSKU: string
  }
  lote: LoteMovement
  motivo: string
  pedidoId: string | null
  usuario: {
    _id: string
    nombre: string
    rol?: UserRole
    contexto?: AdminContext
  }
  fecha: Date
  createdAt: Date
}

export interface CreateMovementInput {
  tipo: MovementType
  productoId: string
  loteNumero: string
  cajasAntes: number
  sueltosAntes: number
  cajasDespues: number
  sueltosDespues: number
  motivo: string
  pedidoId?: string
  usuarioId: string
}

// =============== NOTIFICATION ===============

export interface Notification {
  _id: string
  tipo: 'stock_bajo' | 'conflicto_armado' | 'pedido_nuevo' | 'pedido_listo' | 'lote_vencimiento'
  titulo: string
  mensaje: string
  destinatarios: string[]
  leida: string[]
  pedidoId?: string
  productoId?: string
  prioridad: 'baja' | 'media' | 'alta'
  createdAt: Date
}

// =============== API RESPONSES ===============

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

// =============== DASHBOARD STATS ===============

export interface DashboardStats {
  pedidosHoy: number
  pedidosEnPreparacion: number
  pedidosListos: number
  productosStockCritico: number
  pedidosRecientes: Order[]
  alertas: Array<{
    tipo: 'stock_bajo' | 'lote_vencimiento'
    mensaje: string
    productoId?: string
    prioridad: 'baja' | 'media' | 'alta'
  }>
}

// =============== REPORTES ===============

export interface VentasReporte {
  periodo: {
    inicio: Date
    fin: Date
  }
  totalPedidos: number
  totalUnidades: number
  productosMasVendidos: Array<{
    productoId: string
    nombreCompleto: string
    cantidad: number
  }>
  ventasPorVendedor: Array<{
    vendedorId: string
    vendedorNombre: string
    cantidadPedidos: number
  }>
}

export interface StockReporte {
  totalProductos: number
  productosActivos: number
  productosStockBajo: number
  valorTotalStock: number
  productosPorCategoria: Array<{
    nombre: string
    cantidad: number
  }>
}

// =============== FILTERS ===============

export interface PedidoFilters {
  estado?: OrderStatus | OrderStatus[]
  creadoPor?: string
  armadoPor?: string
  fechaDesde?: Date
  fechaHasta?: Date
  cliente?: string
  page?: number
  limit?: number
  sortBy?: 'fechaCreacion' | 'numeroPedido' | 'estado'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductoFilters {
  nombre?: string
  activo?: boolean
  stockBajo?: boolean
  page?: number
  limit?: number
  sortBy?: 'nombreCompleto' | 'stockTotal.totalUnidades'
  sortOrder?: 'asc' | 'desc'
}

// =============== FORM STATES ===============

export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isValid: boolean
}

// =============== AUTH ===============

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSession {
  user: UserWithoutPassword
  expires: string
}

export interface PermisosPorRol {
  crearPedidos: boolean
  verPedidos: boolean
  armarPedidos: boolean
  verStock: boolean
  ajustarStock: boolean
  gestionarUsuarios: boolean
  gestionarProductos: boolean
  verReportes: boolean
  configurarSistema: boolean
}
