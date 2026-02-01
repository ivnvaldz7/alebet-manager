import { config } from 'dotenv'
config({ path: '.env.local' })

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import UserModel from '../lib/models/User'
import connectDB from '../lib/db/mongoose'

async function seedAdmin() {
  try {
    await connectDB()

    // Verificar si ya existe un admin
    const adminExists = await UserModel.findOne({ rol: 'admin' })

    if (adminExists) {
      console.log('✅ Ya existe un usuario admin')
      process.exit(0)
    }

    // Crear admin inicial
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await UserModel.create({
      nombre: 'Ivan Méndez',
      email: 'ivan@alebet.com',
      password: hashedPassword,
      rol: 'admin',
      contextoActual: 'admin',
      activo: true,
    })

    console.log('✅ Usuario admin creado:')
    console.log('   Email: ivan@alebet.com')
    console.log('   Password: admin123')
    console.log('   ⚠️  CAMBIAR PASSWORD DESPUÉS DEL PRIMER LOGIN')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creando admin:', error)
    process.exit(1)
  }
}

seedAdmin()
