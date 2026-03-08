import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://solobid.com"),
  title: {
    default: "SoloBid - Send Professional Invoices in 60 Seconds",
    template: "%s | SoloBid",
  },
  description: "Simple invoicing for freelancers and solo businesses. Create, send, and track professional invoices in 60 seconds. From $5/month. Free 5-day trial.",
  keywords: ["invoicing app","freelancer invoice software","simple invoicing","invoice generator","send invoices online","small business invoicing"],
  authors: [{ name: "SoloBid" }],
  creator: "SoloBid",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://solobid.com",
    siteName: "SoloBid",
    title: "SoloBid - Send Professional Invoices in 60 Seconds",
    description: "Simple invoicing for freelancers and solo businesses. From $5/month.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoloBid - Send Professional Invoices in 60 Seconds",
    description: "Simple invoicing for freelancers. From $5/month. Free 5-day trial.",
    creator: "@SoloBidApp",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
