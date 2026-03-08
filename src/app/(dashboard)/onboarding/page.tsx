"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const CURRENCIES = [
  { code: "USD", name: "US Dollar ($)" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "INR", name: "Indian Rupee" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "ZAR", name: "South African Rand" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SEK", name: "Swedish Krona" },
]

const TERMS = [
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt" },
  { value: "NET_7", label: "Net 7" },
  { value: "NET_14", label: "Net 14" },
  { value: "NET_30", label: "Net 30" },
  { value: "NET_60", label: "Net 60" },
]

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AE", name: "UAE" },
  { code: "SE", name: "Sweden" },
]

const TAX_TYPES = [
  { value: "", label: "None" },
  { value: "EIN", label: "EIN (US)" },
  { value: "GST", label: "GST (India)" },
  { value: "VAT", label: "VAT (EU/UK)" },
  { value: "ABN", label: "ABN (Australia)" },
  { value: "BN", label: "BN (Canada)" },
  { value: "OTHER", label: "Other" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    defaultCurrency: "USD",
    defaultTerms: "NET_30",
    taxIdType: "",
    taxId: "",
    brandColor: "#2563eb",
  })

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-500">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your business</CardTitle>
              <CardDescription>This info appears on your invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder="e.g. Smith Plumbing Services"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="invoices@yourbusiness.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="NY"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    if (!formData.businessName.trim()) {
                      setError("Business name is required")
                      return
                    }
                    setError("")
                    setStep(2)
                  }}
                  size="lg"
                >
                  Continue
                </Button>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Invoice Settings */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Defaults</CardTitle>
              <CardDescription>Set your default currency and payment terms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <select
                  id="currency"
                  value={formData.defaultCurrency}
                  onChange={(e) => updateField("defaultCurrency", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Default Payment Terms</Label>
                <select
                  id="terms"
                  value={formData.defaultTerms}
                  onChange={(e) => updateField("defaultTerms", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {TERMS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandColor">Brand Color</Label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    id="brandColor"
                    value={formData.brandColor}
                    onChange={(e) => updateField("brandColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                  />
                  <Input
                    value={formData.brandColor}
                    onChange={(e) => updateField("brandColor", e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} size="lg">Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Tax Info */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>Optional. Add your tax ID to display on invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxIdType">Tax ID Type</Label>
                <select
                  id="taxIdType"
                  value={formData.taxIdType}
                  onChange={(e) => updateField("taxIdType", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {TAX_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {formData.taxIdType && (
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID Number</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => updateField("taxId", e.target.value)}
                    placeholder={
                      formData.taxIdType === "EIN" ? "XX-XXXXXXX" :
                      formData.taxIdType === "GST" ? "22AAAAA0000A1Z5" :
                      formData.taxIdType === "VAT" ? "GB123456789" :
                      "Enter your tax ID"
                    }
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleSubmit} size="lg" disabled={isLoading}>
                  {isLoading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
