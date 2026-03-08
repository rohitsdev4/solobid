import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const business = await prisma.business.findUnique({ where: { userId: user.id } })
    if (!business) {
      return NextResponse.json({
        stats: { totalRevenue: 0, outstanding: 0, overdue: 0, totalInvoices: 0, totalClients: 0, paidThisMonth: 0 },
        recentInvoices: [],
        recentActivity: [],
        monthlyRevenue: [],
      })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const [invoices, clients, payments] = await Promise.all([
      prisma.invoice.findMany({
        where: { businessId: business.id },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.count({ where: { businessId: business.id, isArchived: false } }),
      prisma.payment.findMany({
        where: { invoice: { businessId: business.id } },
        orderBy: { paidAt: "desc" },
      }),
    ])

    const totalRevenue = invoices
      .filter(i => i.status === "PAID")
      .reduce((sum, i) => sum + Number(i.total), 0)

    const outstanding = invoices
      .filter(i => ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"].includes(i.status))
      .reduce((sum, i) => sum + Number(i.total) - Number(i.amountPaid), 0)

    const overdue = invoices.filter(i =>
      i.status !== "PAID" && i.status !== "CANCELLED" && new Date(i.dueDate) < now
    ).length

    const paidThisMonth = invoices
      .filter(i => i.status === "PAID" && i.paidAt && new Date(i.paidAt) >= startOfMonth)
      .reduce((sum, i) => sum + Number(i.total), 0)

    // Monthly revenue for chart (last 12 months)
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const revenue = invoices
        .filter(inv => inv.status === "PAID" && inv.paidAt && new Date(inv.paidAt) >= d && new Date(inv.paidAt) <= monthEnd)
        .reduce((sum, inv) => sum + Number(inv.total), 0)
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }),
        year: d.getFullYear(),
        revenue,
      }
    })

    return NextResponse.json({
      stats: {
        totalRevenue,
        outstanding,
        overdue,
        totalInvoices: invoices.length,
        totalClients: clients,
        paidThisMonth,
      },
      recentInvoices: invoices.slice(0, 5),
      monthlyRevenue,
    })
  } catch (error) {
    console.error("Dashboard GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
