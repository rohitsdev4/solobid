import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia", typescript: true })

export const PLANS = {
  STARTER: {
    name: "Starter", price: 7, priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    invoicesLimit: 20, clientsLimit: 10, templates: 3,
    features: ["20 invoices/month","10 clients","3 invoice templates","Email support","PDF export","Payment tracking"],
  },
  PRO: {
    name: "Pro", price: 12, priceId: process.env.STRIPE_PRO_PRICE_ID!,
    invoicesLimit: null, clientsLimit: null, templates: 5,
    features: ["Unlimited invoices","Unlimited clients","All 5 templates","Priority support","Recurring invoices","Online payments (Stripe)","Custom branding","Estimates & quotes"],
  },
} as const
