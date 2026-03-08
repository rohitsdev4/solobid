import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.business) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const businessId = user.business.id
    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get("type") || "aging"

    if (reportType === "aging") {
      const now = new Date()
      const invoices = await prisma.invoice.findMany({
        where: {
          businessId,
          status: { in: ["SENT", "VIEWED", "OVERDUE", "PARTIALLY_PAID"] },
        },
        include: { client: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
      })

      const aging = { current: [] as any[], days30: [] as any[], days60: [] as any[], days90: [] as any[], over90: [] as any[] }

      for (const inv of invoices) {
        const balance = Number(inv.total) - Number(inv.amountPaid)
        if (balance <= 0) continue

        const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        const item = {
          invoiceNumber: inv.invoiceNumber,
          client: inv.client.name,
          total: Number(inv.total),
          balance,
          dueDate: inv.dueDate,
          daysOverdue: Math.max(0, daysOverdue),
          currency: inv.currency,
        }

        if (daysOverdue <= 0) aging.current.push(item)
        else if (daysOverdue <= 30) aging.days30.push(item)
        else if (daysOverdue <= 60) aging.days60.push(item)
        else if (daysOverdue <= 90) aging.days90.push(item)
        else aging.over90.push(item)
      }

      const totals = {
        current: aging.current.reduce((s, i) => s + i.balance, 0),
        days30: aging.days30.reduce((s, i) => s + i.balance, 0),
        days60: aging.days60.reduce((s, i) => s + i.balance, 0),
        days90: aging.days90.reduce((s, i) => s + i.balance, 0),
        over90: aging.over90.reduce((s, i) => s + i.balance, 0),
      }

      return NextResponse.json({ aging, totals })
    }

    if (reportType === "by-client") {
      const clients = await prisma.client.findMany({
        where: { businessId },
        include: {
          invoices: {
            where: { status: "PAID" },
            select: { total: true, currency: true },
          },
          _count: { select: { invoices: true } },
        },
      })

      const clientRevenue = clients
        .map((c) => ({
          id: c.id,
          name: c.name,
          invoiceCount: c._count.invoices,
          revenue: c.invoices.reduce((s, i) => s + Number(i.total), 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)

      return NextResponse.json({ clientRevenue })
    }

    if (reportType === "tax") {
      const paidInvoices = await prisma.invoice.findMany({
        where: { businessId, status: "PAID" },
        select: { taxAmount: true, currency: true, paidAt: true },
      })

      const totalTax = paidInvoices.reduce((s, i) => s + Number(i.taxAmount), 0)

      return NextResponse.json({ totalTax, invoiceCount: paidInvoices.length })
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  } catch (error) {
    console.error("Reports error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
