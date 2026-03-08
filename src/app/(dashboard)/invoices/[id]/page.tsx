"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InvoiceDetail {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  currency: string
  subtotal: number
  taxRate: number | null
  taxAmount: number
  total: number
  amountPaid: number
  notes: string | null
  terms: string | null
  sentAt: string | null
  viewedAt: string | null
  paidAt: string | null
  templateId: string
  client: {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    country: string | null
  }
  business: {
    name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    country: string
    logoUrl: string | null
    brandColor: string
  }
  lineItems: {
    id: string
    description: string
    quantity: number
    rate: number
    taxable: boolean
    sortOrder: number
  }[]
  payments: {
    id: string
    amount: number
    method: string
    reference: string | null
    notes: string | null
    paidAt: string
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  PAID: "bg-green-100 text-green-700",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`)
        const data = await res.json()
        if (res.ok) setInvoice(data.invoice)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvoice()
  }, [invoiceId])

  async function updateStatus(status: string) {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setInvoice((prev) => prev ? { ...prev, ...data.invoice } : null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this draft invoice?")) return
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" })
      if (res.ok) router.push("/invoices")
    } catch (err) {
      console.error(err)
    }
  }

  function fmt(amount: number) {
    if (!invoice) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    }).format(Number(amount))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/invoices"><Button variant="outline" className="mt-4">Back to Invoices</Button></Link>
      </div>
    )
  }

  const balance = Number(invoice.total) - Number(invoice.amountPaid)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[invoice.status]}`}>
                {invoice.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-500">
              For {invoice.client.name} | Due {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === "DRAFT" && (
            <>
              <Button variant="outline" onClick={() => updateStatus("SENT")}>
                Mark as Sent
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
          {invoice.status === "SENT" && (
            <Button onClick={() => updateStatus("PAID")}>
              Mark as Paid
            </Button>
          )}
          {(invoice.status === "VIEWED" || invoice.status === "OVERDUE") && (
            <Button onClick={() => updateStatus("PAID")}>
              Mark as Paid
            </Button>
          )}
          <Button variant="outline">Download PDF</Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card>
        <CardContent className="p-8">
          {/* Header Row */}
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: invoice.business.brandColor }}>
                {invoice.business.name}
              </h2>
              {invoice.business.email && <p className="text-sm text-gray-500">{invoice.business.email}</p>}
              {invoice.business.phone && <p className="text-sm text-gray-500">{invoice.business.phone}</p>}
              {invoice.business.address && (
                <p className="text-sm text-gray-500">
                  {[invoice.business.address, invoice.business.city, invoice.business.state, invoice.business.zipCode]
                    .filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
              <p className="text-sm text-gray-500">#{invoice.invoiceNumber}</p>
              <p className="mt-2 text-sm">
                <span className="text-gray-500">Date: </span>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Due: </span>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mt-8">
            <p className="text-xs font-medium uppercase text-gray-400">Bill To</p>
            <p className="mt-1 font-medium text-gray-900">{invoice.client.name}</p>
            {invoice.client.email && <p className="text-sm text-gray-500">{invoice.client.email}</p>}
            {invoice.client.phone && <p className="text-sm text-gray-500">{invoice.client.phone}</p>}
            {invoice.client.address && (
              <p className="text-sm text-gray-500">
                {[invoice.client.address, invoice.client.city, invoice.client.state, invoice.client.country]
                  .filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {/* Line Items Table */}
          <div className="mt-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{Number(item.quantity)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{fmt(Number(item.rate))}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {fmt(Number(item.quantity) * Number(item.rate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{fmt(Number(invoice.subtotal))}</span>
              </div>
              {invoice.taxRate && Number(invoice.taxRate) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax ({Number(invoice.taxRate)}%)</span>
                  <span>{fmt(Number(invoice.taxAmount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span>
                <span>{fmt(Number(invoice.total))}</span>
              </div>
              {Number(invoice.amountPaid) > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>-{fmt(Number(invoice.amountPaid))}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold text-blue-600">
                    <span>Balance Due</span>
                    <span>{fmt(balance)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              {invoice.notes && (
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase text-gray-400">Notes</p>
                  <p className="mt-1 text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">Terms</p>
                  <p className="mt-1 text-sm text-gray-600">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-900">{fmt(Number(payment.amount))}</span>
                    <span className="ml-2 text-sm text-gray-500">via {payment.method.replace("_", " ")}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(payment.paidAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
