import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

// GET single invoice
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, businessId: user.business.id },
      include: {
        client: true,
        lineItems: { orderBy: { sortOrder: "asc" } },
        payments: { orderBy: { paidAt: "desc" } },
        business: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error("Get invoice error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT - Update invoice (only if DRAFT)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, businessId: user.business.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const body = await req.json()

    // Handle status-only updates (e.g., marking as sent, cancelled)
    if (body.status && Object.keys(body).length <= 2) {
      const invoice = await prisma.invoice.update({
        where: { id: params.id },
        data: {
          status: body.status,
          ...(body.status === "SENT" && { sentAt: new Date() }),
          ...(body.status === "PAID" && { paidAt: new Date() }),
        },
      })
      return NextResponse.json({ success: true, invoice })
    }

    // Full update (line items included)
    if (body.lineItems) {
      // Recalculate totals
      const taxRate = body.taxRate ?? 0
      let subtotal = 0
      let taxAmount = 0
      for (const item of body.lineItems) {
        const lineTotal = (item.quantity || 1) * (item.rate || 0)
        subtotal += lineTotal
        if (item.taxable !== false && taxRate > 0) {
          taxAmount += lineTotal * (taxRate / 100)
        }
      }
      const total = subtotal + taxAmount

      // Delete old line items and create new ones
      await prisma.lineItem.deleteMany({ where: { invoiceId: params.id } })

      const invoice = await prisma.invoice.update({
        where: { id: params.id },
        data: {
          clientId: body.clientId || existing.clientId,
          issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          currency: body.currency,
          taxRate: taxRate > 0 ? taxRate : null,
          subtotal,
          taxAmount,
          total,
          notes: body.notes ?? existing.notes,
          terms: body.terms ?? existing.terms,
          templateId: body.templateId,
          lineItems: {
            create: body.lineItems.map((item: any, index: number) => ({
              description: item.description,
              quantity: item.quantity || 1,
              rate: item.rate || 0,
              taxable: item.taxable !== false,
              sortOrder: item.sortOrder ?? index,
            })),
          },
        },
        include: {
          client: true,
          lineItems: { orderBy: { sortOrder: "asc" } },
        },
      })

      return NextResponse.json({ success: true, invoice })
    }

    return NextResponse.json({ error: "Invalid update data" }, { status: 400 })
  } catch (error) {
    console.error("Update invoice error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE invoice (only if DRAFT)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, businessId: user.business.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }
    if (existing.status !== "DRAFT") {
      return NextResponse.json({ error: "Only draft invoices can be deleted" }, { status: 400 })
    }

    await prisma.invoice.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete invoice error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
