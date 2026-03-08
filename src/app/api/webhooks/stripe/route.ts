import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-11-20.acacia" as any })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan

        if (userId && plan) {
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: plan === "pro" ? "PRO" : "STARTER",
              status: "ACTIVE",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              invoicesLimit: plan === "pro" ? null : 20,
              clientsLimit: plan === "pro" ? null : 10,
            },
            create: {
              userId,
              plan: plan === "pro" ? "PRO" : "STARTER",
              status: "ACTIVE",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              trialEndDate: new Date(),
              invoicesLimit: plan === "pro" ? null : 20,
              clientsLimit: plan === "pro" ? null : 10,
            },
          })
        }
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELLED" },
        })
        break
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: "PAST_DUE" },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
