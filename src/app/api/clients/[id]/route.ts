import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  isArchived: z.boolean().optional(),
})

// GET single client with invoices
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        businessId: user.business.id,
      },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            currency: true,
            issueDate: true,
            dueDate: true,
          },
        },
        estimates: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            estimateNumber: true,
            status: true,
            total: true,
            currency: true,
            issueDate: true,
          },
        },
        _count: {
          select: { invoices: true, estimates: true },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Get client error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT - Update client
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.client.findFirst({
      where: { id: params.id, businessId: user.business.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await req.json()
    const data = updateClientSchema.parse(body)

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.state !== undefined && { state: data.state || null }),
        ...(data.zipCode !== undefined && { zipCode: data.zipCode || null }),
        ...(data.country !== undefined && { country: data.country || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Update client error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE - Archive client (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const existing = await prisma.client.findFirst({
      where: { id: params.id, businessId: user.business.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    await prisma.client.update({
      where: { id: params.id },
      data: { isArchived: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Archive client error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
