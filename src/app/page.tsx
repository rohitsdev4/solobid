"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Clock,
  DollarSign,
  Shield,
  FileText,
  Users,
  Globe,
  CreditCard,
  BarChart3,
  Repeat,
  Mail,
  Palette,
  Send,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  Smartphone,
  Download,
} from "lucide-react"

/* --- NAV --- */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Solo<span className="text-blue-600">Bid</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</a>
          <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-gray-900">FAQ</a>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
          <Link href="/signup">
            <Button size="sm">Start Free Trial</Button>
          </Link>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="#features" className="text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#faq" className="text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>FAQ</a>
            <Link href="/login" className="text-sm font-medium text-gray-600">Sign In</Link>
            <Link href="/signup"><Button className="w-full">Start Free Trial</Button></Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* --- HERO --- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Zap className="h-3.5 w-3.5" />
          5-day free trial &middot; No credit card required
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Send Professional Invoices{" "}
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            in 60 Seconds
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
          Built for freelancers, solo consultants, and small businesses who want to get paid faster
          &mdash; not learn accounting software. Create, send, and track invoices from anywhere.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2 px-8 text-base">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" className="px-8 text-base">
              See How It Works
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          From $5/month after trial &middot; Cancel anytime
        </p>
      </div>
      {/* Product mockup placeholder */}
      <div className="mx-auto mt-12 max-w-5xl">
        <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-2xl shadow-blue-100/50">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-gray-400">solobid.com/dashboard</span>
          </div>
          <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 p-8">
            <div className="grid h-full grid-cols-4 gap-4">
              <div className="col-span-1 space-y-3 rounded-lg bg-white/80 p-4 shadow-sm">
                <div className="h-3 w-20 rounded bg-blue-200" />
                <div className="space-y-2">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-2.5 w-full rounded bg-gray-100" />)}
                </div>
              </div>
              <div className="col-span-3 space-y-4 rounded-lg bg-white/80 p-4 shadow-sm">
                <div className="flex gap-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex-1 rounded-lg bg-gray-50 p-3">
                      <div className="h-2 w-12 rounded bg-gray-200" />
                      <div className="mt-2 h-4 w-16 rounded bg-blue-100" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50/50 p-3">
                      <div className="h-3 w-3 rounded bg-gray-200" />
                      <div className="h-2.5 w-20 rounded bg-gray-200" />
                      <div className="h-2.5 w-24 rounded bg-gray-100" />
                      <div className="ml-auto h-5 w-16 rounded-full bg-green-100" />
                      <div className="h-2.5 w-16 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --- SOCIAL PROOF BAR --- */
function SocialProof() {
  return (
    <section className="border-y border-gray-100 bg-gray-50/50 px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 text-sm text-gray-500 sm:gap-10">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["bg-blue-400","bg-green-400","bg-purple-400","bg-orange-400"].map((c,i) => (
              <div key={i} className={`h-7 w-7 rounded-full border-2 border-white ${c}`} />
            ))}
          </div>
          <span className="font-medium text-gray-700">1,000+ freelancers</span>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
          <span className="ml-1 font-medium text-gray-700">4.9/5 rating</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-gray-700">Used in 50+ countries</span>
        </div>
      </div>
    </section>
  )
}

