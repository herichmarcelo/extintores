import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./src/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true, // <--- COLOQUE ISSO AQUI
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        // Check if password is already hashed (starts with $2a$, $2b$, or $2y$)
        let passwordMatch = false
        try {
          const isHashed = user.senha.startsWith('$2a$') || user.senha.startsWith('$2b$') || user.senha.startsWith('$2y$')
          if (isHashed) {
            passwordMatch = await bcrypt.compare(credentials.password as string, user.senha)
          } else {
            passwordMatch = user.senha === credentials.password
          }
        } catch (error) {
          console.error('Password check error:', error)
          passwordMatch = user.senha === credentials.password
        }

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          image: null,
          perfil: user.perfil,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.perfil = (user as any).perfil
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.perfil = token.perfil as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
