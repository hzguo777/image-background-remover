import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const runtime = 'edge'

// 强制锁死生产域名，防止 Cloudflare Pages 内部域名污染 baseUrl
const PRODUCTION_URL = "https://imagebackgroundremover.space"

const { handlers } = NextAuth({
secret: process.env.NEXTAUTH_SECRET,
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
return true
},
async redirect({ url, baseUrl }) {
const base = PRODUCTION_URL
if (url.startsWith("/")) return `${base}${url}`
try {
const urlObj = new URL(url)
if (urlObj.hostname.endsWith(".pages.dev")) return base
if (urlObj.origin === base) return url
} catch {}
return base
},
},
})

export const GET = handlers.GET
export const POST = handlers.POST
