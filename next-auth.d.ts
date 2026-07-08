import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    perfil: string
  }
  
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      perfil: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    perfil: string
  }
}
