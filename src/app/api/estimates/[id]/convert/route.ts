import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const business = await prisma.business.findUnique({ where: { userId: user.id } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, businessId: business.id },
      include: { lineItems: true },
    })

    if (!estimate) return NextResponse.json({ error: "Estimate not found" }, { status: 404 })

    const invoiceCount = await prisma.invoice.count({ where: { businessId: business.id } })
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, "0")}`

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoice = await prisma.invoice.create({
      data: {
        businessId: business.id,
        clientId: estimate.clientId,
        invoiceNumber,
        status: "DRAFT",
        issueDate: new Date(),
        dueDate,
        currency: estimate.currency,
        subtotal: estimate.subtotal,
        taxRate: estimate.taxRate,
        taxAmount: estimate.taxAmount,
        total: estimate.total,
        notes: estimate.notes,
        terms: estimate.terms,
        lineItems: {
          create: estimate.lineItems.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            taxable: item.taxable,
            sortOrder: i,
          })),
        },
      },
    })

    await prisma.estimate.update({
      where: { id: params.id },
      data: { status: "CONVERTED", convertedToInvoiceId: invoice.id },
    })

    return NextResponse.json({ invoiceId: invoice.id, invoiceNumber })
  } catch (error) {
    console.error("Convert estimate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
