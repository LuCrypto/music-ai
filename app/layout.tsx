import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Music AI',
  description: 'Music AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="h-full" data-theme="light" lang="en">
      <body className="h-full">{children}</body>
    </html>
  )
}
