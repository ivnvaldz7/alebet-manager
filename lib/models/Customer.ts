import mongoose, { Schema, Model } from 'mongoose'
import type { Customer } from '@/types'

const CustomerSchema = new Schema<Customer>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    direccion: {
      calle: {
        type: String,
        required: true,
        trim: true,
      },
      numero: {
        type: String,
        required: true,
        trim: true,
      },
      localidad: {
        type: String,
        required: true,
        trim: true,
      },
    },
    telefono: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    observaciones: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes para búsquedas
CustomerSchema.index({ nombre: 'text' })
CustomerSchema.index({ 'direccion.localidad': 1 })

const CustomerModel: Model<Customer> =
  mongoose.models.Customer || mongoose.model<Customer>('Customer', CustomerSchema)

export default CustomerModel