/* --- BENEFITS --- */
function Benefits() {
  const items = [
    { icon: Zap, title: "Create in 60 Seconds", desc: "No learning curve. Pick a client, add line items, hit send. Your first invoice is ready before your coffee gets cold." },
    { icon: DollarSign, title: "Get Paid Faster", desc: "Online payment links, automated reminders, and real-time tracking. Average time to payment drops from 25 days to 8." },
    { icon: Palette, title: "Look Professional", desc: "5 beautiful templates, your logo, your brand colors. Every invoice looks like it came from a design agency." },
  ]
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why freelancers choose SoloBid</h2>
          <p className="mx-auto mt-3 max-w-lg text-gray-500">Simple, fast, and affordable. Everything you need to look professional and get paid on time.</p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- HOW IT WORKS --- */
function HowItWorks() {
  const steps = [
    { num: "1", title: "Create Your Account", desc: "Sign up in 30 seconds. Add your business name, logo, and you're ready." },
    { num: "2", title: "Build Your Invoice", desc: "Select a client, add line items, choose a template. Auto-calculates taxes and totals." },
    { num: "3", title: "Get Paid", desc: "Send via email with a Pay Now button. Track views, send reminders, record payments." },
  ]
  return (
    <section id="how-it-works" className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How it works</h2>
          <p className="mt-3 text-gray-500">From signup to getting paid in 3 simple steps</p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {s.num}
              </div>
              {i < 2 && <div className="absolute left-1/2 top-6 hidden h-0.5 w-full bg-blue-100 sm:block" />}
              <h3 className="mt-4 text-lg font-bold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- FEATURES GRID --- */
function Features() {
  const features = [
    { icon: FileText, title: "Invoice Builder", desc: "Drag-and-drop line items, auto-calculate totals, tax support" },
    { icon: Download, title: "PDF Generation", desc: "Download print-ready PDFs with 5 professional templates" },
    { icon: Mail, title: "Email Delivery", desc: "Send invoices directly from SoloBid with tracking" },
    { icon: CreditCard, title: "Online Payments", desc: "Accept cards & bank transfers via Stripe Pay Now links" },
    { icon: Users, title: "Client Management", desc: "Store client details, see payment history, quick-fill invoices" },
    { icon: BarChart3, title: "Dashboard & Reports", desc: "Revenue charts, aging reports, CSV export" },
    { icon: Repeat, title: "Recurring Invoices", desc: "Auto-generate and send on a weekly/monthly/yearly schedule" },
    { icon: Send, title: "Estimates & Quotes", desc: "Send quotes, get approval, convert to invoice in one click" },
    { icon: Clock, title: "Payment Reminders", desc: "Automated reminders before and after due dates" },
    { icon: Globe, title: "Multi-Currency", desc: "USD, GBP, EUR, INR, AUD, CAD with proper formatting" },
    { icon: Shield, title: "Secure & Private", desc: "256-bit encryption, Stripe PCI compliance, GDPR ready" },
    { icon: Smartphone, title: "Mobile & PWA", desc: "Works on any device. Install as an app on your phone." },
  ]
  return (
    <section id="features" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need, nothing you don&apos;t</h2>
          <p className="mt-3 text-gray-500">Powerful features with zero complexity</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- PRICING --- */
function Pricing() {
  const [annual, setAnnual] = useState(false)
  const plans = [
    { name: "Starter", price: 5, yearly: 48, desc: "For freelancers starting out", popular: false,
      features: ["20 invoices/month", "10 clients", "3 templates", "PDF download", "Email delivery", "Payment tracking", "Email support"] },
    { name: "Pro", price: 9, yearly: 86, desc: "For growing businesses", popular: true,
      features: ["Unlimited invoices", "Unlimited clients", "All 5 templates", "Online payments", "Recurring invoices", "Advanced reports", "Custom branding", "Priority support"] },
  ]
  return (
    <section id="pricing" className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Simple, honest pricing</h2>
          <p className="mt-3 text-gray-500">Start free for 5 days. Upgrade when you&apos;re ready.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${annual ? "bg-blue-600" : "bg-gray-200"}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${annual ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}>Annual <span className="text-green-600">(save 20%)</span></span>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border-2 bg-white p-6 sm:p-8 ${plan.popular ? "border-blue-500 shadow-lg shadow-blue-100" : "border-gray-200"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"><Star className="h-3 w-3" /> Most Popular</span>
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">${annual ? Math.round(plan.yearly / 12) : plan.price}</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              {annual && <p className="mt-1 text-xs text-green-600">${plan.yearly}/year</p>}
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full gap-2" variant={plan.popular ? "default" : "outline"} size="lg">Start Free Trial <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-4 w-4 shrink-0 text-green-500" />{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- TESTIMONIALS --- */
function Testimonials() {
  const reviews = [
    { name: "Sarah Mitchell", role: "Freelance Designer", country: "US", text: "SoloBid cut my invoicing time from 30 minutes to literally 60 seconds. My clients love the professional look.", rating: 5 },
    { name: "James Okonkwo", role: "IT Consultant", country: "UK", text: "I tried FreshBooks, Wave, and Zoho. SoloBid is simpler and a fraction of the cost. Switched and never looked back.", rating: 5 },
    { name: "Priya Sharma", role: "Content Writer", country: "India", text: "The INR support and multi-currency invoicing is perfect for my international clients. And at this price? Incredible value.", rating: 5 },
    { name: "Marco Weber", role: "Photographer", country: "Germany", text: "Beautiful templates, instant PDF generation, and my clients can pay online. Everything I need, nothing I don't.", rating: 5 },
    { name: "Emma Tremblay", role: "Marketing Consultant", country: "Canada", text: "Recurring invoices saved me hours every month. The dashboard gives me a clear picture of my business finances.", rating: 5 },
  ]
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Loved by freelancers worldwide</h2>
          <p className="mt-3 text-gray-500">Join thousands of solo professionals getting paid faster</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {r.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.role} &middot; {r.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- GLOBAL --- */
function Global() {
  const markets = [
    { country: "United States", currency: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
    { country: "United Kingdom", currency: "GBP", flag: "\u{1F1EC}\u{1F1E7}" },
    { country: "Europe", currency: "EUR", flag: "\u{1F1EA}\u{1F1FA}" },
    { country: "India", currency: "INR", flag: "\u{1F1EE}\u{1F1F3}" },
    { country: "Australia", currency: "AUD", flag: "\u{1F1E6}\u{1F1FA}" },
    { country: "Canada", currency: "CAD", flag: "\u{1F1E8}\u{1F1E6}" },
  ]
  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <Globe className="mx-auto h-10 w-10 text-blue-600" />
        <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">Works everywhere you do</h2>
        <p className="mt-3 text-gray-500">Multi-currency invoicing for a global client base</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {markets.map((m) => (
            <div key={m.currency} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <span className="text-2xl">{m.flag}</span>
              <p className="mt-2 text-xs font-semibold text-gray-900">{m.country}</p>
              <p className="text-xs text-gray-500">{m.currency}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- FAQ --- */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="text-sm font-medium text-gray-900 pr-4">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-gray-600">{a}</p>}
    </div>
  )
}

function FAQ() {
  const faqs = [
    { q: "How does the 5-day free trial work?", a: "Sign up and get full access to all Pro features for 5 days, no credit card required. After the trial, pick Starter ($5/mo) or Pro ($9/mo) to continue." },
    { q: "What makes SoloBid different from FreshBooks or Wave?", a: "SoloBid is purpose-built for solo service providers. It's simpler (no bloated accounting features), faster, and significantly cheaper at $5-9/mo vs $19-23/mo for alternatives." },
    { q: "What currencies do you support?", a: "USD, GBP, EUR, INR, AUD, and CAD. Each invoice can use a different currency, and amounts are formatted correctly for each locale." },
    { q: "How do online payments work?", a: "Pro plan users get Stripe integration. Each invoice includes a 'Pay Now' button. Clients pay by card or bank transfer, and funds go directly to your Stripe account." },
    { q: "Is my data secure?", a: "Yes. TLS 1.3 encryption in transit, AES-256 at rest. Payment processing through PCI DSS Level 1 certified Stripe. We never store credit card details." },
    { q: "Can I use SoloBid on my phone?", a: "Absolutely. SoloBid is fully responsive and installable as a Progressive Web App. Add it to your home screen and use it like a native app." },
    { q: "Do you offer annual billing?", a: "Yes! Save 20% with annual billing. Starter is $48/year and Pro is $86/year." },
    { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings, keep access until your billing period ends. No fees, no questions." },
    { q: "Can I import existing clients?", a: "We're building CSV import. For now, adding clients takes about 15 seconds each and only needs to be done once." },
    { q: "What if I need help?", a: "Starter gets email support (response within 24h). Pro gets priority support (response within 4h). We also have docs and a knowledge base." },
  ]
  return (
    <section id="faq" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-3 text-gray-500">Everything you need to know about SoloBid</p>
        </div>
        <div className="mt-10">
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </div>
    </section>
  )
}

/* --- BOTTOM CTA --- */
function BottomCTA() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to get paid faster?</h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-blue-100">
          Join thousands of freelancers sending professional invoices with SoloBid. Start free, upgrade when you&apos;re ready.
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button size="lg" className="gap-2 bg-white px-8 text-base text-blue-600 hover:bg-blue-50">
            Start Your Free Trial <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="mt-3 text-sm text-blue-200">5-day free trial &middot; No credit card &middot; Cancel anytime</p>
      </div>
    </section>
  )
}

/* --- FOOTER --- */
function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-gray-900">Solo<span className="text-blue-600">Bid</span></span>
            <p className="mt-2 text-sm text-gray-500">Simple invoicing for solo professionals. Send invoices, get paid, grow your business.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Product</h4>
            <ul className="mt-3 space-y-2">
              <li><a href="#features" className="text-sm text-gray-500 hover:text-gray-700">Features</a></li>
              <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-700">Pricing</Link></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Templates</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">About</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Careers</a></li>
              <li><a href="mailto:support@solobid.com" className="text-sm text-gray-500 hover:text-gray-700">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</Link></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Cookie Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">GDPR</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} SoloBid. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-gray-600" aria-label="Twitter">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600" aria-label="LinkedIn">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* --- MAIN PAGE --- */
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <SocialProof />
      <Benefits />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <Global />
      <FAQ />
      <BottomCTA />
      <Footer />
    </main>
  )
}
