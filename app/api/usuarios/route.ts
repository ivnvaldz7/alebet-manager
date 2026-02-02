import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import UserModel from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import type { CreateUserInput } from '@/types'

// GET - Listar usuarios (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const usuarios = await UserModel.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: usuarios,
    })
  } catch (error: any) {
    console.error('Error en GET /api/usuarios:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear usuario (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body: CreateUserInput = await request.json()

    // Validaciones
    if (!body.nombre || !body.email || !body.password || !body.rol) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (!['admin', 'vendedor', 'armador'].includes(body.rol)) {
      return NextResponse.json(
        { success: false, error: 'Rol inválido' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verificar si el email ya existe
    const existente = await UserModel.findOne({ email: body.email.toLowerCase() })
    if (existente) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash de password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Crear usuario
    const nuevoUsuario = await UserModel.create({
      nombre: body.nombre,
      email: body.email.toLowerCase(),
      password: hashedPassword,
      rol: body.rol,
      activo: body.activo !== false,
      contextoActual: body.rol === 'admin' ? 'admin' : null,
    })

    // Responder sin password
    const usuarioSinPassword = await UserModel.findById(nuevoUsuario._id)
      .select('-password')
      .lean()

    return NextResponse.json({
      success: true,
      data: usuarioSinPassword,
      message: 'Usuario creado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en POST /api/usuarios:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
