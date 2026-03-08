"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  revenue: { month: number; quarter: number; year: number }
  outstanding: { amount: number; count: number }
  overdue: { amount: number; count: number }
  clientCount: number
  recentInvoices: any[]
  monthlyRevenue: { month: string; revenue: number }[]
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard")
        const d = await res.json()
        if (res.ok) setData(d)
      } catch (err) { console.error(err) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  function fmt(amount: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const d = data || {
    revenue: { month: 0, quarter: 0, year: 0 },
    outstanding: { amount: 0, count: 0 },
    overdue: { amount: 0, count: 0 },
    clientCount: 0,
    recentInvoices: [],
    monthlyRevenue: [],
  }

  const maxRevenue = Math.max(...d.monthlyRevenue.map((m) => m.revenue), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your business</p>
        </div>
        <Link href="/invoices/new"><Button>New Invoice</Button></Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Revenue (Month)</CardTitle>
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(d.revenue.month)}</div>
            <p className="text-xs text-gray-500">Quarter: {fmt(d.revenue.quarter)} | Year: {fmt(d.revenue.year)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding</CardTitle>
            <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(d.outstanding.amount)}</div>
            <p className="text-xs text-gray-500">{d.outstanding.count} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue</CardTitle>
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fmt(d.overdue.amount)}</div>
            <p className="text-xs text-gray-500">{d.overdue.count} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clients</CardTitle>
            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{d.clientCount}</div>
            <p className="text-xs text-gray-500">Active clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart (CSS bar chart) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2" style={{ height: "200px" }}>
            {d.monthlyRevenue.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">
                  {m.revenue > 0 ? fmt(m.revenue) : ""}
                </span>
                <div
                  className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                  style={{
                    height: `${Math.max((m.revenue / maxRevenue) * 160, m.revenue > 0 ? 4 : 0)}px`,
                    minHeight: m.revenue > 0 ? "4px" : "0",
                  }}
                />
                <span className="text-xs text-gray-400">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions + Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/invoices/new" className="flex items-center gap-3 rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div><p className="font-medium text-gray-900">New Invoice</p><p className="text-sm text-gray-500">Create and send</p></div>
              </Link>
              <Link href="/estimates/new" className="flex items-center gap-3 rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div><p className="font-medium text-gray-900">New Estimate</p><p className="text-sm text-gray-500">Quote a project</p></div>
              </Link>
              <Link href="/clients" className="flex items-center gap-3 rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <div><p className="font-medium text-gray-900">Add Client</p><p className="text-sm text-gray-500">New client</p></div>
              </Link>
              <Link href="/reports" className="flex items-center gap-3 rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div><p className="font-medium text-gray-900">Reports</p><p className="text-sm text-gray-500">View analytics</p></div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            {d.recentInvoices.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No invoices yet. Create your first one!</p>
            ) : (
              <div className="space-y-2">
                {d.recentInvoices.slice(0, 5).map((inv: any) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-900">{inv.invoiceNumber}</span>
                      <span className="ml-2 text-sm text-gray-500">{inv.client?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status] || "bg-gray-100"}`}>{inv.status.replace("_", " ")}</span>
                      <span className="text-sm font-medium">{fmt(Number(inv.total))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
