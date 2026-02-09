import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import OrderModel from '@/lib/models/Order'
import ProductModel from '@/lib/models/Product'
import { generarNumeroPedido } from '@/lib/utils/format'
import { tieneStockSuficiente } from '@/lib/utils/stock-calculator'
import type { CreateOrderInput, ApiResponse } from '@/types'

// GET - Listar pedidos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Construir filtro
    const filter: any = {}

    // Si es vendedor, ve pedidos donde es creador O armador
    if (session.user.role === 'vendedor') {
      filter.$or = [
        { 'creadoPor._id': session.user.id },
        { 'armadoPor._id': session.user.id },
      ]
    }

    // Filtro por estado
    if (estado && estado !== 'todos') {
      filter.estado = estado
    }

    const pedidos = await OrderModel.find(filter)
      .sort({ fechaCreacion: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: pedidos,
    })
  } catch (error: any) {
    console.error('Error en GET /api/pedidos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear pedido
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body: CreateOrderInput = await request.json()

    // Validaciones
    if (!body.cliente?.nombre) {
      return NextResponse.json(
        { success: false, error: 'El nombre del cliente es requerido' },
        { status: 400 }
      )
    }

    if (!body.productos || body.productos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debe agregar al menos un producto' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verificar stock y preparar productos
    const productosConInfo = []
    let hayStockInsuficiente = false

    for (const item of body.productos) {
      const producto = await ProductModel.findById(item.productoId)

      if (!producto) {
        return NextResponse.json(
          {
            success: false,
            error: `Producto ${item.productoId} no encontrado`,
          },
          { status: 404 }
        )
      }

      const totalUnidades =
        item.cantidadCajas * producto.stockTotal.unidadesPorCaja +
        item.cantidadSueltos

      // Verificar stock
      const stockSuficiente = tieneStockSuficiente(
        producto,
        item.cantidadCajas,
        item.cantidadSueltos
      )

      if (!stockSuficiente) {
        hayStockInsuficiente = true
      }

      productosConInfo.push({
        productoId: producto._id.toString(),
        nombreCompleto: producto.nombreCompleto,
        codigoSKU: producto.codigoSKU,
        cantidadCajas: item.cantidadCajas,
        cantidadSueltos: item.cantidadSueltos,
        unidadesPorCaja: producto.stockTotal.unidadesPorCaja,
        totalUnidades,
        lotesAsignados: [], // Se asignan al aprobar
      })
    }

    // Crear pedido
    const numeroPedido = generarNumeroPedido()

    const nuevoPedido = await OrderModel.create({
      numeroPedido,
      cliente: body.cliente,
      productos: productosConInfo,
      estado: 'pendiente',
      creadoPor: {
        _id: session.user.id,
        nombre: session.user.name,
      },
      stockInsuficiente: hayStockInsuficiente,
      observaciones: body.observaciones || '',
      etiquetas: {
        generadas: false,
        cantidadTotal: productosConInfo.reduce(
          (sum, p) => sum + p.cantidadCajas,
          0
        ),
        urlPDF: null,
      },
    })

    return NextResponse.json({
      success: true,
      data: nuevoPedido,
      message: hayStockInsuficiente
        ? 'Pedido creado con advertencia de stock'
        : 'Pedido creado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en POST /api/pedidos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
