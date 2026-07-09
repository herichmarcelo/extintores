import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./src/lib/prisma"
import bcrypt from "bcryptjs"
import authConfig from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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

        if (!user) {
          return null
        }

        // Check if password is already hashed (starts with $2a$, $2b$, or $2y$)
        const isHashed = user.senha.startsWith('$2a$') || user.senha.startsWith('$2b$') || user.senha.startsWith('$2y$')
        
        let passwordMatch = false
        if (isHashed) {
          // Compare hashed password
          passwordMatch = await bcrypt.compare(credentials.password, user.senha)
        } else {
          // Fallback for existing plaintext passwords
          passwordMatch = user.senha === credentials.password
        }

        if (!passwordMatch) {
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
})
