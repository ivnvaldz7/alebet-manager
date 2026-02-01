import mongoose, { Schema, Model } from 'mongoose'
import type { Product, Lote, StockInfo } from '@/types'

const LoteSchema = new Schema<Lote>(
  {
    numero: {
      type: String,
      required: true,
    },
    cajas: {
      type: Number,
      required: true,
      min: 0,
    },
    sueltos: {
      type: Number,
      required: true,
      min: 0,
    },
    unidades: {
      type: Number,
      required: true,
      min: 0,
    },
    fechaProduccion: {
      type: Date,
      required: true,
    },
    fechaVencimiento: {
      type: Date,
    },
    orden: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

const StockInfoSchema = new Schema<StockInfo>(
  {
    cajas: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sueltos: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unidadesPorCaja: {
      type: Number,
      required: true,
      min: 1,
    },
    totalUnidades: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
)

const ProductSchema = new Schema<Product>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      uppercase: true,
    },
    variante: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    presentacion: {
      type: String,
      required: [true, 'La presentación es requerida'],
      trim: true,
      uppercase: true,
    },
    nombreCompleto: {
      type: String,
      required: true,
      trim: true,
    },
    codigoSKU: {
      type: String,
      required: [true, 'El código SKU es requerido'],
      trim: true,
      uppercase: true,
    },
    stockTotal: {
      type: StockInfoSchema,
      required: true,
    },
    lotes: {
      type: [LoteSchema],
      default: [],
    },
    stockMinimo: {
      type: Number,
      required: true,
      min: 0,
      default: 100,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Middleware: Auto-generar nombreCompleto antes de guardar
ProductSchema.pre('save', function () {
  if (this.variante) {
    this.nombreCompleto = `${this.nombre} ${this.variante} ${this.presentacion}`
  } else {
    this.nombreCompleto = `${this.nombre} ${this.presentacion}`
  }
})

// Indexes para búsquedas
ProductSchema.index({ nombreCompleto: 'text' })
ProductSchema.index({ codigoSKU: 1 })
ProductSchema.index({ activo: 1 })
ProductSchema.index({ 'stockTotal.totalUnidades': 1 })

const ProductModel: Model<Product> =
  mongoose.models.Product || mongoose.model<Product>('Product', ProductSchema)

export default ProductModel
