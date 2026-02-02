import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import ProductModel from '@/lib/models/Product'

// GET - Listar productos (incluyendo inactivos para admin)
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

    const productos = await ProductModel.find({ activo: true })
      .sort({ nombreCompleto: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: productos,
    })
  } catch (error: any) {
    console.error('Error en GET /api/productos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear producto (solo admin)
export async function POST(request: NextRequest) {
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
    if (!body.nombre || !body.presentacion) {
      return NextResponse.json(
        { success: false, error: 'Nombre y presentación son requeridos' },
        { status: 400 }
      )
    }

    await connectDB()

    // Crear producto
    const nuevoProducto = await ProductModel.create({
      nombre: body.nombre,
      variante: body.variante || null,
      presentacion: body.presentacion,
      codigoSKU: body.codigoSKU,
      stockTotal: {
        cajas: 0,
        sueltos: 0,
        unidadesPorCaja: body.unidadesPorCaja || 1,
        totalUnidades: 0,
      },
      lotes: [],
      stockMinimo: body.stockMinimo || 0,
      activo: true,
    })

    return NextResponse.json({
      success: true,
      data: nuevoProducto,
      message: 'Producto creado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en POST /api/productos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
