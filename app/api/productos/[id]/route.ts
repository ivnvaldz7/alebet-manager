import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import connectDB from '@/lib/db/mongoose'
import ProductModel from '@/lib/models/Product'

// GET - Obtener producto por ID
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

    const producto = await ProductModel.findById(params.id).lean()

    if (!producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: producto,
    })
  } catch (error: any) {
    console.error('Error en GET /api/productos/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar producto
export async function PATCH(
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

    const body = await request.json()

    await connectDB()

    const producto = await ProductModel.findById(params.id)

    if (!producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar campos
    if (body.nombre) producto.nombre = body.nombre
    if (body.variante !== undefined) producto.variante = body.variante
    if (body.presentacion) producto.presentacion = body.presentacion
    if (body.codigoSKU) producto.codigoSKU = body.codigoSKU
    if (body.stockMinimo !== undefined) producto.stockMinimo = body.stockMinimo
    if (typeof body.activo === 'boolean') producto.activo = body.activo

    await producto.save()

    return NextResponse.json({
      success: true,
      data: producto,
      message: 'Producto actualizado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en PATCH /api/productos/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar producto (desactivar)
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

    const producto = await ProductModel.findByIdAndUpdate(
      params.id,
      { activo: false },
      { new: true }
    )

    if (!producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Producto desactivado exitosamente',
    })
  } catch (error: any) {
    console.error('Error en DELETE /api/productos/[id]:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
