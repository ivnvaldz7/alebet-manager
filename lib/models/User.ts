import mongoose, { Schema, Model } from 'mongoose'
import type { User } from '@/types'

const UserSchema = new Schema<User>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
    },
    rol: {
      type: String,
      enum: ['admin', 'vendedor', 'armador'],
      required: true,
    },
    contextoActual: {
      type: String,
      enum: ['admin', 'vendedor', 'armador'],
      default: null,
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

// Indexes para búsquedas rápidas
UserSchema.index({ email: 1 })
UserSchema.index({ rol: 1, activo: 1 })

const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>('User', UserSchema)

export default UserModel
