import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import ProductModel from '@/lib/models/Product'
import StockMovementModel from '@/lib/models/StockMovement'
import { recalcularStockTotal } from '@/lib/utils/stock-calculator'

// POST - Quitar stock de un lote
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string; numero: string }> }
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
    const { cajas, sueltos, motivo } = body

    await connectDB()

    const producto = await ProductModel.findById(params.id)

    if (!producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Buscar el lote
    const lote = producto.lotes.find(
      (l: { numero: string }) => l.numero === params.numero
    )

    if (!lote) {
      return NextResponse.json(
        { success: false, error: 'Lote no encontrado' },
        { status: 404 }
      )
    }

    // Validar que no se quite más de lo disponible
    const unidadesAQuitar = cajas * producto.stockTotal.unidadesPorCaja + sueltos

    if (unidadesAQuitar > lote.unidades) {
      return NextResponse.json(
        {
          success: false,
          error: `No puedes quitar ${unidadesAQuitar} unidades. El lote solo tiene ${lote.unidades} unidades.`,
        },
        { status: 400 }
      )
    }

    // Guardar valores anteriores
    const cajasAntes = lote.cajas
    const sueltosAntes = lote.sueltos

    // Restar cantidades
    lote.cajas -= cajas
    lote.sueltos -= sueltos

    // Ajustar si los sueltos quedan negativos
    if (lote.sueltos < 0) {
      lote.cajas -= 1
      lote.sueltos = producto.stockTotal.unidadesPorCaja + lote.sueltos
    }

    // Recalcular unidades del lote
    lote.unidades =
      lote.cajas * producto.stockTotal.unidadesPorCaja + lote.sueltos

    // Si el lote quedó en 0, eliminarlo
    if (lote.unidades === 0) {
      producto.lotes = producto.lotes.filter(
        (l: { numero: string }) => l.numero !== params.numero
      )
    }

    // Recalcular stock total
    producto.stockTotal = recalcularStockTotal(producto)

    await producto.save()

    // Registrar movimiento
    await StockMovementModel.create({
      tipo: 'ajuste_negativo',
      producto: {
        _id: producto._id.toString(),
        nombreCompleto: producto.nombreCompleto,
        codigoSKU: producto.codigoSKU,
      },
      lote: {
        numero: params.numero,
        cajasAntes,
        sueltosAntes,
        cajasDespues: lote.cajas,
        sueltosDespues: lote.sueltos,
        unidadesCambiadas: -unidadesAQuitar,
      },
      motivo: motivo || 'Descarte de mercaderia',
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
      message: 'Stock descontado correctamente',
    })
  } catch (error: unknown) {
    console.error(
      'Error en POST /api/productos/[id]/lotes/[numero]/quitar:',
      error
    )
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
