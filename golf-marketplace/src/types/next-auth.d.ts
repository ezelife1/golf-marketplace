import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      subscription?: string
      stripeCustomerId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    subscription?: string
    stripeCustomerId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    subscription?: string
    stripeCustomerId?: string
  }
}
