"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Users, FileCheck, Settings, BarChart3, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/estimates", label: "Estimates", icon: FileCheck },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  const NavContent = () => (
    <>
      <div className="flex h-14 items-center border-b border-gray-100 px-4">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">Solo<span className="text-blue-600">Bid</span></Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
              <item.icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-100 p-3">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <LogOut className="h-4 w-4 text-gray-400" /> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"><Menu className="h-5 w-5" /></button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            <NavContent />
          </div>
        </div>
      )}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-gray-100 bg-white lg:flex"><NavContent /></aside>
    </>
  )
}