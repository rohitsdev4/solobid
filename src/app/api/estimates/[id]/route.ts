import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, businessId: user.business.id },
      include: { client: true, lineItems: { orderBy: { sortOrder: "asc" } }, business: true },
    })

    if (!estimate) return NextResponse.json({ error: "Estimate not found" }, { status: 404 })
    return NextResponse.json({ estimate })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()

    // Status update (accept/reject/convert)
    if (body.status) {
      const estimate = await prisma.estimate.findFirst({
        where: { id: params.id, businessId: user.business.id },
      })
      if (!estimate) return NextResponse.json({ error: "Not found" }, { status: 404 })

      const updated = await prisma.estimate.update({
        where: { id: params.id },
        data: {
          status: body.status,
          ...(body.status === "SENT" && { sentAt: new Date() }),
        },
      })
      return NextResponse.json({ success: true, estimate: updated })
    }

    return NextResponse.json({ error: "Invalid update" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, businessId: user.business.id },
    })
    if (!estimate) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (estimate.status !== "DRAFT") {
      return NextResponse.json({ error: "Only draft estimates can be deleted" }, { status: 400 })
    }

    await prisma.estimate.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
