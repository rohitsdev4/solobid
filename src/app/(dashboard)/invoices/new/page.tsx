"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Client {
  id: string
  name: string
  email: string | null
}

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  taxable: boolean
}

const CURRENCIES = [
  { code: "USD", symbol: "$" }, { code: "GBP", symbol: "\u00a3" },
  { code: "EUR", symbol: "\u20ac" }, { code: "INR", symbol: "\u20b9" },
  { code: "CAD", symbol: "CA$" }, { code: "AUD", symbol: "A$" },
  { code: "JPY", symbol: "\u00a5" }, { code: "CHF", symbol: "CHF" },
  { code: "SGD", symbol: "S$" }, { code: "NZD", symbol: "NZ$" },
]

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams.get("client")

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState("")
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  // Form state
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || "")
  const [selectedClientName, setSelectedClientName] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(addDays(new Date(), 30))
  const [taxRate, setTaxRate] = useState<number>(0)
  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("Payment is due within the specified terms. Thank you for your business.")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: generateId(), description: "", quantity: 1, rate: 0, taxable: true },
  ])

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true)
      try {
        const res = await fetch("/api/clients?limit=100")
        const data = await res.json()
        if (res.ok) {
          setClients(data.clients)
          if (preselectedClientId) {
            const c = data.clients.find((cl: Client) => cl.id === preselectedClientId)
            if (c) setSelectedClientName(c.name)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClients()
  }, [preselectedClientId])

  // Filtered clients for dropdown
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
    )
  }, [clients, clientSearch])

  // Auto-calculate totals
  const calculations = useMemo(() => {
    let subtotal = 0
    let taxableSubtotal = 0

    for (const item of lineItems) {
      const lineTotal = item.quantity * item.rate
      subtotal += lineTotal
      if (item.taxable) taxableSubtotal += lineTotal
    }

    const taxAmount = taxableSubtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }, [lineItems, taxRate])

  // Line item handlers
  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { id: generateId(), description: "", quantity: 1, rate: 0, taxable: true },
    ])
  }

  function removeLineItem(id: string) {
    if (lineItems.length <= 1) return
    setLineItems((prev) => prev.filter((item) => item.id !== id))
  }

  function updateLineItem(id: string, field: keyof LineItem, value: any) {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  function moveLineItem(index: number, direction: "up" | "down") {
    const newItems = [...lineItems]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newItems.length) return
    ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]
    setLineItems(newItems)
  }

  // Date presets
  function setTermPreset(days: number) {
    setDueDate(addDays(new Date(issueDate), days))
  }

  // Format currency
  function fmt(amount: number) {
    const sym = CURRENCIES.find((c) => c.code === currency)?.symbol || "$"
    return `${sym}${amount.toFixed(2)}`
  }

  // Submit
  async function handleSubmit(asDraft: boolean = true) {
    setIsSaving(true)
    setError("")

    if (!selectedClientId) {
      setError("Please select a client")
      setIsSaving(false)
      return
    }

    const validItems = lineItems.filter((item) => item.description.trim())
    if (validItems.length === 0) {
      setError("Add at least one line item with a description")
      setIsSaving(false)
      return
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          issueDate,
          dueDate,
          currency,
          taxRate: taxRate > 0 ? taxRate : null,
          notes,
          terms,
          lineItems: validItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            taxable: item.taxable,
            sortOrder: index,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create invoice")
        return
      }

      router.push(`/invoices/${data.invoice.id}`)
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSaving}>
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  placeholder="Search clients..."
                  value={selectedClientId ? selectedClientName : clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value)
                    setSelectedClientId("")
                    setSelectedClientName("")
                    setShowClientDropdown(true)
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                />
                {selectedClientId && (
                  <button
                    onClick={() => {
                      setSelectedClientId("")
                      setSelectedClientName("")
                      setClientSearch("")
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {showClientDropdown && !selectedClientId && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredClients.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">No clients found</div>
                    ) : (
                      filteredClients.map((c) => (
                        <button
                          key={c.id}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50"
                          onClick={() => {
                            setSelectedClientId(c.id)
                            setSelectedClientName(c.name)
                            setShowClientDropdown(false)
                            setClientSearch("")
                          }}
                        >
                          <span className="font-medium text-gray-900">{c.name}</span>
                          {c.email && <span className="text-sm text-gray-400">{c.email}</span>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Line Items</CardTitle>
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium uppercase text-gray-500">
                  <div className="col-span-1"></div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-1">Tax</div>
                  <div className="col-span-1 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                {lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 items-center gap-2">
                    {/* Reorder */}
                    <div className="col-span-1 flex flex-col gap-0.5">
                      <button
                        onClick={() => moveLineItem(index, "up")}
                        disabled={index === 0}
                        className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveLineItem(index, "down")}
                        disabled={index === lineItems.length - 1}
                        className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="col-span-4">
                      <Input
                        placeholder="Service description..."
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity || ""}
                        onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate || ""}
                        onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={item.taxable}
                        onChange={(e) => updateLineItem(item.id, "taxable", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium">
                      {fmt(item.quantity * item.rate)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length <= 1}
                        className="text-gray-300 hover:text-red-500 disabled:opacity-30"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="ml-auto w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{fmt(calculations.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Tax</span>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxRate || ""}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="h-7 w-16 text-center text-xs"
                        placeholder="0"
                      />
                      <span className="text-gray-400">%</span>
                    </div>
                    <span className="font-medium">{fmt(calculations.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{fmt(calculations.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notes (visible to client)</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for the client..."
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment terms and conditions..."
                  rows={2}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Receipt", days: 0 },
                    { label: "Net 7", days: 7 },
                    { label: "Net 14", days: 14 },
                    { label: "Net 30", days: 30 },
                    { label: "Net 60", days: 60 },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      onClick={() => setTermPreset(preset.days)}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Subtotal</span>
                  <span className="font-medium text-blue-900">{fmt(calculations.subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tax ({taxRate}%)</span>
                    <span className="font-medium text-blue-900">{fmt(calculations.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-blue-200 pt-2 text-lg font-bold">
                  <span className="text-blue-800">Total</span>
                  <span className="text-blue-900">{fmt(calculations.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
