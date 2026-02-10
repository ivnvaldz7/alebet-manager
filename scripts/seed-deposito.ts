import { config } from 'dotenv'
config({ path: '.env.local' })
import connectDB from '../lib/db/mongoose'
import ProductModel from '../lib/models/Product'

/**
 * Seed definitivo del depósito ALE-BET basado en el Excel DEPÓSITO.xlsx (Junio 2026).
 * - Elimina todos los productos existentes y carga los 43 productos reales.
 * - Productos con stock 0 se crean sin lote.
 * - OLIVITASAN PLUS 500 ML: dos filas sumadas en un solo lote PL0578 (153 cajas, 9 sueltos).
 * - COMPLEJO B B12 B15 100 ML lote CB0092 (valores null) se omite.
 */

const hoy = new Date()

// Helper para crear producto sin stock
function sinStock(nombre: string, presentacion: string, codigoSKU: string, unidadesPorCaja: number) {
  return {
    nombre,
    presentacion,
    nombreCompleto: `${nombre} ${presentacion}`,
    codigoSKU,
    stockTotal: { cajas: 0, sueltos: 0, unidadesPorCaja, totalUnidades: 0 },
    lotes: [],
    activo: true,
  }
}

// Helper para crear producto con un lote
function conLote(
  nombre: string,
  presentacion: string,
  codigoSKU: string,
  unidadesPorCaja: number,
  numeroLote: string,
  cajas: number,
  sueltos: number
) {
  const totalUnidades = cajas * unidadesPorCaja + sueltos
  return {
    nombre,
    presentacion,
    nombreCompleto: `${nombre} ${presentacion}`,
    codigoSKU,
    stockTotal: { cajas, sueltos, unidadesPorCaja, totalUnidades },
    lotes: [
      {
        numero: numeroLote,
        cajas,
        sueltos,
        unidades: totalUnidades,
        fechaProduccion: hoy,
        orden: 1,
      },
    ],
    activo: true,
  }
}

