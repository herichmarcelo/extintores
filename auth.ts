import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./src/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("👉 [AUTH] 1. Iniciando authorize para:", credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [AUTH] Falha: Email ou senha vazios")
          return null
        }

        try {
          console.log("👉 [AUTH] 2. Buscando usuário no Prisma...")
          const user = await prisma.usuario.findUnique({
            where: { email: credentials.email as string },
          })

          console.log("👉 [AUTH] 3. Resposta do Prisma. Usuário existe?", !!user)

          if (!user) {
            console.log("❌ [AUTH] Falha: Usuário não encontrado no banco")
            return null
          }

          console.log("👉 [AUTH] 4. Usuário encontrado! Verificando senha...")
          let passwordMatch = false
          const isHashed = user.senha.startsWith('$2a$') || user.senha.startsWith('$2b$') || user.senha.startsWith('$2y$')
          
          if (isHashed) {
            console.log("👉 [AUTH] 4.1. Senha tem hash, usando bcrypt...")
            passwordMatch = await bcrypt.compare(credentials.password as string, user.senha)
          } else {
            console.log("👉 [AUTH] 4.2. Senha texto puro...")
            passwordMatch = user.senha === credentials.password
          }

          console.log("👉 [AUTH] 5. A senha bateu?", passwordMatch)

          if (!passwordMatch) {
            console.log("❌ [AUTH] Falha: Senha incorreta")
            return null
          }

          console.log("✅ [AUTH] 6. Tudo certo! Login aprovado.")
          return {
            id: user.id,
            name: user.nome,
            email: user.email,
            image: null,
            perfil: user.perfil,
          }
        } catch (error) {
          // SE O PRISMA OU BANCO ESTOURAR, VAMOS VER AQUI:
          console.error("🚨 [AUTH] ERRO FATAL NO PRISMA:", error)
          return null
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