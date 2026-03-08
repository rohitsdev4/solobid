import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const business = await prisma.business.findUnique({ where: { userId: user.id } })
    if (!business) return NextResponse.json({ estimates: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 }, stats: {} })

    const sp = request.nextUrl.searchParams
    const search = sp.get("search") || ""
    const status = sp.get("status") || ""
    const sort = sp.get("sort") || "createdAt"
    const order = sp.get("order") || "desc"
    const page = parseInt(sp.get("page") || "1")
    const pageSize = parseInt(sp.get("pageSize") || "20")

    const where: any = { businessId: business.id }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { estimateNumber: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        include: { client: { select: { id: true, name: true, email: true } } },
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.estimate.count({ where }),
    ])

    const allEstimates = await prisma.estimate.findMany({
      where: { businessId: business.id },
      select: { status: true, total: true },
    })

    const stats = {
      total: allEstimates.length,
      draft: allEstimates.filter(e => e.status === "DRAFT").length,
      sent: allEstimates.filter(e => e.status === "SENT").length,
      accepted: allEstimates.filter(e => e.status === "ACCEPTED").length,
      rejected: allEstimates.filter(e => e.status === "REJECTED").length,
      converted: allEstimates.filter(e => e.status === "CONVERTED").length,
      totalValue: allEstimates.reduce((sum, e) => sum + Number(e.total), 0),
    }

    return NextResponse.json({
      estimates,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      stats,
    })
  } catch (error) {
    console.error("Estimates GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const business = await prisma.business.findUnique({ where: { userId: user.id } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const body = await request.json()
    const count = await prisma.estimate.count({ where: { businessId: business.id } })
    const estimateNumber = body.estimateNumber || `EST-${String(count + 1).padStart(4, "0")}`

    const estimate = await prisma.estimate.create({
      data: {
        businessId: business.id,
        clientId: body.clientId,
        estimateNumber,
        status: body.status || "DRAFT",
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        validUntil: new Date(body.validUntil),
        currency: body.currency || business.defaultCurrency,
        subtotal: body.subtotal || 0,
        taxRate: body.taxRate,
        taxAmount: body.taxAmount || 0,
        total: body.total || 0,
        notes: body.notes,
        terms: body.terms,
        lineItems: body.lineItems ? {
          create: body.lineItems.map((item: any, i: number) => ({
            description: item.description,
            quantity: item.quantity || 1,
            rate: item.rate,
            taxable: item.taxable ?? true,
            sortOrder: i,
          })),
        } : undefined,
      },
      include: { client: true, lineItems: true },
    })

    return NextResponse.json(estimate, { status: 201 })
  } catch (error) {
    console.error("Estimates POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
