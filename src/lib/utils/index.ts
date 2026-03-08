import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date))
}

export function generateInvoiceNumber(prefix: string = "INV", sequence: number): string {
  return `${prefix}-${String(sequence).padStart(5, "0")}`
}

export function calculateDueDate(terms: string): Date {
  const now = new Date()
  switch (terms) {
    case "DUE_ON_RECEIPT": return now
    case "NET_7": return new Date(now.setDate(now.getDate() + 7))
    case "NET_14": return new Date(now.setDate(now.getDate() + 14))
    case "NET_30": return new Date(now.setDate(now.getDate() + 30))
    case "NET_60": return new Date(now.setDate(now.getDate() + 60))
    case "NET_90": return new Date(now.setDate(now.getDate() + 90))
    default: return new Date(now.setDate(now.getDate() + 30))
  }
}
