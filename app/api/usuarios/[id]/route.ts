import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import UserModel from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import type { UpdateUserInput } from '@/types'

// GET - Obtener usuario por ID
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

    // Los usuarios solo pueden ver su propio perfil, excepto admin
    if (session.user.role !== 'admin' && session.user.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }

    const usuario = await UserModel.findById(params.id)
      .select('-password')
      .lean()

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: usuario,
    })
  } catch (error: any) {
    console.error('Error en GET /api/usuarios/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar usuario
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

    const body: UpdateUserInput = await request.json()

    await connectDB()

    const usuario = await UserModel.findById(params.id)

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Solo admin puede editar otros usuarios o cambiar roles
    if (session.user.role !== 'admin' && session.user.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Solo admin puede cambiar roles
    if (body.rol && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Solo admin puede cambiar roles' },
        { status: 403 }
      )
    }

    // Actualizar campos permitidos
    if (body.nombre) usuario.nombre = body.nombre
    if (body.email) usuario.email = body.email.toLowerCase()
    if (body.rol && session.user.role === 'admin') usuario.rol = body.rol
    if (body.password) {
      usuario.password = await bcrypt.hash(body.password, 10)
    }
    if (typeof body.activo === 'boolean' && session.user.role === 'admin') {
      usuario.activo = body.activo
    }

    await usuario.save()

    const usuarioActualizado = await UserModel.findById(usuario._id)
      .select('-password')
      .lean()

    return NextResponse.json({
      success: true,
      data: usuarioActualizado,
      message: 'Usuario actualizado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en PATCH /api/usuarios/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar usuario (solo admin)
export async function DELETE(
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

    await connectDB()

    // No permitir eliminar tu propio usuario
    if (session.user.id === params.id) {
      return NextResponse.json(
        { success: false, error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      )
    }

    const usuario = await UserModel.findByIdAndDelete(params.id)

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en DELETE /api/usuarios/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
