"use client"

import { useState, useEffect } from "react"
import { Bell, Search } from "lucide-react"

export function TopBar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setUser(data.user))
      .catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex-1 lg:ml-0 ml-12">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"><Bell className="h-5 w-5" /></button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{user?.name?.[0]?.toUpperCase() || "?"}</div>
      </div>
    </header>
  )
}