'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { UserRole, AdminContext } from '@/types'

export function useAuth(requireAuth: boolean = true) {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, requireAuth, router])

  const cambiarContexto = async (nuevoContexto: AdminContext) => {
    if (session?.user.role !== 'admin') {
      throw new Error('Solo admin puede cambiar contexto')
    }

    await update({
      contexto: nuevoContexto,
    })
  }

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    cambiarContexto,
  }
}

export function useRequireRole(rolesPermitidos: UserRole[]) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && !rolesPermitidos.includes(user.role)) {
      router.push('/inicio')
    }
  }, [user, isLoading, rolesPermitidos, router])

  return { user, isLoading }
}
