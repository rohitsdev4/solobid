import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// Server-side HTML-to-PDF approach (works without react-pdf SSR issues)
// Generates a styled HTML invoice that can be printed/saved as PDF
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
        business: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const templateId = invoice.templateId || "modern"
    const brandColor = invoice.business.brandColor || "#2563eb"

    function fmt(amount: number) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency,
      }).format(Number(amount))
    }

    // Template styles
    const templates: Record<string, { headerBg: string; headerText: string; accent: string; tableBg: string }> = {
      modern: { headerBg: brandColor, headerText: "#ffffff", accent: brandColor, tableBg: "#f8fafc" },
      corporate: { headerBg: "#1e293b", headerText: "#ffffff", accent: "#0f172a", tableBg: "#f1f5f9" },
      minimal: { headerBg: "#ffffff", headerText: "#111827", accent: "#6b7280", tableBg: "#ffffff" },
      classic: { headerBg: "#1e40af", headerText: "#ffffff", accent: "#1e40af", tableBg: "#eff6ff" },
      colorful: { headerBg: brandColor, headerText: "#ffffff", accent: brandColor, tableBg: `${brandColor}10` },
    }

    const t = templates[templateId] || templates.modern

    const lineItemsHtml = invoice.lineItems.map((item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">${Number(item.quantity)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">${fmt(Number(item.rate))}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${fmt(Number(item.quantity) * Number(item.rate))}</td>
      </tr>
    `).join("")

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #374151; line-height: 1.5; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
    @media print { .invoice { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding: 30px; background: ${t.headerBg}; border-radius: 12px; color: ${t.headerText};">
      <div>
        <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">${invoice.business.name}</h1>
        ${invoice.business.email ? `<p style="opacity: 0.8; font-size: 14px;">${invoice.business.email}</p>` : ""}
        ${invoice.business.phone ? `<p style="opacity: 0.8; font-size: 14px;">${invoice.business.phone}</p>` : ""}
        ${invoice.business.address ? `<p style="opacity: 0.8; font-size: 14px;">${[invoice.business.address, invoice.business.city, invoice.business.state, invoice.business.zipCode].filter(Boolean).join(", ")}</p>` : ""}
      </div>
      <div style="text-align: right;">
        <h2 style="font-size: 24px; font-weight: 700; letter-spacing: 2px;">INVOICE</h2>
        <p style="font-size: 16px; opacity: 0.9; margin-top: 4px;">#${invoice.invoiceNumber}</p>
      </div>
    </div>

    <!-- Meta + Bill To -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>
        <p style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 8px;">Bill To</p>
        <p style="font-weight: 600; font-size: 16px; color: #111827;">${invoice.client.name}</p>
        ${invoice.client.email ? `<p style="color: #6b7280; font-size: 14px;">${invoice.client.email}</p>` : ""}
        ${invoice.client.phone ? `<p style="color: #6b7280; font-size: 14px;">${invoice.client.phone}</p>` : ""}
        ${invoice.client.address ? `<p style="color: #6b7280; font-size: 14px;">${[invoice.client.address, invoice.client.city, invoice.client.state, invoice.client.country].filter(Boolean).join(", ")}</p>` : ""}
      </div>
      <div style="text-align: right;">
        <p style="font-size: 14px; margin-bottom: 4px;"><span style="color: #9ca3af;">Issue Date:</span> <strong>${new Date(invoice.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></p>
        <p style="font-size: 14px;"><span style="color: #9ca3af;">Due Date:</span> <strong>${new Date(invoice.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></p>
      </div>
    </div>

    <!-- Line Items -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: ${t.tableBg};">
          <th style="padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Description</th>
          <th style="padding: 12px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Qty</th>
          <th style="padding: 12px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Rate</th>
          <th style="padding: 12px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
      <div style="width: 280px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
          <span style="color: #6b7280;">Subtotal</span>
          <span style="font-weight: 500;">${fmt(Number(invoice.subtotal))}</span>
        </div>
        ${invoice.taxRate && Number(invoice.taxRate) > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
          <span style="color: #6b7280;">Tax (${Number(invoice.taxRate)}%)</span>
          <span style="font-weight: 500;">${fmt(Number(invoice.taxAmount))}</span>
        </div>` : ""}
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid ${t.accent}; margin-top: 8px;">
          <span style="font-size: 18px; font-weight: 700;">Total</span>
          <span style="font-size: 18px; font-weight: 700; color: ${t.accent};">${fmt(Number(invoice.total))}</span>
        </div>
        ${Number(invoice.amountPaid) > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #16a34a;">
          <span>Paid</span>
          <span>-${fmt(Number(invoice.amountPaid))}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #e5e7eb;">
          <span style="font-size: 16px; font-weight: 700; color: ${t.accent};">Balance Due</span>
          <span style="font-size: 16px; font-weight: 700; color: ${t.accent};">${fmt(Number(invoice.total) - Number(invoice.amountPaid))}</span>
        </div>` : ""}
      </div>
    </div>

    <!-- Notes & Terms -->
    ${invoice.notes ? `
    <div style="margin-bottom: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
      <p style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 4px;">Notes</p>
      <p style="font-size: 14px; color: #4b5563;">${invoice.notes}</p>
    </div>` : ""}
    ${invoice.terms ? `
    <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
      <p style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 4px;">Terms & Conditions</p>
      <p style="font-size: 14px; color: #4b5563;">${invoice.terms}</p>
    </div>` : ""}

    <!-- Footer -->
    <div style="margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>Generated by SoloBid - Simple invoicing for solo service providers</p>
    </div>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
