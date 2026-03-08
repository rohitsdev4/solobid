"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Send,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  DollarSign,
} from "lucide-react"

type Invoice = {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  currency: string
  total: number
  amountPaid: number
  client: { id: string; name: string; email: string | null }
}

type Pagination = {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT: { label: "Draft", color: "text-gray-700", bg: "bg-gray-100", icon: FileText },
  SENT: { label: "Sent", color: "text-blue-700", bg: "bg-blue-50", icon: Send },
  VIEWED: { label: "Viewed", color: "text-purple-700", bg: "bg-purple-50", icon: Eye },
  PAID: { label: "Paid", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  PARTIALLY_PAID: { label: "Partial", color: "text-yellow-700", bg: "bg-yellow-50", icon: DollarSign },
  OVERDUE: { label: "Overdue", color: "text-red-700", bg: "bg-red-50", icon: AlertCircle },
  CANCELLED: { label: "Cancelled", color: "text-gray-500", bg: "bg-gray-50", icon: XCircle },
}

const CURRENCIES: Record<string, { symbol: string; locale: string }> = {
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "\u00a3", locale: "en-GB" },
  EUR: { symbol: "\u20ac", locale: "de-DE" },
  INR: { symbol: "\u20b9", locale: "en-IN" },
  AUD: { symbol: "A$", locale: "en-AU" },
  CAD: { symbol: "C$", locale: "en-CA" },
}

function formatCurrency(amount: number, currency: string) {
  const config = CURRENCIES[currency] || CURRENCIES.USD
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

export default function InvoicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pageSize: 20, totalPages: 0 })
  const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0, paid: 0, overdue: 0, totalRevenue: 0, outstanding: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "createdAt")
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") || "desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      params.set("sort", sortBy)
      params.set("order", sortOrder)
      params.set("page", String(page))
      params.set("pageSize", "20")

      const res = await fetch(`/api/invoices?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setInvoices(data.invoices || [])
      setPagination(data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 })
      if (data.stats) setStats(data.stats)
    } catch (err) {
      console.error("Failed to fetch invoices:", err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, sortBy, sortOrder, page])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (sortBy !== "createdAt") params.set("sort", sortBy)
    if (sortOrder !== "desc") params.set("order", sortOrder)
    if (page > 1) params.set("page", String(page))
    const queryString = params.toString()
    router.replace(`/invoices${queryString ? `?${queryString}` : ""}`, { scroll: false })
  }, [search, statusFilter, sortBy, sortOrder, page, router])

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === invoices.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(invoices.map((i) => i.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} invoice(s)? This cannot be undone.`)) return
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/invoices/${id}`, { method: "DELETE" })
        )
      )
      setSelected(new Set())
      fetchInvoices()
    } catch (err) {
      console.error("Bulk delete failed:", err)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`)
      if (!res.ok) return
      const data = await res.json()
      // Navigate to new invoice with prefilled data
      router.push(`/invoices/new?duplicate=${id}`)
    } catch (err) {
      console.error("Duplicate failed:", err)
    }
  }

  const quickStatCards = [
    { label: "Total Invoices", value: stats.total, icon: FileText, color: "text-gray-600" },
    { label: "Outstanding", value: formatCurrency(stats.outstanding, "USD"), icon: Clock, color: "text-yellow-600" },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, color: "text-red-600" },
    { label: "Revenue", value: formatCurrency(stats.totalRevenue, "USD"), icon: DollarSign, color: "text-green-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">Manage and track all your invoices</p>
        </div>
        <Link href="/invoices/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickStatCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg bg-gray-50 p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices by number, client..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              showFilters || statusFilter ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {statusFilter && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">1</span>
            )}
          </button>
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            {["", "DRAFT", "SENT", "VIEWED", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s ? (STATUS_CONFIG[s]?.label || s) : "All"}
              </button>
            ))}
            {statusFilter && (
              <button
                onClick={() => { setStatusFilter(""); setPage(1) }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoice Table */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={invoices.length > 0 && selected.size === invoices.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("invoiceNumber")} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
                    Invoice <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("issueDate")} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
                    Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("dueDate")} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
                    Due <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button onClick={() => toggleSort("total")} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
                    Amount <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4" colSpan={8}>
                      <div className="h-4 rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <FileText className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-4 text-sm font-semibold text-gray-900">No invoices found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {search || statusFilter
                          ? "Try adjusting your filters or search terms."
                          : "Get started by creating your first invoice."}
                      </p>
                      {!search && !statusFilter && (
                        <Link href="/invoices/new" className="mt-4 inline-block">
                          <Button size="sm" className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Create Invoice
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const isOverdue =
                    invoice.status !== "PAID" &&
                    invoice.status !== "CANCELLED" &&
                    new Date(invoice.dueDate) < new Date()
                  return (
                    <tr
                      key={invoice.id}
                      className="group cursor-pointer transition-colors hover:bg-gray-50/50"
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(invoice.id)}
                          onChange={() => toggleSelect(invoice.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.client.name}</p>
                          {invoice.client.email && (
                            <p className="text-xs text-gray-500">{invoice.client.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={isOverdue && invoice.status !== "OVERDUE" ? "OVERDUE" : invoice.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(invoice.issueDate)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm ${isOverdue ? "font-medium text-red-600" : "text-gray-600"}`}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Number(invoice.total), invoice.currency)}
                        </span>
                        {Number(invoice.amountPaid) > 0 && Number(invoice.amountPaid) < Number(invoice.total) && (
                          <p className="text-xs text-green-600">
                            {formatCurrency(Number(invoice.amountPaid), invoice.currency)} paid
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(invoice.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              const res = await fetch(`/api/invoices/${invoice.id}/pdf`)
                              if (res.ok) {
                                const blob = await res.blob()
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement("a")
                                a.href = url
                                a.download = `${invoice.invoiceNumber}.pdf`
                                a.click()
                                URL.revokeObjectURL(url)
                              }
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * pagination.pageSize + 1}-{Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
