import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { stripe } from "@/lib/stripe"

// POST - Create Stripe payment link for invoice
export async function POST(
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
      include: { client: true, business: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (invoice.stripePaymentUrl) {
      return NextResponse.json({ paymentUrl: invoice.stripePaymentUrl })
    }

    const balance = Number(invoice.total) - Number(invoice.amountPaid)
    if (balance <= 0) {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: `Payment to ${invoice.business.name}`,
            },
            unit_amount: Math.round(balance * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        businessId: invoice.businessId,
      },
      customer_email: invoice.client.email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}?payment=cancelled`,
    })

    // Save payment URL to invoice
    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        stripePaymentIntentId: session.id,
        stripePaymentUrl: session.url,
      },
    })

    return NextResponse.json({ paymentUrl: session.url })
  } catch (error) {
    console.error("Stripe payment link error:", error)
    return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 })
  }
}
