"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AgingData {
  aging: {
    current: any[]
    days30: any[]
    days60: any[]
    days90: any[]
    over90: any[]
  }
  totals: Record<string, number>
}

interface ClientRevenue {
  clientRevenue: { id: string; name: string; invoiceCount: number; revenue: number }[]
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("aging")
  const [agingData, setAgingData] = useState<AgingData | null>(null)
  const [clientData, setClientData] = useState<ClientRevenue | null>(null)
  const [taxData, setTaxData] = useState<{ totalTax: number; invoiceCount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/reports?type=${activeTab === "clients" ? "by-client" : activeTab}`)
        const data = await res.json()
        if (activeTab === "aging") setAgingData(data)
        else if (activeTab === "clients") setClientData(data)
        else if (activeTab === "tax") setTaxData(data)
      } catch (err) { console.error(err) }
      finally { setIsLoading(false) }
    }
    load()
  }, [activeTab])

  function fmt(amount: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  function exportCSV() {
    if (!agingData) return
    const all = [
      ...agingData.aging.current,
      ...agingData.aging.days30,
      ...agingData.aging.days60,
      ...agingData.aging.days90,
      ...agingData.aging.over90,
    ]
    const csv = [
      "Invoice,Client,Total,Balance,Due Date,Days Overdue",
      ...all.map((i) => `${i.invoiceNumber},${i.client},${i.total},${i.balance},${new Date(i.dueDate).toLocaleDateString()},${i.daysOverdue}`),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aging-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const tabs = [
    { id: "aging", label: "Aging Report" },
    { id: "clients", label: "Revenue by Client" },
    { id: "tax", label: "Tax Summary" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Business analytics and insights</p>
        </div>
        {activeTab === "aging" && (
          <Button variant="outline" onClick={exportCSV}>
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-white p-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>
      ) : (
        <>
          {/* Aging Report */}
          {activeTab === "aging" && agingData && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-3 sm:grid-cols-5">
                {[
                  { label: "Current", key: "current", color: "text-green-600" },
                  { label: "1-30 Days", key: "days30", color: "text-yellow-600" },
                  { label: "31-60 Days", key: "days60", color: "text-orange-600" },
                  { label: "61-90 Days", key: "days90", color: "text-red-600" },
                  { label: "90+ Days", key: "over90", color: "text-red-800" },
                ].map((bucket) => (
                  <Card key={bucket.key}>
                    <CardContent className="pt-4">
                      <p className="text-xs font-medium text-gray-500">{bucket.label}</p>
                      <p className={`text-lg font-bold ${bucket.color}`}>{fmt(agingData.totals[bucket.key] || 0)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detailed table */}
              {Object.entries(agingData.aging).map(([bucket, items]) => (
                items.length > 0 && (
                  <Card key={bucket}>
                    <CardHeader><CardTitle className="text-sm uppercase text-gray-500">{bucket === "current" ? "Current (Not Due)" : bucket === "days30" ? "1-30 Days Overdue" : bucket === "days60" ? "31-60 Days" : bucket === "days90" ? "61-90 Days" : "90+ Days"}</CardTitle></CardHeader>
                    <CardContent>
                      <table className="min-w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500">
                          <th className="pb-2">Invoice</th><th className="pb-2">Client</th><th className="pb-2 text-right">Balance</th><th className="pb-2 text-right">Days</th>
                        </tr></thead>
                        <tbody>{items.map((item: any) => (
                          <tr key={item.invoiceNumber} className="border-t">
                            <td className="py-2 font-medium">{item.invoiceNumber}</td>
                            <td className="py-2 text-gray-600">{item.client}</td>
                            <td className="py-2 text-right font-medium">{fmt(item.balance)}</td>
                            <td className="py-2 text-right text-gray-500">{item.daysOverdue}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          )}

          {/* Revenue by Client */}
          {activeTab === "clients" && clientData && (
            <Card>
              <CardContent className="pt-6">
                {clientData.clientRevenue.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No paid invoices yet</p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead><tr className="text-left text-xs text-gray-500">
                      <th className="pb-2">Client</th><th className="pb-2 text-right">Invoices</th><th className="pb-2 text-right">Revenue</th>
                    </tr></thead>
                    <tbody>{clientData.clientRevenue.map((c) => (
                      <tr key={c.id} className="border-t">
                        <td className="py-3 font-medium">{c.name}</td>
                        <td className="py-3 text-right text-gray-600">{c.invoiceCount}</td>
                        <td className="py-3 text-right font-medium text-green-600">{fmt(c.revenue)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tax Summary */}
          {activeTab === "tax" && taxData && (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <p className="text-sm text-gray-500">Total Tax Collected</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{fmt(taxData.totalTax)}</p>
                <p className="mt-1 text-sm text-gray-500">From {taxData.invoiceCount} paid invoices</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
