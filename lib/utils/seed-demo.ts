import bcrypt from 'bcryptjs'
import ProductModel from '@/lib/models/Product'
import CustomerModel from '@/lib/models/Customer'
import UserModel from '@/lib/models/User'

let seeded = false

/** Credenciales del usuario demo */
export const DEMO_CREDENTIALS = {
  email: 'demo@alebet.com',
  password: 'demo1234',
}

/**
 * Inserta datos demo si la DB está vacía.
 * Se llama desde el callback de login; el check es O(1).
 * Una vez que corre, no vuelve a intentar en el mismo proceso.
 */
export async function seedDemoDataIfEmpty() {
  if (seeded) return
  seeded = true

  try {
    const [productCount, customerCount, demoUser] = await Promise.all([
      ProductModel.countDocuments(),
      CustomerModel.countDocuments(),
      UserModel.findOne({ email: DEMO_CREDENTIALS.email }),
    ])

    const promises: Promise<unknown>[] = []

    if (productCount === 0) {
      promises.push(ProductModel.insertMany(DEMO_PRODUCTS))
    }

    if (customerCount === 0) {
      promises.push(CustomerModel.insertMany(DEMO_CUSTOMERS))
    }

    if (!demoUser) {
      const hashedPassword = await bcrypt.hash(DEMO_CREDENTIALS.password, 10)
      promises.push(
        UserModel.create({
          nombre: 'Usuario Demo',
          email: DEMO_CREDENTIALS.email,
          password: hashedPassword,
          rol: 'admin',
          contextoActual: 'admin',
          activo: true,
        })
      )
    }

    if (promises.length > 0) {
      await Promise.all(promises)
      console.log('[seed-demo] Datos demo insertados correctamente')
    }
  } catch (error) {
    // No bloquear el login por un fallo de seed
    console.error('[seed-demo] Error insertando datos demo:', error)
    seeded = false // permitir reintentar
  }
}

// --- Productos demo (5 productos variados) ---
const DEMO_PRODUCTS = [
  {
    nombre: 'OLIVITASAN',
    presentacion: '500 ML',
    nombreCompleto: 'OLIVITASAN 500 ML',
    codigoSKU: 'OL',
    stockTotal: { cajas: 20, sueltos: 0, unidadesPorCaja: 20, totalUnidades: 400 },
    lotes: [{
      numero: 'OL0001',
      cajas: 20, sueltos: 0, unidades: 400,
      fechaProduccion: new Date('2025-06-01'),
      fechaVencimiento: new Date('2027-06-01'),
      orden: 1,
    }],
    stockMinimo: 100,
    activo: true,
  },
  {
    nombre: 'OLIVITASAN PLUS',
    presentacion: '500 ML',
    nombreCompleto: 'OLIVITASAN PLUS 500 ML',
    codigoSKU: 'PL',
    stockTotal: { cajas: 15, sueltos: 5, unidadesPorCaja: 20, totalUnidades: 305 },
    lotes: [{
      numero: 'PL0001',
      cajas: 15, sueltos: 5, unidades: 305,
      fechaProduccion: new Date('2025-07-01'),
      fechaVencimiento: new Date('2027-07-01'),
      orden: 1,
    }],
    stockMinimo: 100,
    activo: true,
  },
  {
    nombre: 'ENERGIZANTE',
    presentacion: '100 ML',
    nombreCompleto: 'ENERGIZANTE 100 ML',
    codigoSKU: 'EN',
    stockTotal: { cajas: 30, sueltos: 0, unidadesPorCaja: 24, totalUnidades: 720 },
    lotes: [{
      numero: 'EN0001',
      cajas: 30, sueltos: 0, unidades: 720,
      fechaProduccion: new Date('2025-08-01'),
      fechaVencimiento: new Date('2027-08-01'),
      orden: 1,
    }],
    stockMinimo: 150,
    activo: true,
  },
  {
    nombre: 'AMANTINA',
    presentacion: '500 ML',
    nombreCompleto: 'AMANTINA 500 ML',
    codigoSKU: 'AM',
    stockTotal: { cajas: 10, sueltos: 0, unidadesPorCaja: 20, totalUnidades: 200 },
    lotes: [{
      numero: 'AM0001',
      cajas: 10, sueltos: 0, unidades: 200,
      fechaProduccion: new Date('2025-05-15'),
      fechaVencimiento: new Date('2027-05-15'),
      orden: 1,
    }],
    stockMinimo: 80,
    activo: true,
  },
  {
    nombre: 'COMPLEJO B B12 B15',
    presentacion: '100 ML',
    nombreCompleto: 'COMPLEJO B B12 B15 100 ML',
    codigoSKU: 'CB',
    stockTotal: { cajas: 25, sueltos: 10, unidadesPorCaja: 24, totalUnidades: 610 },
    lotes: [{
      numero: 'CB0001',
      cajas: 25, sueltos: 10, unidades: 610,
      fechaProduccion: new Date('2025-09-01'),
      fechaVencimiento: new Date('2027-09-01'),
      orden: 1,
    }],
    stockMinimo: 120,
    activo: true,
  },
]

// --- Clientes demo (6 clientes de ejemplo) ---
const DEMO_CUSTOMERS = [
  {
    nombre: 'DISTRIBUIDORA NORTE',
    direccion: { calle: 'AV. SAN MARTIN', numero: '1250', localidad: 'RESISTENCIA, CHACO' },
  },
  {
    nombre: 'AGROVETERINARIA EL SOL',
    direccion: { calle: 'BELGRANO', numero: '340', localidad: 'CORRIENTES' },
  },
  {
    nombre: 'VETERINARIA CENTRAL',
    direccion: { calle: 'URQUIZA', numero: '890', localidad: 'PARANA, ENTRE RIOS' },
  },
  {
    nombre: 'COMERCIAL SUR SRL',
    direccion: { calle: '25 DE MAYO', numero: '567', localidad: 'ROSARIO, SANTA FE' },
  },
  {
    nombre: 'GARCIA, PEDRO',
    direccion: { calle: 'MITRE', numero: '1100', localidad: 'GOYA, CORRIENTES' },
  },
  {
    nombre: 'DROGUERIA LITORAL',
    direccion: { calle: 'SARMIENTO', numero: '445', localidad: 'CONCORDIA, ENTRE RIOS' },
  },
]
