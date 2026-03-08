export type Currency = { code: string; name: string; symbol: string }

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zl" },
  { code: "THB", name: "Thai Baht", symbol: "THB" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "PHP", name: "Philippine Peso", symbol: "PHP" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
]

export const PAYMENT_TERMS = [
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt" },
  { value: "NET_7", label: "Net 7 (Due in 7 days)" },
  { value: "NET_14", label: "Net 14 (Due in 14 days)" },
  { value: "NET_30", label: "Net 30 (Due in 30 days)" },
  { value: "NET_60", label: "Net 60 (Due in 60 days)" },
  { value: "NET_90", label: "Net 90 (Due in 90 days)" },
  { value: "CUSTOM", label: "Custom Date" },
] as const

export const TAX_ID_TYPES = [
  { value: "EIN", label: "EIN (US)" },
  { value: "GST", label: "GST (India)" },
  { value: "VAT", label: "VAT (EU/UK)" },
  { value: "ABN", label: "ABN (Australia)" },
  { value: "BN", label: "BN (Canada)" },
  { value: "OTHER", label: "Other" },
] as const

export const INVOICE_TEMPLATES = [
  { id: "modern", name: "Clean Modern", description: "Sleek and minimal design" },
  { id: "corporate", name: "Bold Corporate", description: "Professional business look" },
  { id: "minimal", name: "Minimal", description: "Ultra-clean whitespace" },
  { id: "classic", name: "Classic", description: "Traditional invoice style" },
  { id: "colorful", name: "Colorful", description: "Vibrant and eye-catching" },
] as const
