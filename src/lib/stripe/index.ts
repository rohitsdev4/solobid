import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    })
  }
  return _stripe
}

// Keep backward-compatible named export using a getter
// so `import { stripe } from "@/lib/stripe"` still works
// but delays instantiation until first property access
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

export const PLANS = {
  STARTER: {
    name: "Starter",
    price: 7,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    invoicesLimit: 20,
    clientsLimit: 10,
    templates: 3,
    features: [
      "20 invoices/month",
      "10 clients",
      "3 invoice templates",
      "Email support",
      "PDF export",
      "Payment tracking",
    ],
  },
  PRO: {
    name: "Pro",
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    invoicesLimit: null,
    clientsLimit: null,
    templates: 5,
    features: [
      "Unlimited invoices",
      "Unlimited clients",
      "All 5 templates",
      "Priority support",
      "Recurring invoices",
      "Online payments (Stripe)",
      "Custom branding",
      "Estimates & quotes",
    ],
  },
} as const
