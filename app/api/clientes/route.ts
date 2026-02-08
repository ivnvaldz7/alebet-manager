import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import CustomerModel from '@/lib/models/Customer'

// POST - Crear cliente
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()

    if (
      !body.nombre ||
      !body.direccion?.calle ||
      !body.direccion?.numero ||
      !body.direccion?.localidad
    ) {
      return NextResponse.json(
        { success: false, error: 'Nombre y dirección completa son requeridos' },
        { status: 400 }
      )
    }

    const cliente = await CustomerModel.create(body)

    return NextResponse.json({
      success: true,
      data: cliente,
      message: 'Cliente creado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en POST /api/clientes:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET - Buscar/listar clientes
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
    const query = searchParams.get('q')

    let clientes

    if (query) {
      clientes = await CustomerModel.find({
        nombre: { $regex: query, $options: 'i' },
      })
        .limit(10)
        .lean()
    } else {
      clientes = await CustomerModel.find()
        .sort({ updatedAt: -1 })
        .limit(100)
        .lean()
    }

    return NextResponse.json({
      success: true,
      data: clientes,
    })
  } catch (error: any) {
    console.error('Error en GET /api/clientes:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
