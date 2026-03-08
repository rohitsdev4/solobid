"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  notes: string | null
  isArchived: boolean
  createdAt: string
  invoices: {
    id: string
    invoiceNumber: string
    status: string
    total: number
    currency: string
    issueDate: string
    dueDate: string
  }[]
  _count: { invoices: number; estimates: number }
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

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${clientId}`)
        const data = await res.json()
        if (res.ok) setClient(data.client)
      } catch (err) {
        console.error("Failed to fetch client:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClient()
  }, [clientId])

  async function handleArchive() {
    if (!confirm("Archive this client? You can restore them later.")) return
    try {
      await fetch(`/api/clients/${clientId}`, { method: "DELETE" })
      router.push("/clients")
    } catch (err) {
      console.error("Failed to archive:", err)
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
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
      if (res.ok) {
        setClient((prev) => (prev ? { ...prev, ...data.client } : null))
        setIsEditing(false)
      }
    } catch (err) {
      console.error("Failed to update:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Client not found</p>
        <Link href="/clients"><Button variant="outline" className="mt-4">Back to Clients</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-500">
              {client._count.invoices} invoices | {client._count.estimates} estimates
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Link href={`/invoices/new?client=${client.id}`}>
            <Button>New Invoice</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Contact Info</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <Input name="name" defaultValue={client.name} placeholder="Name" required />
                <Input name="email" defaultValue={client.email || ""} placeholder="Email" />
                <Input name="phone" defaultValue={client.phone || ""} placeholder="Phone" />
                <Input name="address" defaultValue={client.address || ""} placeholder="Address" />
                <div className="grid grid-cols-2 gap-2">
                  <Input name="city" defaultValue={client.city || ""} placeholder="City" />
                  <Input name="state" defaultValue={client.state || ""} placeholder="State" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input name="zipCode" defaultValue={client.zipCode || ""} placeholder="ZIP" />
                  <Input name="country" defaultValue={client.country || ""} placeholder="Country" />
                </div>
                <textarea
                  name="notes"
                  defaultValue={client.notes || ""}
                  placeholder="Notes"
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Save</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-sm">
                {client.email && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{client.email}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                )}
                {(client.address || client.city) && (
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <p className="font-medium">
                      {[client.address, client.city, client.state, client.zipCode, client.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
                {client.notes && (
                  <div>
                    <span className="text-gray-500">Notes:</span>
                    <p className="font-medium">{client.notes}</p>
                  </div>
                )}
                <div className="pt-3">
                  <button onClick={handleArchive} className="text-sm text-red-600 hover:text-red-700">
                    Archive Client
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {client.invoices.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No invoices yet for this client.</p>
            ) : (
              <div className="space-y-2">
                {client.invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{inv.invoiceNumber}</span>
                      <span className="ml-3 text-sm text-gray-500">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status] || "bg-gray-100"}`}>
                        {inv.status.replace("_", " ")}
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: inv.currency }).format(Number(inv.total))}
                      </span>
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
