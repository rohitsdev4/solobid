import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: user.id },
    })

    if (!business) {
      return NextResponse.json({ invoices: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 }, stats: {} })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const where: any = { businessId: business.id }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
        { client: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.invoice.count({ where }),
    ])

    // Stats
    const allInvoices = await prisma.invoice.findMany({
      where: { businessId: business.id },
      select: { status: true, total: true, amountPaid: true },
    })

    const stats = {
      total: allInvoices.length,
      draft: allInvoices.filter((i) => i.status === "DRAFT").length,
      sent: allInvoices.filter((i) => i.status === "SENT").length,
      paid: allInvoices.filter((i) => i.status === "PAID").length,
      overdue: allInvoices.filter((i) => i.status === "OVERDUE").length,
      totalRevenue: allInvoices
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + Number(i.total), 0),
      outstanding: allInvoices
        .filter((i) => ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"].includes(i.status))
        .reduce((sum, i) => sum + Number(i.total) - Number(i.amountPaid), 0),
    }

    return NextResponse.json({
      invoices,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      stats,
    })
  } catch (error) {
    console.error("Invoices GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const body = await request.json()

    // Generate invoice number
    const count = await prisma.invoice.count({ where: { businessId: business.id } })
    const invoiceNumber = body.invoiceNumber || `INV-${String(count + 1).padStart(4, "0")}`

    const invoice = await prisma.invoice.create({
      data: {
        businessId: business.id,
        clientId: body.clientId,
        invoiceNumber,
        status: body.status || "DRAFT",
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        dueDate: new Date(body.dueDate),
        currency: body.currency || business.defaultCurrency,
        subtotal: body.subtotal || 0,
        taxRate: body.taxRate,
        taxAmount: body.taxAmount || 0,
        total: body.total || 0,
        notes: body.notes,
        terms: body.terms,
        templateId: body.templateId || business.templateId,
        lineItems: body.lineItems
          ? {
              create: body.lineItems.map((item: any, index: number) => ({
                description: item.description,
                quantity: item.quantity || 1,
                rate: item.rate,
                taxable: item.taxable ?? true,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        client: true,
        lineItems: true,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Invoices POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
