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
  Eye,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  RefreshCw,
} from "lucide-react"

type Estimate = {
  id: string
  estimateNumber: string
  status: string
  issueDate: string
  validUntil: string
  currency: string
  total: number
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
  ACCEPTED: { label: "Accepted", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-50", icon: XCircle },
  CONVERTED: { label: "Converted", color: "text-purple-700", bg: "bg-purple-50", icon: ArrowRightCircle },
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

export default function EstimatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pageSize: 20, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "createdAt")
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") || "desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0, accepted: 0, rejected: 0, converted: 0, totalValue: 0 })

  const fetchEstimates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      params.set("sort", sortBy)
      params.set("order", sortOrder)
      params.set("page", String(page))
      params.set("pageSize", "20")

      const res = await fetch(`/api/estimates?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setEstimates(data.estimates || [])
      setPagination(data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 })
      if (data.stats) setStats(data.stats)
    } catch (err) {
      console.error("Failed to fetch estimates:", err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, sortBy, sortOrder, page])

  useEffect(() => {
    fetchEstimates()
  }, [fetchEstimates])

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
    if (selected.size === estimates.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(estimates.map((e) => e.id)))
    }
  }

  const handleConvertToInvoice = async (id: string) => {
    setConverting(id)
    try {
      const res = await fetch(`/api/estimates/${id}/convert`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to convert")
      const data = await res.json()
      router.push(`/invoices/${data.invoiceId}`)
    } catch (err) {
      console.error("Convert failed:", err)
      alert("Failed to convert estimate to invoice. Please try again.")
    } finally {
      setConverting(null)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} estimate(s)? This cannot be undone.`)) return
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/estimates/${id}`, { method: "DELETE" })
        )
      )
      setSelected(new Set())
      fetchEstimates()
    } catch (err) {
      console.error("Bulk delete failed:", err)
    }
  }

  const quickStatCards = [
    { label: "Total Estimates", value: stats.total, icon: FileText, color: "text-gray-600" },
    { label: "Sent", value: stats.sent, icon: Send, color: "text-blue-600" },
    { label: "Accepted", value: stats.accepted, icon: CheckCircle2, color: "text-green-600" },
    { label: "Total Value", value: formatCurrency(stats.totalValue, "USD"), icon: ArrowRightCircle, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Estimates</h1>
          <p className="text-sm text-gray-500">Create quotes and convert accepted estimates to invoices</p>
        </div>
        <Link href="/estimates/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Estimate
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
            placeholder="Search estimates by number, client..."
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
            {["", "DRAFT", "SENT", "ACCEPTED", "REJECTED", "CONVERTED"].map((s) => (
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

      {/* Estimates Table */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={estimates.length > 0 && selected.size === estimates.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("estimateNumber")} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
                    Estimate <ArrowUpDown className="h-3 w-3" />
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
                  <button onClick={() => toggleSort("validUntil")} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
                    Valid Until <ArrowUpDown className="h-3 w-3" />
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
              ) : estimates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <FileText className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-4 text-sm font-semibold text-gray-900">No estimates found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {search || statusFilter
                          ? "Try adjusting your filters or search terms."
                          : "Create your first estimate to send quotes to clients."}
                      </p>
                      {!search && !statusFilter && (
                        <Link href="/estimates/new" className="mt-4 inline-block">
                          <Button size="sm" className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Create Estimate
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                estimates.map((estimate) => {
                  const isExpired =
                    estimate.status === "SENT" &&
                    new Date(estimate.validUntil) < new Date()
                  return (
                    <tr
                      key={estimate.id}
                      className="group cursor-pointer transition-colors hover:bg-gray-50/50"
                      onClick={() => router.push(`/estimates/${estimate.id}`)}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(estimate.id)}
                          onChange={() => toggleSelect(estimate.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">{estimate.estimateNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{estimate.client.name}</p>
                          {estimate.client.email && (
                            <p className="text-xs text-gray-500">{estimate.client.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={estimate.status} />
                        {isExpired && (
                          <span className="ml-2 text-xs font-medium text-red-500">Expired</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(estimate.issueDate)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm ${isExpired ? "font-medium text-red-600" : "text-gray-600"}`}>
                          {formatDate(estimate.validUntil)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Number(estimate.total), estimate.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => router.push(`/estimates/${estimate.id}`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(estimate.status === "ACCEPTED") && (
                            <button
                              onClick={() => handleConvertToInvoice(estimate.id)}
                              disabled={converting === estimate.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                              title="Convert to Invoice"
                            >
                              {converting === estimate.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <ArrowRightCircle className="h-3 w-3" />
                              )}
                              Convert
                            </button>
                          )}
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
