import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import RegisterSW from './register-sw'

export const metadata: Metadata = {
  title: 'Timezone App',
  description: 'Multi-timezone tracker for developers and remote workers.',
  applicationName: 'Timezone App',
  keywords: ['timezones', 'world clock', 'developers', 'remote work'],
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  openGraph: {
    title: 'Timezone App - Multi-Timezone Tracker for Developers',
    description:
      'A modern timezone application for developers and remote employees to manage and compare multiple timezones effortlessly.',
    url: 'https://app-timezone.vercel.app/',
    siteName: 'Timezone App',
    images: '/og-image.png',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timezone App - Multi-Timezone Tracker for Developers',
    description:
      'A simple yet powerful timezone manager for developers and remote workers.',
    images: ['/og-image.png'],
    creator: '@papashrihari',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        {children}
        <Toaster />
        <RegisterSW />
      </body>
      
    </html>
  )
}
