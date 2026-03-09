import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { resend } from "@/lib/email"

// This endpoint is called by a cron job to send payment reminders
// Can be triggered by Vercel Cron or external scheduler
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Find invoices needing reminders
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["SENT", "VIEWED", "OVERDUE", "PARTIALLY_PAID"] },
        dueDate: { lte: threeDaysFromNow },
      },
      include: {
        client: true,
        business: true,
      },
    })

    let sent = 0
    let markedOverdue = 0

    for (const invoice of invoices) {
      if (!invoice.client.email) continue

      const dueDate = new Date(invoice.dueDate)
      const isOverdue = dueDate < now

      // Mark overdue if needed
      if (isOverdue && invoice.status !== "OVERDUE" && invoice.status !== "PARTIALLY_PAID") {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "OVERDUE" },
        })
        markedOverdue++
      }

      const brandColor = invoice.business.brandColor || "#2563eb"
      const balance = Number(invoice.total) - Number(invoice.amountPaid)

      const fmt = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: invoice.currency,
        }).format(amount)
      }

      let subject: string
      let urgency: string

      if (!isOverdue) {
        subject = `Reminder: Invoice ${invoice.invoiceNumber} due soon`
        urgency = "upcoming"
      } else if (dueDate > sevenDaysAgo) {
        subject = `Invoice ${invoice.invoiceNumber} is past due`
        urgency = "overdue"
      } else if (dueDate > fourteenDaysAgo) {
        subject = `Urgent: Invoice ${invoice.invoiceNumber} is overdue`
        urgency = "urgent"
      } else {
        subject = `Final Notice: Invoice ${invoice.invoiceNumber}`
        urgency = "final"
      }

      const urgencyColors: Record<string, string> = {
        upcoming: "#f59e0b",
        overdue: "#ef4444",
        urgent: "#dc2626",
        final: "#991b1b",
      }

      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "invoices@solobid.com",
          to: [invoice.client.email],
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: ${urgencyColors[urgency]};">Payment Reminder</h2>
              <p>Hi ${invoice.client.name},</p>
              <p>This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> from <strong>${invoice.business.name}</strong> ${isOverdue ? "was due" : "is due"} on <strong>${dueDate.toLocaleDateString()}</strong>.</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0;"><strong>Balance Due:</strong> ${fmt(balance)}</p>
              </div>
              ${invoice.stripePaymentUrl ? `<a href="${invoice.stripePaymentUrl}" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Pay Now</a>` : ""}
              <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Sent via SoloBid</p>
            </div>
          `,
        })
        sent++
      } catch (emailErr) {
        console.error(`Failed to send reminder for ${invoice.invoiceNumber}:`, emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      processed: invoices.length,
      remindersSent: sent,
      markedOverdue,
    })
  } catch (error) {
    console.error("Reminder cron error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
