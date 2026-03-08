import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: user.id },
    })

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })

    // Count clients for usage
    let clientsUsed = 0
    if (business) {
      clientsUsed = await prisma.client.count({
        where: { businessId: business.id, isArchived: false },
      })
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
      business,
      subscription: subscription
        ? { ...subscription, clientsUsed }
        : {
            plan: "TRIAL",
            status: "ACTIVE",
            invoicesUsed: 0,
            invoicesLimit: null,
            clientsLimit: null,
            clientsUsed,
          },
    })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Update profile
    if (body.profile) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: body.profile.name,
        },
      })
    }

    // Update business
    if (body.business) {
      await prisma.business.upsert({
        where: { userId: user.id },
        update: body.business,
        create: {
          userId: user.id,
          name: body.business.name || "My Business",
          ...body.business,
        },
      })
    }

    // Update templates
    if (body.templates) {
      await prisma.business.update({
        where: { userId: user.id },
        data: {
          templateId: body.templates.templateId,
          brandColor: body.templates.brandColor,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Settings PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
