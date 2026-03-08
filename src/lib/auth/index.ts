import { cookies } from "next/headers"
import prisma from "@/lib/db"

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("session-token")?.value

    if (!token) return null

    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    if (!decoded.userId || !decoded.exp || Date.now() > decoded.exp) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        businessName: true,
        businessEmail: true,
        businessPhone: true,
        businessAddress: true,
        currency: true,
        logoUrl: true,
        onboarded: true,
        plan: true,
        createdAt: true,
      },
    })

    return user
  } catch {
    return null
  }
}

export function createSessionToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    iat: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  })
}

export function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete("session-token")
}
