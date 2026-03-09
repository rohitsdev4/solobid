import { cookies } from "next/headers"
import prisma from "@/lib/db"

export async function getCurrentUser() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("session-token")?.value

  if (!sessionToken) {
    return null
  }

  try {
    const decoded = JSON.parse(Buffer.from(sessionToken, "base64").toString())
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        business: true,
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
    createdAt: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
}

export function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete("session-token")
}
