import 'dotenv/config'
import connectDB from '../lib/db/mongoose'
import ProductModel from '../lib/models/Product'

async function seedProductosReales() {
  try {
    await connectDB()

    console.log('🔄 Eliminando productos de prueba...')
    await ProductModel.deleteMany({})

    // PRODUCTOS REALES DEL DEPÓSITO ALE-BET
    const productos = [
      // OLIVITASAN
      {
        nombre: 'OLIVITASAN',
        presentacion: '500 ML',
        codigoSKU: 'OL',
        stockTotal: {
          cajas: 58,
          sueltos: 0,
          unidadesPorCaja: 20,
          totalUnidades: 1160,
        },
        lotes: [
          {
            numero: 'OL0900',
            cajas: 58,
            sueltos: 0,
            unidades: 1160,
            fechaProduccion: new Date('2024-11-15'),
            fechaVencimiento: new Date('2026-11-15'),
            orden: 1,
          },
        ],
        stockMinimo: 200,
        activo: true,
      },
      {
        nombre: 'OLIVITASAN PLUS',
        presentacion: '500 ML',
        codigoSKU: 'PL',
        stockTotal: {
          cajas: 42,
          sueltos: 1,
          unidadesPorCaja: 20,
          totalUnidades: 841,
        },
        lotes: [
          {
            numero: 'PL0578',
            cajas: 42,
            sueltos: 1,
            unidades: 841,
            fechaProduccion: new Date('2024-12-01'),
            fechaVencimiento: new Date('2026-12-01'),
            orden: 1,
          },
        ],
        stockMinimo: 200,
        activo: true,
      },
      {
        nombre: 'OLIVITASAN',
        presentacion: '100 ML',
        codigoSKU: 'OL',
        stockTotal: {
          cajas: 15,
          sueltos: 25,
          unidadesPorCaja: 40,
          totalUnidades: 625,
        },
        lotes: [
          {
            numero: 'OL0896',
            cajas: 15,
            sueltos: 25,
            unidades: 625,
            fechaProduccion: new Date('2024-10-20'),
            fechaVencimiento: new Date('2026-10-20'),
            orden: 1,
          },
        ],
        stockMinimo: 150,
        activo: true,
      },
      // ENERGIZANTE
      {
        nombre: 'ENERGIZANTE',
        presentacion: '100 ML',
        codigoSKU: 'EN',
        stockTotal: {
          cajas: 83,
          sueltos: 2,
          unidadesPorCaja: 24,
          totalUnidades: 1994,
        },
        lotes: [
          {
            numero: 'EN0126',
            cajas: 83,
            sueltos: 2,
            unidades: 1994,
            fechaProduccion: new Date('2024-11-10'),
            fechaVencimiento: new Date('2026-11-10'),
            orden: 1,
          },
        ],
        stockMinimo: 300,
        activo: true,
      },
      {
        nombre: 'ENERGIZANTE',
        presentacion: '25 ML',
        codigoSKU: 'EN',
        stockTotal: {
          cajas: 14,
          sueltos: 0,
          unidadesPorCaja: 20,
          totalUnidades: 280,
        },
        lotes: [
          {
            numero: 'EN0124',
            cajas: 14,
            sueltos: 0,
            unidades: 280,
            fechaProduccion: new Date('2024-12-05'),
            fechaVencimiento: new Date('2026-12-05'),
            orden: 1,
          },
        ],
        stockMinimo: 100,
        activo: true,
      },
      // AMANTINA
      {
        nombre: 'AMANTINA',
        presentacion: '500 ML',
        codigoSKU: 'AM',
        stockTotal: {
          cajas: 17,
          sueltos: 8,
          unidadesPorCaja: 20,
          totalUnidades: 348,
        },
        lotes: [
          {
            numero: 'AM0139',
            cajas: 17,
            sueltos: 8,
            unidades: 348,
            fechaProduccion: new Date('2024-11-25'),
            fechaVencimiento: new Date('2026-11-25'),
            orden: 1,
          },
        ],
        stockMinimo: 150,
        activo: true,
      },
      {
        nombre: 'AMANTINA PREMIUM',
        presentacion: '500 ML',
        codigoSKU: 'AP',
        stockTotal: {
          cajas: 47,
          sueltos: 5,
          unidadesPorCaja: 20,
          totalUnidades: 945,
        },
        lotes: [
          {
            numero: 'AP0076',
            cajas: 47,
            sueltos: 5,
            unidades: 945,
            fechaProduccion: new Date('2024-12-10'),
            fechaVencimiento: new Date('2026-12-10'),
            orden: 1,
          },
        ],
        stockMinimo: 200,
        activo: true,
      },
      // COMPLEJO B
      {
        nombre: 'COMPLEJO B B12 B15',
        presentacion: '100 ML',
        codigoSKU: 'CB',
        stockTotal: {
          cajas: 75,
          sueltos: 12,
          unidadesPorCaja: 24,
          totalUnidades: 1812,
        },
        lotes: [
          {
            numero: 'CB0091',
            cajas: 75,
            sueltos: 12,
            unidades: 1812,
            fechaProduccion: new Date('2024-10-15'),
            fechaVencimiento: new Date('2026-10-15'),
            orden: 1,
          },
        ],
        stockMinimo: 300,
        activo: true,
      },
      // VITAMINA B12
      {
        nombre: 'VITAMINA B12',
        presentacion: '100 ML',
        codigoSKU: 'BB',
        stockTotal: {
          cajas: 30,
          sueltos: 22,
          unidadesPorCaja: 24,
          totalUnidades: 742,
        },
        lotes: [
          {
            numero: 'BB0005',
            cajas: 30,
            sueltos: 22,
            unidades: 742,
            fechaProduccion: new Date('2024-11-01'),
            fechaVencimiento: new Date('2026-11-01'),
            orden: 1,
          },
        ],
        stockMinimo: 200,
        activo: true,
      },
      // AMINOÁCIDOS (stock bajo para demo)
      {
        nombre: 'AMINOÁCIDOS',
        presentacion: '20 ML',
        codigoSKU: 'AO',
        stockTotal: {
          cajas: 1,
          sueltos: 0,
          unidadesPorCaja: 15,
          totalUnidades: 15,
        },
        lotes: [
          {
            numero: 'AO0248',
            cajas: 1,
            sueltos: 0,
            unidades: 15,
            fechaProduccion: new Date('2024-09-10'),
            fechaVencimiento: new Date('2026-09-10'),
            orden: 1,
          },
        ],
        stockMinimo: 100,
        activo: true,
      },
    ]

    console.log('📦 Cargando productos reales...')
    await ProductModel.insertMany(productos)

    console.log(`✅ ${productos.length} productos cargados exitosamente:`)
    productos.forEach((p) => {
      console.log(`   - ${p.nombre} ${p.presentacion} (${p.stockTotal.totalUnidades} unidades)`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error cargando productos:', error)
    process.exit(1)
  }
}

seedProductosReales()
