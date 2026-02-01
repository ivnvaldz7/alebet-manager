import 'next-auth'
import type { UserRole, AdminContext } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      contexto: AdminContext | null
      activo: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    contexto: AdminContext | null
    activo: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    contexto: AdminContext | null
    activo: boolean
  }
}
