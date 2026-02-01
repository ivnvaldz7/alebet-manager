import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import OrderModel from '@/lib/models/Order'
import ProductModel from '@/lib/models/Product'
import StockMovementModel from '@/lib/models/StockMovement'
import { descontarStockFIFO } from '@/lib/utils/fifo'
import { recalcularStockTotal } from '@/lib/utils/stock-calculator'

// GET - Obtener pedido por ID
export async function GET(
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

    await connectDB()

    const pedido = await OrderModel.findById(params.id).lean()

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pedido,
    })
  } catch (error: any) {
    console.error('Error en GET /api/pedidos/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar pedido (tomar, armar, confirmar)
export async function PATCH(
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

    const body = await request.json()
    const { action } = body

    await connectDB()

    const pedido = await OrderModel.findById(params.id)

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // ACCIÓN: Tomar pedido (armador)
    if (action === 'tomar') {
      if (pedido.estado !== 'pendiente') {
        return NextResponse.json(
          { success: false, error: 'El pedido ya no está pendiente' },
          { status: 400 }
        )
      }

      pedido.estado = 'en_preparacion'
      pedido.armadoPor = {
        _id: session.user.id,
        nombre: session.user.name,
      }
      pedido.fechaInicioPreparacion = new Date()

      await pedido.save()

      return NextResponse.json({
        success: true,
        data: pedido,
        message: 'Pedido tomado exitosamente',
      })
    }

    // ACCIÓN: Confirmar armado (descuenta stock con FIFO)
    if (action === 'confirmar') {
      if (pedido.estado !== 'en_preparacion') {
        return NextResponse.json(
          {
            success: false,
            error: 'El pedido no está en preparación',
          },
          { status: 400 }
        )
      }

      // Verificar que quien confirma es quien tomó el pedido
      if (pedido.armadoPor?._id !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Solo quien tomó el pedido puede confirmarlo',
          },
          { status: 403 }
        )
      }

      // Descontar stock con FIFO para cada producto
      for (const item of pedido.productos) {
        const producto = await ProductModel.findById(item.productoId)

        if (!producto) continue

        // Aplicar FIFO
        const resultado = descontarStockFIFO(
          producto,
          item.cantidadCajas,
          item.cantidadSueltos
        )

        if (!resultado.success) {
          return NextResponse.json(
            {
              success: false,
              error: `Error en ${producto.nombreCompleto}: ${resultado.error}`,
            },
            { status: 400 }
          )
        }

        // Actualizar lotes del producto
        for (const loteAfectado of resultado.lotesAfectados) {
          const lote = producto.lotes.find(
            (l) => l.numero === loteAfectado.numero
          )

          if (lote) {
            lote.cajas = loteAfectado.cajasRestantes
            lote.sueltos = loteAfectado.sueltosRestantes
            lote.unidades =
              loteAfectado.cajasRestantes *
                producto.stockTotal.unidadesPorCaja +
              loteAfectado.sueltosRestantes

            // Registrar lotes asignados en el pedido
            item.lotesAsignados.push({
              numero: loteAfectado.numero,
              cajas: loteAfectado.cajasDescontadas,
              sueltos: loteAfectado.sueltosDescontados,
              unidades: loteAfectado.unidadesDescontadas,
            })

            // Registrar movimiento de stock
            await StockMovementModel.create({
              tipo: 'egreso_pedido',
              producto: {
                _id: producto._id.toString(),
                nombreCompleto: producto.nombreCompleto,
                codigoSKU: producto.codigoSKU,
              },
              lote: {
                numero: loteAfectado.numero,
                cajasAntes:
                  loteAfectado.cajasRestantes +
                  loteAfectado.cajasDescontadas,
                sueltosAntes:
                  loteAfectado.sueltosRestantes +
                  loteAfectado.sueltosDescontados,
                cajasDespues: loteAfectado.cajasRestantes,
                sueltosDespues: loteAfectado.sueltosRestantes,
                unidadesCambiadas: -loteAfectado.unidadesDescontadas,
              },
              motivo: `Pedido ${pedido.numeroPedido} confirmado`,
              pedidoId: pedido._id.toString(),
              usuario: {
                _id: session.user.id,
                nombre: session.user.name,
                rol: session.user.role,
                contexto: session.user.contexto,
              },
              fecha: new Date(),
            })
          }
        }

        // Eliminar lotes agotados
        producto.lotes = producto.lotes.filter((l) => l.unidades > 0)

        // Recalcular stock total
        producto.stockTotal = recalcularStockTotal(producto)

        await producto.save()
      }

      // Actualizar pedido
      pedido.estado = 'aprobado'
      pedido.fechaAprobado = new Date()
      await pedido.save()

      return NextResponse.json({
        success: true,
        data: pedido,
        message: 'Pedido confirmado y stock descontado',
      })
    }

    // ACCIÓN: Marcar como listo
    if (action === 'listo') {
      if (pedido.estado !== 'aprobado') {
        return NextResponse.json(
          { success: false, error: 'El pedido no está aprobado' },
          { status: 400 }
        )
      }

      pedido.estado = 'listo'
      pedido.fechaListo = new Date()
      await pedido.save()

      return NextResponse.json({
        success: true,
        data: pedido,
        message: 'Pedido marcado como listo',
      })
    }

    // ACCIÓN: Cancelar
    if (action === 'cancelar') {
      if (pedido.estado === 'listo' || pedido.estado === 'cancelado') {
        return NextResponse.json(
          { success: false, error: 'No se puede cancelar este pedido' },
          { status: 400 }
        )
      }

      pedido.estado = 'cancelado'
      await pedido.save()

      return NextResponse.json({
        success: true,
        data: pedido,
        message: 'Pedido cancelado',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error en PATCH /api/pedidos/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
