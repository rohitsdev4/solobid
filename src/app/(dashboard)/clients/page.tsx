"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  country: string | null
  isArchived: boolean
  createdAt: string
  _count: { invoices: number }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: "20",
        ...(search && { search }),
      })
      const res = await fetch(`/api/clients?${params}`)
      const data = await res.json()
      if (res.ok) {
        setClients(data.clients)
        setPagination((prev) => ({ ...prev, ...data.pagination }))
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err)
    } finally {
      setIsLoading(false)
    }
  }, [search, pagination.page])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">{pagination.total} total clients</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <Input
          placeholder="Search clients by name, email, or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
          className="max-w-md"
        />
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <svg className="mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-900">No clients yet</p>
            <p className="mb-4 text-sm text-gray-500">Add your first client to start invoicing.</p>
            <Button onClick={() => setShowAddModal(true)}>Add Client</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoices</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link href={`/clients/${client.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {client.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div>{client.email || "-"}</div>
                    <div>{client.phone || ""}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {[client.city, client.state, client.country].filter(Boolean).join(", ") || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {client._count.invoices}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchClients()
          }}
        />
      )}
    </div>
  )
}

function AddClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          address: form.get("address"),
          city: form.get("city"),
          state: form.get("state"),
          zipCode: form.get("zipCode"),
          country: form.get("country"),
          notes: form.get("notes"),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to add client")
        return
      }

      onSuccess()
    } catch (err) {
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add New Client</CardTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input name="name" placeholder="Client or company name" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="client@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input name="phone" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input name="address" placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input name="city" placeholder="City" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input name="state" placeholder="State" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input name="zipCode" placeholder="ZIP" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input name="country" placeholder="US" defaultValue="US" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                placeholder="Internal notes about this client..."
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Client"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
