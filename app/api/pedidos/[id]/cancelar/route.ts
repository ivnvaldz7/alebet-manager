import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import OrderModel from '@/lib/models/Order'

// POST - Cancelar pedido con motivo
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo admin o vendedor pueden cancelar
    if (session.user.role !== 'admin' && session.user.role !== 'vendedor') {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para cancelar pedidos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { motivo } = body

    if (!motivo || motivo.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Debes especificar un motivo' },
        { status: 400 }
      )
    }

    await connectDB()

    const pedido = await OrderModel.findById(params.id)

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Solo se puede cancelar si está pendiente o en_preparacion
    if (pedido.estado !== 'pendiente' && pedido.estado !== 'en_preparacion') {
      return NextResponse.json(
        {
          success: false,
          error: 'Solo se pueden cancelar pedidos pendientes o en preparacion',
        },
        { status: 400 }
      )
    }

    // Solo admin o el vendedor que lo creó pueden cancelarlo
    if (
      session.user.role !== 'admin' &&
      pedido.vendedor._id.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para cancelar este pedido' },
        { status: 403 }
      )
    }

    // Cancelar el pedido
    pedido.estado = 'cancelado'
    pedido.motivoCancelacion = motivo
    pedido.canceladoPor = {
      _id: session.user.id,
      nombre: session.user.name,
    }
    pedido.fechaCancelacion = new Date()

    await pedido.save()

    return NextResponse.json({
      success: true,
      data: pedido,
      message: 'Pedido cancelado correctamente',
    })
  } catch (error: unknown) {
    console.error('Error en POST /api/pedidos/[id]/cancelar:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
