import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/","/login","/signup","/pricing","/privacy","/terms","/forgot-password","/reset-password","/api/auth","/api/webhooks"]
const publicPrefixes = ["/api/auth/","/api/webhooks/","/_next/","/favicon","/manifest","/sw.js","/icon-","/og-"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (publicPaths.includes(pathname)) return NextResponse.next()
  for (const prefix of publicPrefixes) { if (pathname.startsWith(prefix)) return NextResponse.next() }
  if (pathname.includes(".")) return NextResponse.next()
  const token = request.cookies.get("session-token")?.value
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    if (!decoded.userId || !decoded.exp || Date.now() > decoded.exp) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("session-token")
      return response
    }
  } catch {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("session-token")
    return response
  }
  return NextResponse.next()
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] }
