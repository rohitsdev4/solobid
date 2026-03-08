import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const business = await prisma.business.findUnique({ where: { userId: user.id } })
    if (!business) return NextResponse.json({ clients: [] })

    const sp = request.nextUrl.searchParams
    const search = sp.get("search") || ""

    const where: any = { businessId: business.id, isArchived: false }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { invoices: true, estimates: true } },
      },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Clients GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const business = await prisma.business.findUnique({ where: { userId: user.id } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        zipCode: body.zipCode?.trim() || null,
        country: body.country?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Clients POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
