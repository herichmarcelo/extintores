import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./src/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          where: { email: credentials.email },
        })

        if (!user || user.senha !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          image: user.image,
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
