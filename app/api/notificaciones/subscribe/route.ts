import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'

// Este endpoint guarda las suscripciones push
// Por ahora es un placeholder funcional

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // TODO: Guardar subscription en base de datos
    console.log('Push subscription para usuario:', session.user.email)
    console.log('Datos:', body)

    return NextResponse.json({
      success: true,
      message: 'Notificaciones activadas correctamente',
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
