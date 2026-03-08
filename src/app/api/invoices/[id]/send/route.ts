import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { resend } from "@/lib/email"
import { z } from "zod"

const sendSchema = z.object({
  to: z.string().email("Invalid recipient email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().optional(),
})

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
      include: { client: true, lineItems: true, business: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const body = await req.json()
    const { to, subject, message } = sendSchema.parse(body)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const viewUrl = `${appUrl}/api/invoices/${invoice.id}/pdf`
    const brandColor = invoice.business.brandColor || "#2563eb"

    function fmt(amount: number) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency,
      }).format(Number(amount))
    }

    // Build email HTML
    const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${brandColor}; padding: 24px 30px; border-radius: 12px 12px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 22px;">${invoice.business.name}</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Invoice ${invoice.invoiceNumber}</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151;">Hi ${invoice.client.name},</p>

        ${message ? `<p style="font-size: 14px; color: #6b7280; margin: 16px 0;">${message}</p>` : ""}

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: #6b7280; padding: 4px 0;">Invoice #</td>
              <td style="text-align: right; font-weight: 600;">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 4px 0;">Amount</td>
              <td style="text-align: right; font-weight: 700; font-size: 18px; color: ${brandColor};">${fmt(Number(invoice.total))}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 4px 0;">Due Date</td>
              <td style="text-align: right; font-weight: 600;">${new Date(invoice.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${viewUrl}" style="display: inline-block; background: ${brandColor}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            View Invoice
          </a>
        </div>

        ${invoice.stripePaymentUrl ? `
        <div style="text-align: center; margin: 16px 0;">
          <a href="${invoice.stripePaymentUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Pay Now Online
          </a>
        </div>` : ""}

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Sent via <a href="https://solobid.com" style="color: ${brandColor}; text-decoration: none;">SoloBid</a> - Simple invoicing for solo service providers
        </p>
      </div>
    </div>`

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "invoices@solobid.com",
      to: [to],
      subject,
      html: emailHtml,
    })

    if (error) {
      console.error("Email send error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Update invoice status
    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Send invoice error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
