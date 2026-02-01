import mongoose, { Schema, Model } from 'mongoose'
import type { StockMovement, LoteMovement } from '@/types'

const LoteMovementSchema = new Schema<LoteMovement>(
  {
    numero: {
      type: String,
      required: true,
    },
    cajasAntes: {
      type: Number,
      required: true,
    },
    sueltosAntes: {
      type: Number,
      required: true,
    },
    cajasDespues: {
      type: Number,
      required: true,
    },
    sueltosDespues: {
      type: Number,
      required: true,
    },
    unidadesCambiadas: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

const StockMovementSchema = new Schema<StockMovement>(
  {
    tipo: {
      type: String,
      enum: ['ingreso_lote', 'egreso_pedido', 'ajuste_manual'],
      required: true,
    },
    producto: {
      _id: {
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
    },
    lote: {
      type: LoteMovementSchema,
      required: true,
    },
    motivo: {
      type: String,
      required: true,
    },
    pedidoId: {
      type: String,
      default: null,
    },
    usuario: {
      _id: {
        type: String,
        required: true,
      },
      nombre: {
        type: String,
        required: true,
      },
      rol: {
        type: String,
        enum: ['admin', 'vendedor', 'armador'],
      },
      contexto: {
        type: String,
        enum: ['admin', 'vendedor', 'armador'],
      },
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
StockMovementSchema.index({ 'producto._id': 1 })
StockMovementSchema.index({ tipo: 1 })
StockMovementSchema.index({ fecha: -1 })
StockMovementSchema.index({ pedidoId: 1 })

const StockMovementModel: Model<StockMovement> =
  mongoose.models.StockMovement ||
  mongoose.model<StockMovement>('StockMovement', StockMovementSchema)

export default StockMovementModel
