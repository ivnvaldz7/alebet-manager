import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import UserModel from '@/lib/models/User'
import bcrypt from 'bcryptjs'

// PATCH - Cambiar contraseña
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

    // Solo puede cambiar su propia contraseña (o admin puede cambiar cualquiera)
    if (session.user.role !== 'admin' && session.user.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado para cambiar esta contraseña' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { passwordActual, passwordNueva } = body

    // Validaciones
    if (!passwordNueva || passwordNueva.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres',
        },
        { status: 400 }
      )
    }

    await connectDB()

    const usuario = await UserModel.findById(params.id)

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si no es admin, validar contraseña actual
    if (session.user.role !== 'admin') {
      if (!passwordActual) {
        return NextResponse.json(
          { success: false, error: 'Debes proporcionar tu contraseña actual' },
          { status: 400 }
        )
      }

      const passwordValida = await bcrypt.compare(
        passwordActual,
        usuario.password
      )

      if (!passwordValida) {
        return NextResponse.json(
          { success: false, error: 'Contraseña actual incorrecta' },
          { status: 400 }
        )
      }
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(passwordNueva, 10)
    usuario.password = hashedPassword
    await usuario.save()

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    })
  } catch (error: unknown) {
    console.error('Error en PATCH /api/usuarios/[id]/password:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
