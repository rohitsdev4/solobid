"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  User,
  Building2,
  CreditCard,
  Palette,
  Bell,
  Save,
  Upload,
  Trash2,
  Check,
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react"

type TabId = "profile" | "business" | "billing" | "templates" | "notifications"

const TABS: { id: TabId; label: string; icon: any; description: string }[] = [
  { id: "profile", label: "Profile", icon: User, description: "Your personal account details" },
  { id: "business", label: "Business", icon: Building2, description: "Company info shown on invoices" },
  { id: "billing", label: "Billing", icon: CreditCard, description: "Subscription and payment" },
  { id: "templates", label: "Templates", icon: Palette, description: "Invoice appearance" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Email and alert preferences" },
]

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "GBP", name: "British Pound", symbol: "\u00a3" },
  { code: "EUR", name: "Euro", symbol: "\u20ac" },
  { code: "INR", name: "Indian Rupee", symbol: "\u20b9" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
]

const PAYMENT_TERMS = [
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt" },
  { value: "NET_7", label: "Net 7 (7 days)" },
  { value: "NET_15", label: "Net 15 (15 days)" },
  { value: "NET_30", label: "Net 30 (30 days)" },
  { value: "NET_45", label: "Net 45 (45 days)" },
  { value: "NET_60", label: "Net 60 (60 days)" },
  { value: "NET_90", label: "Net 90 (90 days)" },
]

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India", "Germany",
  "France", "Netherlands", "Ireland", "Singapore", "New Zealand", "South Africa",
  "UAE", "Japan", "Brazil", "Mexico", "Spain", "Italy", "Sweden", "Norway",
]

const TEMPLATES = [
  { id: "modern", name: "Clean Modern", description: "Minimal design with a blue accent bar", preview: "bg-gradient-to-br from-blue-50 to-white" },
  { id: "bold", name: "Bold Corporate", description: "Strong header with dark background", preview: "bg-gradient-to-br from-gray-800 to-gray-600" },
  { id: "minimal", name: "Minimal", description: "Ultra-clean, text-focused layout", preview: "bg-gradient-to-br from-gray-50 to-white" },
  { id: "classic", name: "Classic Professional", description: "Traditional business layout", preview: "bg-gradient-to-br from-amber-50 to-white" },
  { id: "colorful", name: "Colorful Creative", description: "Vibrant gradient header for creative pros", preview: "bg-gradient-to-br from-purple-400 to-pink-400" },
]

const BRAND_COLORS = [
  "#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#db2777", "#0d9488", "#4f46e5", "#1d4ed8",
]

function InputField({ label, type = "text", value, onChange, placeholder, icon: Icon, disabled = false, required = false }: any) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, disabled = false }: any) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
      >
        {options.map((opt: any) => (
          <option key={opt.value || opt.code || opt} value={opt.value || opt.code || opt}>
            {opt.label || opt.name || opt}
          </option>
        ))}
      </select>
    </div>
  )
}

