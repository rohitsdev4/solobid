import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceEmail({ to, subject, invoiceNumber, businessName, amount, currency, dueDate, paymentUrl }: { to: string; subject: string; invoiceNumber: string; businessName: string; amount: string; currency: string; dueDate: string; paymentUrl?: string }) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [to],
    subject,
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #2563eb;">Invoice ${invoiceNumber}</h2><p>You have a new invoice from <strong>${businessName}</strong>.</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0;"><strong>Amount:</strong> ${currency} ${amount}</p><p style="margin: 8px 0 0;"><strong>Due Date:</strong> ${dueDate}</p></div>${paymentUrl ? `<a href="${paymentUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Pay Now</a>` : ""}<p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">Sent via SoloBid</p></div>`,
  })
  if (error) throw error
  return data
}
