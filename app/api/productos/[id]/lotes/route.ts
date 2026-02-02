import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import ProductModel from '@/lib/models/Product'
import StockMovementModel from '@/lib/models/StockMovement'
import { generarProximoLote, validarLote, calcularUnidadesTotales } from '@/lib/utils/fifo'
import { recalcularStockTotal } from '@/lib/utils/stock-calculator'

// POST - Agregar lote al producto
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validaciones
    if (!body.cajas && !body.sueltos) {
      return NextResponse.json(
        { success: false, error: 'Debe especificar cajas o sueltos' },
        { status: 400 }
      )
    }

    await connectDB()

    const producto = await ProductModel.findById(params.id)

    if (!producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const cajas = body.cajas || 0
    const sueltos = body.sueltos || 0

    // Validar lote
    const validacion = validarLote(cajas, sueltos, producto.stockTotal.unidadesPorCaja)
    if (!validacion.valid) {
      return NextResponse.json(
        { success: false, error: validacion.error },
        { status: 400 }
      )
    }

    // Generar número de lote
    const numeroLote = generarProximoLote(producto.codigoSKU, producto.lotes)

    // Calcular unidades
    const unidades = calcularUnidadesTotales(cajas, sueltos, producto.stockTotal.unidadesPorCaja)

    // Determinar orden (último + 1)
    const maxOrden =
      producto.lotes.length > 0 ? Math.max(...producto.lotes.map((l: any) => l.orden)) : 0

    // Crear lote
    const nuevoLote = {
      numero: numeroLote,
      cajas,
      sueltos,
      unidades,
      fechaProduccion: body.fechaProduccion ? new Date(body.fechaProduccion) : new Date(),
      fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : undefined,
      orden: maxOrden + 1,
    }

    producto.lotes.push(nuevoLote)

    // Recalcular stock total
    producto.stockTotal = recalcularStockTotal(producto)

    await producto.save()

    // Registrar movimiento de stock
    await StockMovementModel.create({
      tipo: 'ingreso_compra',
      producto: {
        _id: producto._id.toString(),
        nombreCompleto: producto.nombreCompleto,
        codigoSKU: producto.codigoSKU,
      },
      lote: {
        numero: numeroLote,
        cajasAntes: 0,
        sueltosAntes: 0,
        cajasDespues: cajas,
        sueltosDespues: sueltos,
        unidadesCambiadas: unidades,
      },
      motivo: body.motivo || 'Ingreso de mercaderia',
      usuario: {
        _id: session.user.id,
        nombre: session.user.name,
        rol: session.user.role,
        contexto: session.user.contexto,
      },
      fecha: new Date(),
    })

    return NextResponse.json({
      success: true,
      data: producto,
      message: `Lote ${numeroLote} agregado exitosamente`,
    })
  } catch (error: any) {
    console.error('Error en POST /api/productos/[id]/lotes:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
