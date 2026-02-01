import { config } from 'dotenv'
config({ path: '.env.local' })

import connectDB from '../lib/db/mongoose'
import ProductModel from '../lib/models/Product'

async function forceReseed() {
  try {
    await connectDB()

    console.log('🗑️  Eliminando productos existentes...')
    await ProductModel.deleteMany({})

    console.log('✅ Base limpia. Ejecuta "npm run seed:productos" para crear productos nuevos')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

forceReseed()
