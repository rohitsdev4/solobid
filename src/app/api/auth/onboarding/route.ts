import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  country: z.string().default("US"),
  defaultCurrency: z.string().default("USD"),
  defaultTerms: z.string().default("NET_30"),
  taxId: z.string().optional().or(z.literal("")),
  taxIdType: z.string().optional().or(z.literal("")),
  brandColor: z.string().default("#2563eb"),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const data = onboardingSchema.parse(body)

    const business = await prisma.business.upsert({
      where: { userId: user.id },
      update: {
        name: data.businessName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        country: data.country,
        defaultCurrency: data.defaultCurrency,
        defaultTerms: data.defaultTerms,
        taxId: data.taxId || null,
        taxIdType: data.taxIdType || null,
        brandColor: data.brandColor,
      },
      create: {
        userId: user.id,
        name: data.businessName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        country: data.country,
        defaultCurrency: data.defaultCurrency,
        defaultTerms: data.defaultTerms,
        taxId: data.taxId || null,
        taxIdType: data.taxIdType || null,
        brandColor: data.brandColor,
      },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
