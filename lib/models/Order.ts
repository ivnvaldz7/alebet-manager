import mongoose, { Schema, Model } from 'mongoose'
import type { Order, ProductoPedido } from '@/types'

const ProductoPedidoSchema = new Schema<ProductoPedido>(
  {
    productoId: {
      type: String,
      required: true,
    },
    nombreCompleto: {
      type: String,
      required: true,
    },
    codigoSKU: {
      type: String,
      required: true,
    },
    cantidadCajas: {
      type: Number,
      required: true,
      min: 0,
    },
    cantidadSueltos: {
      type: Number,
      required: true,
      min: 0,
    },
    unidadesPorCaja: {
      type: Number,
      required: true,
      min: 1,
    },
    totalUnidades: {
      type: Number,
      required: true,
      min: 1,
    },
    lotesAsignados: {
      type: [
        {
          numero: String,
          cajas: Number,
          sueltos: Number,
          unidades: Number,
        },
      ],
      default: [],
    },
  },
  { _id: false }
)

const OrderSchema = new Schema<Order>(
  {
    numeroPedido: {
      type: String,
      required: true,
      unique: true,
    },
    cliente: {
      nombre: {
        type: String,
        required: true,
      },
      direccion: {
        calle: String,
        numero: String,
        localidad: String,
      },
      telefono: String,
      observaciones: String,
    },
    productos: {
      type: [ProductoPedidoSchema],
      required: true,
      validate: {
        validator: function (v: ProductoPedido[]) {
          return v && v.length > 0
        },
        message: 'El pedido debe tener al menos un producto',
      },
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_preparacion', 'aprobado', 'listo', 'cancelado'],
      default: 'pendiente',
    },
    creadoPor: {
      _id: {
        type: String,
        required: true,
      },
      nombre: {
        type: String,
        required: true,
      },
    },
    armadoPor: {
      type: {
        _id: String,
        nombre: String,
      },
      default: null,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaInicioPreparacion: {
      type: Date,
      default: null,
    },
    fechaAprobado: {
      type: Date,
      default: null,
    },
    fechaListo: {
      type: Date,
      default: null,
    },
    stockInsuficiente: {
      type: Boolean,
      default: false,
    },
    notificacionEnviada: {
      type: Boolean,
      default: false,
    },
    observaciones: {
      type: String,
      default: '',
    },
    // Campos de cancelación
    motivoCancelacion: {
      type: String,
      default: null,
    },
    canceladoPor: {
      type: {
        _id: String,
        nombre: String,
      },
      default: null,
    },
    fechaCancelacion: {
      type: Date,
      default: null,
    },
    etiquetas: {
      generadas: {
        type: Boolean,
        default: false,
      },
      cantidadTotal: {
        type: Number,
        default: 0,
      },
      urlPDF: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
OrderSchema.index({ numeroPedido: 1 })
OrderSchema.index({ estado: 1 })
OrderSchema.index({ 'creadoPor._id': 1 })
OrderSchema.index({ 'armadoPor._id': 1 })
OrderSchema.index({ fechaCreacion: -1 })

const OrderModel: Model<Order> =
  mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema)

export default OrderModel