async function seedDeposito() {
  try {
    await connectDB()

    const productos = [
      // ── AMANTINA (AM) ──
      sinStock('AMANTINA', '250 ML', 'AM', 15),
      conLote('AMANTINA', '500 ML', 'AM', 20, 'AM0139', 13, 8),

      // ── AMANTINA PREMIUM (AP) ──
      sinStock('AMANTINA PREMIUM', '100 ML', 'AP', 30),
      sinStock('AMANTINA PREMIUM', '250 ML', 'AP', 24),
      conLote('AMANTINA PREMIUM', '500 ML', 'AP', 20, 'AP0076', 21, 5),

      // ── AMINOÁCIDOS (AO) ──
      conLote('AMINOÁCIDOS', '1 L', 'AO', 12, 'AO0285', 1, 1),
      sinStock('AMINOÁCIDOS AVES', '1 L', 'AO', 12),
      conLote('AMINOÁCIDOS', '20 ML', 'AO', 15, 'AO0248', 1, 0),
      conLote('AMINOÁCIDOS', '5 L', 'AO', 4, 'AO0285', 6, 1),
      sinStock('AMINOÁCIDOS GALLO', '50 ML', 'AO', 40),
      sinStock('AMINOÁCIDOS MASCOTA', '50 ML', 'AO', 40),

      // ── ANTITÉRMICO (AT) ──
      conLote('ANTITÉRMICO', '1 L', 'AT', 12, 'AT0015', 1, 2),

      // ── CALCITROVIT (CV) ──
      conLote('CALCITROVIT', '500 ML', 'CV', 20, 'CV0018', 3, 11),

      // ── CETRI-AMON (CA) ──
      conLote('CETRI-AMON', '1 L', 'CA', 12, 'CA0123', 33, 2),
      conLote('CETRI-AMON', '5 L', 'CA', 4, 'CA0128', 34, 3),

      // ── COMPLEJO B B12 B15 (CB) ──
      conLote('COMPLEJO B B12 B15', '20 ML', 'CB', 12, 'CB0090', 27, 0),
      conLote('COMPLEJO B B12 B15', '100 ML', 'CB', 24, 'CB0091', 10, 11),
      conLote('COMPLEJO B B12 B15', '250 ML', 'CB', 24, 'CB0092', 41, 0),

      // ── COMPLEJO B HIERRO CERDOS (HB) ──
      conLote('COMPLEJO B HIERRO CERDOS', '100 ML', 'HB', 24, 'HB0025', 7, 0),
      conLote('COMPLEJO B HIERRO CERDOS', '25 ML', 'HB', 20, 'HB0025', 10, 0),

      // ── COMPLEJO B HIERRO EQUINO/S (HB) ──
      conLote('COMPLEJO B HIERRO EQUINO', '25 ML', 'HB', 20, 'HB0028', 6, 0),
      conLote('COMPLEJO B HIERRO EQUINOS', '100 ML', 'HB', 24, 'HB0028', 31, 20),

      // ── ENERGIZANTE (EN) ──
      conLote('ENERGIZANTE', '25 ML', 'EN', 20, 'EN0124', 9, 0),
      conLote('ENERGIZANTE', '100 ML', 'EN', 24, 'EN0126', 59, 2),
      conLote('ENERGIZANTE', '250 ML', 'EN', 24, 'EN0126', 12, 12),
      sinStock('ENERGIZANTE VACAS', '250 ML', 'EN', 24),
      sinStock('ENERGIZANTE', '500 ML', 'EN', 20),

      // ── IVERSAN (IV) ──
      sinStock('IVERSAN', '500 ML', 'IV', 20),

      // ── JERINGA ATP (EN) ──
      conLote('JERINGA ATP', '35 GR', 'EN', 24, 'EN0112', 0, 12),

      // ── OLIVITASAN (OL) ──
      conLote('OLIVITASAN', '100 ML', 'OL', 40, 'OL0896', 1, 25),
      conLote('OLIVITASAN', '25 ML', 'OL', 20, 'OL0897', 0, 4),
      conLote('OLIVITASAN', '300 ML', 'OL', 24, 'OL0896', 6, 1),
      conLote('OLIVITASAN', '500 ML', 'OL', 20, 'OL0900', 50, 11),

      // ── OLIVITASAN PLUS (PL) ──
      conLote('OLIVITASAN PLUS', '50 ML', 'PL', 40, 'PL0578', 8, 18),
      sinStock('OLIVITASAN PLUS', '250 ML', 'PL', 24),
      // Dos filas sumadas: 93+60=153 cajas, 9+0=9 sueltos
      conLote('OLIVITASAN PLUS', '500 ML', 'PL', 20, 'PL0578', 153, 9),

      // ── SUPERCOMPLEJO B (SC) ──
      conLote('SUPERCOMPLEJO B AVES', '1 L', 'SC', 12, 'SC0012', 0, 4),
      sinStock('SUPERCOMPLEJO B EQUINO', '1 L', 'SC', 12),

      // ── TILCOSAN (TM) ──
      conLote('TILCOSAN', '100 ML', 'TM', 24, 'TM0035', 39, 4),
      conLote('TILCOSAN', '250 ML', 'TM', 24, 'TM0036', 29, 14),

      // ── VITAMINA B1 (VB) ──
      conLote('VITAMINA B1', '100 ML', 'VB', 24, 'VB0017', 37, 20),

      // ── VITAMINA B12 (BB) ──
      conLote('VITAMINA B12', '100 ML', 'BB', 24, 'BB005', 30, 22),
      conLote('VITAMINA B12', '50 ML', 'BB', 30, 'BB005', 0, 19),
    ]

    console.log(`\n🗑️  Eliminando productos existentes...`)
    const { deletedCount } = await ProductModel.deleteMany({})
    console.log(`   Eliminados: ${deletedCount}`)

    console.log(`\n📦 Insertando ${productos.length} productos del depósito...`)
    await ProductModel.insertMany(productos)

    // Resumen
    const conStock = productos.filter(p => p.stockTotal.totalUnidades > 0)
    const sinStockList = productos.filter(p => p.stockTotal.totalUnidades === 0)
    const totalUnidades = productos.reduce((sum, p) => sum + p.stockTotal.totalUnidades, 0)

    console.log(`\n✅ Seed completado exitosamente:`)
    console.log(`   Total productos: ${productos.length}`)
    console.log(`   Con stock: ${conStock.length}`)
    console.log(`   Sin stock: ${sinStockList.length}`)
    console.log(`   Total unidades en depósito: ${totalUnidades.toLocaleString()}`)

    console.log(`\n📋 Detalle:`)
    productos.forEach(p => {
      const stock = p.stockTotal.totalUnidades > 0
        ? `${p.stockTotal.cajas}c + ${p.stockTotal.sueltos}s = ${p.stockTotal.totalUnidades}u`
        : '(sin stock)'
      console.log(`   [${p.codigoSKU}] ${p.nombreCompleto} — ${stock}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

seedDeposito()
