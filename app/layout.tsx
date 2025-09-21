import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IntelliCollect - Smart Collections Management",
  description: "Intelligent collections management system with AI-powered risk assessment, automated communications, and payment processing",
  keywords: "collections, billing, invoice, AI, risk assessment, payment processing, automation",
  authors: [{ name: "IntelliCollect Team" }],
  creator: "IntelliCollect",
  publisher: "IntelliCollect",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://intellicollect.example.com",
    title: "IntelliCollect - Smart Collections Management",
    description: "Transform your collections operations with AI-powered intelligence",
    siteName: "IntelliCollect",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntelliCollect - Smart Collections Management",
    description: "Transform your collections operations with AI-powered intelligence",
    creator: "@intellicollect",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}