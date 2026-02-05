import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import ProductModel from '@/lib/models/Product'
import StockMovementModel from '@/lib/models/StockMovement'
import {
  recalcularStockTotal,
  reordenarLotes,
} from '@/lib/utils/stock-calculator'

// PATCH - Editar lote
export async function PATCH(
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

    // Guardar valores anteriores para el registro
    const cajasAntes = lote.cajas
    const sueltosAntes = lote.sueltos
    const unidadesAntes = lote.unidades

    // Actualizar lote
    if (typeof body.cajas === 'number') lote.cajas = body.cajas
    if (typeof body.sueltos === 'number') lote.sueltos = body.sueltos
    if (body.fechaProduccion) lote.fechaProduccion = new Date(body.fechaProduccion)
    if (body.fechaVencimiento) lote.fechaVencimiento = new Date(body.fechaVencimiento)

    // Recalcular unidades del lote
    lote.unidades = lote.cajas * producto.stockTotal.unidadesPorCaja + lote.sueltos

    // Recalcular stock total del producto
    producto.stockTotal = recalcularStockTotal(producto)

    await producto.save()

    // Registrar movimiento si cambio la cantidad
    const unidadesCambiadas = lote.unidades - unidadesAntes

    if (unidadesCambiadas !== 0) {
      await StockMovementModel.create({
        tipo: 'ajuste_inventario',
        producto: {
          _id: producto._id.toString(),
          nombreCompleto: producto.nombreCompleto,
          codigoSKU: producto.codigoSKU,
        },
        lote: {
          numero: lote.numero,
          cajasAntes,
          sueltosAntes,
          cajasDespues: lote.cajas,
          sueltosDespues: lote.sueltos,
          unidadesCambiadas,
        },
        motivo: 'Edicion manual de lote',
        usuario: {
          _id: session.user.id,
          nombre: session.user.name,
          rol: session.user.role,
          contexto: session.user.contexto,
        },
        fecha: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      data: producto,
      message: 'Lote actualizado correctamente',
    })
  } catch (error: unknown) {
    console.error('Error en PATCH /api/productos/[id]/lotes/[numero]:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar lote
export async function DELETE(
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

    // Registrar movimiento antes de eliminar
    await StockMovementModel.create({
      tipo: 'ajuste_manual',
      producto: {
        _id: producto._id.toString(),
        nombreCompleto: producto.nombreCompleto,
        codigoSKU: producto.codigoSKU,
      },
      lote: {
        numero: lote.numero,
        cajasAntes: lote.cajas,
        sueltosAntes: lote.sueltos,
        cajasDespues: 0,
        sueltosDespues: 0,
        unidadesCambiadas: -lote.unidades,
      },
      motivo: 'Eliminacion manual de lote',
      usuario: {
        _id: session.user.id,
        nombre: session.user.name,
        rol: session.user.role,
        contexto: session.user.contexto,
      },
      fecha: new Date(),
    })

    // Eliminar lote
    producto.lotes = producto.lotes.filter(
      (l: { numero: string }) => l.numero !== params.numero
    )

    // Reordenar lotes restantes
    producto.lotes = reordenarLotes(producto.lotes)

    // Recalcular stock
    producto.stockTotal = recalcularStockTotal(producto)

    await producto.save()

    return NextResponse.json({
      success: true,
      message: 'Lote eliminado correctamente',
    })
  } catch (error: unknown) {
    console.error('Error en DELETE /api/productos/[id]/lotes/[numero]:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
