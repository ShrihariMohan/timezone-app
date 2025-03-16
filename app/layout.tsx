import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: 'Timezone App',
  description: 'Created by Shrihari',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Timezone App - Multi-Timezone Tracker for Developers" />
        <meta property="og:description" content="A modern timezone application for developers and remote employees to manage and compare multiple timezones effortlessly." />
        <meta property="og:image" content="https://app-timezone.vercel.app/og-image.png" />
        <meta property="og:url" content="https://app-timezone.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Timezone App" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Timezone App - Multi-Timezone Tracker for Developers" />
        <meta name="twitter:description" content="A simple yet powerful timezone manager for developers and remote workers." />
        <meta name="twitter:image" content="https://app-timezone.vercel.app/og-image.png" />
        <meta name="twitter:url" content="https://app-timezone.vercel.app/" />
        <meta name="twitter:creator" content="@papashrihari" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
      
    </html>
  )
}
