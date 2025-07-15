import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // In a real app, you'd query your database here
        // For demo purposes, we'll use a mock user
        const user = {
          id: "1",
          email: credentials.email,
          name: "Demo User",
          subscription: "free",
          stripeCustomerId: undefined as string | undefined
        }

        // In a real app, you'd verify the password hash
        const isPasswordValid = true // await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: user.subscription,
          stripeCustomerId: user.stripeCustomerId
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.subscription = user.subscription
        token.stripeCustomerId = user.stripeCustomerId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ""
        session.user.subscription = token.subscription
        session.user.stripeCustomerId = token.stripeCustomerId
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
}