function ToggleSwitch({ enabled, onChange, label, description }: any) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Profile state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  // Business state
  const [bizName, setBizName] = useState("")
  const [bizEmail, setBizEmail] = useState("")
  const [bizPhone, setBizPhone] = useState("")
  const [bizAddress, setBizAddress] = useState("")
  const [bizCity, setBizCity] = useState("")
  const [bizState, setBizState] = useState("")
  const [bizZip, setBizZip] = useState("")
  const [bizCountry, setBizCountry] = useState("United States")
  const [bizWebsite, setBizWebsite] = useState("")
  const [bizTaxId, setBizTaxId] = useState("")
  const [bizCurrency, setBizCurrency] = useState("USD")
  const [bizTerms, setBizTerms] = useState("NET_30")
  const [bizLogo, setBizLogo] = useState("")

  // Template state
  const [templateId, setTemplateId] = useState("modern")
  const [brandColor, setBrandColor] = useState("#2563eb")

  // Notification state
  const [notifyInvoicePaid, setNotifyInvoicePaid] = useState(true)
  const [notifyInvoiceViewed, setNotifyInvoiceViewed] = useState(true)
  const [notifyPaymentReminder, setNotifyPaymentReminder] = useState(true)
  const [notifyEstimateAccepted, setNotifyEstimateAccepted] = useState(true)
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false)
  const [notifyMarketingEmails, setNotifyMarketingEmails] = useState(false)

  // Subscription state
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setName(data.user.name || "")
            setEmail(data.user.email || "")
          }
          if (data.business) {
            setBizName(data.business.name || "")
            setBizEmail(data.business.email || "")
            setBizPhone(data.business.phone || "")
            setBizAddress(data.business.address || "")
            setBizCity(data.business.city || "")
            setBizState(data.business.state || "")
            setBizZip(data.business.zipCode || "")
            setBizCountry(data.business.country || "United States")
            setBizWebsite(data.business.website || "")
            setBizTaxId(data.business.taxId || "")
            setBizCurrency(data.business.defaultCurrency || "USD")
            setBizTerms(data.business.defaultTerms || "NET_30")
            setBizLogo(data.business.logoUrl || "")
            setTemplateId(data.business.templateId || "modern")
            setBrandColor(data.business.brandColor || "#2563eb")
          }
          if (data.subscription) {
            setSubscription(data.subscription)
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const payload: any = {}

      if (activeTab === "profile") {
        payload.profile = { name, phone }
      } else if (activeTab === "business") {
        payload.business = {
          name: bizName, email: bizEmail, phone: bizPhone, address: bizAddress,
          city: bizCity, state: bizState, zipCode: bizZip, country: bizCountry,
          website: bizWebsite, taxId: bizTaxId, defaultCurrency: bizCurrency,
          defaultTerms: bizTerms, logoUrl: bizLogo,
        }
      } else if (activeTab === "templates") {
        payload.templates = { templateId, brandColor }
      } else if (activeTab === "notifications") {
        payload.notifications = {
          invoicePaid: notifyInvoicePaid, invoiceViewed: notifyInvoiceViewed,
          paymentReminder: notifyPaymentReminder, estimateAccepted: notifyEstimateAccepted,
          weeklyDigest: notifyWeeklyDigest, marketingEmails: notifyMarketingEmails,
        }
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error("Failed to save:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account, business info, and preferences</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Tabs */}
        <nav className="w-full shrink-0 lg:w-56">
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and contact info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Photo
                    </Button>
                    <p className="mt-1 text-xs text-gray-500">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label="Full Name" value={name} onChange={setName} placeholder="John Doe" icon={User} required />
                  <InputField label="Email" value={email} onChange={() => {}} placeholder="john@example.com" icon={Mail} disabled />
                </div>
                <InputField label="Phone" value={phone} onChange={setPhone} placeholder="+1 (555) 123-4567" icon={Phone} />
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900">Danger Zone</h3>
                  <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                  <Button variant="destructive" size="sm" className="mt-3 gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Tab */}
          {activeTab === "business" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>This information appears on your invoices and estimates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                    {bizLogo ? (
                      <img src={bizLogo} alt="Logo" className="h-14 w-14 rounded-lg object-contain" />
                    ) : (
                      <Building2 className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Logo
                    </Button>
                    <p className="mt-1 text-xs text-gray-500">Square PNG or SVG. Appears on invoices.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label="Business Name" value={bizName} onChange={setBizName} placeholder="Acme Inc." icon={Building2} required />
                  <InputField label="Business Email" value={bizEmail} onChange={setBizEmail} placeholder="billing@acme.com" icon={Mail} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label="Phone" value={bizPhone} onChange={setBizPhone} placeholder="+1 (555) 123-4567" icon={Phone} />
                  <InputField label="Website" value={bizWebsite} onChange={setBizWebsite} placeholder="https://acme.com" icon={Globe} />
                </div>
                <InputField label="Address" value={bizAddress} onChange={setBizAddress} placeholder="123 Main St" icon={MapPin} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <InputField label="City" value={bizCity} onChange={setBizCity} placeholder="New York" />
                  <InputField label="State/Province" value={bizState} onChange={setBizState} placeholder="NY" />
                  <InputField label="ZIP/Postal Code" value={bizZip} onChange={setBizZip} placeholder="10001" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <SelectField label="Country" value={bizCountry} onChange={setBizCountry} options={COUNTRIES} />
                  <SelectField label="Default Currency" value={bizCurrency} onChange={setBizCurrency} options={CURRENCIES} />
                  <SelectField label="Default Payment Terms" value={bizTerms} onChange={setBizTerms} options={PAYMENT_TERMS} />
                </div>
                <InputField label="Tax ID / GST / VAT Number" value={bizTaxId} onChange={setBizTaxId} placeholder="XX-XXXXXXX" />
              </CardContent>
            </Card>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Manage your subscription and billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {subscription?.plan === "PRO" ? "Pro" : subscription?.plan === "STARTER" ? "Starter" : "Free Trial"}
                          </h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            subscription?.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {subscription?.status || "ACTIVE"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {subscription?.plan === "PRO" ? "$9/month - Unlimited everything" :
                           subscription?.plan === "STARTER" ? "$5/month - 20 invoices/mo, 10 clients" :
                           "5-day free trial - All features unlocked"}
                        </p>
                      </div>
                      {subscription?.plan !== "PRO" && (
                        <Button size="sm" className="gap-1.5">
                          Upgrade to Pro
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900">Usage This Month</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Invoices Created</span>
                          <span className="font-medium text-gray-900">
                            {subscription?.invoicesUsed || 0}
                            {subscription?.invoicesLimit ? ` / ${subscription.invoicesLimit}` : " / Unlimited"}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: subscription?.invoicesLimit
                                ? `${Math.min(100, ((subscription.invoicesUsed || 0) / subscription.invoicesLimit) * 100)}%`
                                : "10%",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Clients</span>
                          <span className="font-medium text-gray-900">
                            {subscription?.clientsUsed || 0}
                            {subscription?.clientsLimit ? ` / ${subscription.clientsLimit}` : " / Unlimited"}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-green-600 transition-all"
                            style={{
                              width: subscription?.clientsLimit
                                ? `${Math.min(100, ((subscription.clientsUsed || 0) / subscription.clientsLimit) * 100)}%`
                                : "5%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Comparison */}
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-sm font-semibold text-gray-900">Compare Plans</h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h5 className="font-semibold text-gray-900">Starter <span className="text-blue-600">$5/mo</span></h5>
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          <li>20 invoices per month</li>
                          <li>10 clients</li>
                          <li>3 invoice templates</li>
                          <li>Email support</li>
                          <li>PDF generation</li>
                        </ul>
                      </div>
                      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/30 p-4">
                        <h5 className="font-semibold text-gray-900">Pro <span className="text-blue-600">$9/mo</span></h5>
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          <li>Unlimited invoices</li>
                          <li>Unlimited clients</li>
                          <li>All 5 templates</li>
                          <li>Priority support</li>
                          <li>Recurring invoices</li>
                          <li>Online payments (Stripe)</li>
                          <li>Custom branding</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Cancel */}
                  {subscription?.plan !== "TRIAL" && (
                    <div className="mt-6 border-t pt-4">
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Invoice Templates</CardTitle>
                <CardDescription>Choose a default template and brand color for your invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Choose Template</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setTemplateId(template.id)}
                        className={`relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all ${
                          templateId === template.id
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`mb-3 h-20 rounded-md ${template.preview}`} />
                        <h5 className="text-sm font-semibold text-gray-900">{template.name}</h5>
                        <p className="text-xs text-gray-500">{template.description}</p>
                        {templateId === template.id && (
                          <div className="absolute right-2 top-2 rounded-full bg-blue-600 p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Color */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Brand Color</h4>
                  <p className="mb-3 text-xs text-gray-500">This color is used as the accent in your invoices</p>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBrandColor(color)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          brandColor === color ? "border-gray-900 ring-2 ring-gray-300" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-gray-500">{brandColor}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control which emails and alerts you receive</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-gray-100">
                  <ToggleSwitch
                    enabled={notifyInvoicePaid}
                    onChange={setNotifyInvoicePaid}
                    label="Invoice Paid"
                    description="Get notified when a client pays an invoice"
                  />
                  <ToggleSwitch
                    enabled={notifyInvoiceViewed}
                    onChange={setNotifyInvoiceViewed}
                    label="Invoice Viewed"
                    description="Get notified when a client opens your invoice"
                  />
                  <ToggleSwitch
                    enabled={notifyPaymentReminder}
                    onChange={setNotifyPaymentReminder}
                    label="Payment Reminders"
                    description="Auto-send payment reminders for overdue invoices"
                  />
                  <ToggleSwitch
                    enabled={notifyEstimateAccepted}
                    onChange={setNotifyEstimateAccepted}
                    label="Estimate Accepted"
                    description="Get notified when a client accepts your estimate"
                  />
                  <ToggleSwitch
                    enabled={notifyWeeklyDigest}
                    onChange={setNotifyWeeklyDigest}
                    label="Weekly Digest"
                    description="Receive a weekly summary of invoices and payments"
                  />
                  <ToggleSwitch
                    enabled={notifyMarketingEmails}
                    onChange={setNotifyMarketingEmails}
                    label="Product Updates"
                    description="New features, tips, and SoloBid news"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button - shown for all tabs except billing */}
          {activeTab !== "billing" && (
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </Button>
              {saved && <span className="text-sm text-green-600">Changes saved successfully</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
