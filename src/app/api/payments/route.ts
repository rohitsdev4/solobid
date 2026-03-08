import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "CHECK", "UPI", "PAYPAL", "STRIPE", "OTHER"]),
  reference: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paidAt: z.string().optional(),
})

// POST - Record a payment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const data = paymentSchema.parse(body)

    // Verify invoice belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, businessId: user.business.id },
    })
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const currentPaid = Number(invoice.amountPaid)
    const invoiceTotal = Number(invoice.total)
    const newTotalPaid = currentPaid + data.amount

    if (newTotalPaid > invoiceTotal) {
      return NextResponse.json(
        { error: `Payment exceeds balance. Maximum: ${(invoiceTotal - currentPaid).toFixed(2)}` },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        reference: data.reference || null,
        notes: data.notes || null,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      },
    })

    // Update invoice
    const newStatus = newTotalPaid >= invoiceTotal ? "PAID" : "PARTIALLY_PAID"
    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        amountPaid: newTotalPaid,
        status: newStatus,
        ...(newStatus === "PAID" && { paidAt: new Date() }),
      },
    })

    return NextResponse.json({ success: true, payment, newStatus, newTotalPaid }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
