import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db/mongoose'
import UserModel from '@/lib/models/User'
import type { User, UserWithoutPassword } from '@/types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        try {
          await connectDB()

          const user = await UserModel.findOne({
            email: credentials.email.toLowerCase(),
          }).lean()

          if (!user) {
            throw new Error('Usuario no encontrado')
          }

          if (!user.activo) {
            throw new Error('Usuario inactivo')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta')
          }

          // No devolver password en sesión
          const { password, ...userWithoutPassword } = user

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.nombre,
            role: user.rol,
            contexto: user.contextoActual,
            activo: user.activo,
          } as any
        } catch (error: any) {
          console.error('Error en authorize:', error)
          throw new Error(error.message || 'Error de autenticación')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
        token.contexto = (user as any).contexto
        token.activo = (user as any).activo
      }

      // Update session (cambio de contexto)
      if (trigger === 'update' && session) {
        token.contexto = session.contexto
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.contexto = token.contexto as string
        session.user.activo = token.activo as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
}
