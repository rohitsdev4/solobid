"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Check,
  X,
  Zap,
  ArrowRight,
  Shield,
  Globe,
  CreditCard,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react"

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 5,
    yearlyPrice: 48,
    description: "Perfect for freelancers just starting out",
    cta: "Start Free Trial",
    popular: false,
    features: [
      { text: "20 invoices per month", included: true },
      { text: "10 clients", included: true },
      { text: "3 invoice templates", included: true },
      { text: "PDF generation & download", included: true },
      { text: "Email invoice delivery", included: true },
      { text: "Payment tracking", included: true },
      { text: "Basic dashboard & reports", included: true },
      { text: "Email support", included: true },
      { text: "Recurring invoices", included: false },
      { text: "Online payments (Stripe)", included: false },
      { text: "Custom branding & colors", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9,
    yearlyPrice: 86,
    description: "For growing businesses that need it all",
    cta: "Start Free Trial",
    popular: true,
    features: [
      { text: "Unlimited invoices", included: true },
      { text: "Unlimited clients", included: true },
      { text: "All 5 invoice templates", included: true },
      { text: "PDF generation & download", included: true },
      { text: "Email invoice delivery", included: true },
      { text: "Payment tracking", included: true },
      { text: "Advanced dashboard & reports", included: true },
      { text: "Priority support", included: true },
      { text: "Recurring invoices", included: true },
      { text: "Online payments (Stripe)", included: true },
      { text: "Custom branding & colors", included: true },
      { text: "Estimates & quotes", included: true },
    ],
  },
]

const COMPARISON = [
  { feature: "Invoices per month", starter: "20", pro: "Unlimited" },
  { feature: "Clients", starter: "10", pro: "Unlimited" },
  { feature: "Invoice templates", starter: "3", pro: "All 5" },
  { feature: "PDF download", starter: true, pro: true },
  { feature: "Email delivery", starter: true, pro: true },
  { feature: "Payment tracking", starter: true, pro: true },
  { feature: "Multi-currency", starter: true, pro: true },
  { feature: "Dashboard", starter: "Basic", pro: "Advanced" },
  { feature: "Reports & CSV export", starter: "Basic", pro: "Full" },
  { feature: "Estimates & quotes", starter: false, pro: true },
  { feature: "Recurring invoices", starter: false, pro: true },
  { feature: "Online payments (Stripe)", starter: false, pro: true },
  { feature: "Custom branding", starter: false, pro: true },
  { feature: "Automated reminders", starter: "Manual", pro: "Automatic" },
  { feature: "Support", starter: "Email", pro: "Priority" },
  { feature: "PWA / Mobile", starter: true, pro: true },
]

const FAQS = [
  {
    q: "How does the 5-day free trial work?",
    a: "You get full access to all Pro features for 5 days, no credit card required. After the trial, choose Starter ($5/mo) or Pro ($9/mo) to continue. Your data is preserved either way.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, upgrade or downgrade anytime. When upgrading, you get immediate access to new features. When downgrading, the change takes effect at the end of your billing period.",
  },
  {
    q: "What currencies do you support?",
    a: "SoloBid supports USD, GBP, EUR, INR, AUD, and CAD. You can create invoices in any of these currencies, and your clients see amounts in their local currency.",
  },
  {
    q: "How do online payments work?",
    a: "Pro plan users can accept payments via Stripe. Your clients get a 'Pay Now' button on their invoice that lets them pay by credit card, debit card, or bank transfer. Funds go directly to your Stripe account.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use industry-standard encryption (TLS 1.3 in transit, AES-256 at rest). All payment processing goes through Stripe, which is PCI DSS Level 1 certified. We never store credit card details.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime from your Settings page. You'll keep access until the end of your billing period. No cancellation fees, no questions asked.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes! Save ~20% with annual billing. Starter is $48/year (instead of $60) and Pro is $86/year (instead of $108).",
  },
  {
    q: "What happens when I hit the invoice limit on Starter?",
    a: "You'll see a friendly notification letting you know you've reached your monthly limit. You can upgrade to Pro for unlimited invoices, or wait until the next month when your counter resets.",
  },
  {
    q: "Can I use SoloBid internationally?",
    a: "Yes! SoloBid works in the US, UK, Europe, India, Australia, Canada, and worldwide. Multi-currency support, multi-language invoice notes, and international tax ID fields are built in.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you're not satisfied within the first 14 days of a paid plan, contact us for a full refund. After that, you can cancel anytime but we don't offer partial refunds for remaining billing periods.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-gray-600">{a}</p>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Solo<span className="text-blue-600">Bid</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-16">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Zap className="h-3 w-3" />
            5-day free trial on all plans
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-gray-500">
            Start free for 5 days. No credit card needed. Cancel anytime.
            The cheapest professional invoicing tool on the market.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
              annual ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
              annual ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}>
            Annual <span className="text-green-600">(save 20%)</span>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-shadow sm:p-8 ${
                plan.popular
                  ? "border-blue-500 shadow-lg shadow-blue-100"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${annual ? Math.round(plan.yearlyPrice / 12) : plan.price}
                  </span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                {annual && (
                  <p className="mt-1 text-xs text-green-600">
                    ${plan.yearlyPrice}/year (save ${plan.price * 12 - plan.yearlyPrice})
                  </p>
                )}
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button
                  className={`w-full gap-2 ${plan.popular ? "" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                    )}
                    <span className={`text-sm ${f.included ? "text-gray-700" : "text-gray-400"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-500" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-green-500" />
            <span>No credit card for trial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-green-500" />
            <span>Works in 100+ countries</span>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">Feature Comparison</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Everything you need, nothing you don't</p>

          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Feature</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Starter ($5/mo)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-blue-600">Pro ($9/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-700">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <Check className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-gray-300" />
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{row.starter}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <Check className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-gray-300" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{row.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Got questions? We've got answers.</p>
          <div className="mx-auto mt-8 max-w-2xl">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to get paid faster?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-blue-100">
            Join thousands of freelancers and solo businesses sending professional invoices with SoloBid.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
              Start Your Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-xs text-blue-200">5-day free trial. No credit card required.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SoloBid. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
