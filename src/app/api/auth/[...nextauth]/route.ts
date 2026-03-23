import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const runtime = 'edge'

const { handlers } = NextAuth({
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // 允许所有登录
      return true
    },
    async redirect({ url, baseUrl }) {
      // 确保重定向到正确的 URL
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  debug: true, // 启用调试模式
})

export const GET = handlers.GET
export const POST = handlers.POST
