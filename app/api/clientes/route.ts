import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import CustomerModel from '@/lib/models/Customer'

// GET - Buscar clientes
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
      // Búsqueda por nombre
      clientes = await CustomerModel.find({
        nombre: { $regex: query, $options: 'i' },
      })
        .limit(10)
        .lean()
    } else {
      // Sin query, devolver los más usados/recientes
      clientes = await CustomerModel.find()
        .sort({ updatedAt: -1 })
        .limit(20)
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
