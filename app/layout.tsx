import type { Metadata, Viewport } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthGuard } from '@/components/auth/AuthGuard'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" })

export const metadata: Metadata = {
  title: 'FinCasal - Financas do Casal',
  description: 'Gerencie as financas do casal de forma simples e organizada',
}

export const viewport: Viewport = {
  themeColor: '#21C25E',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthGuard>
          {children}
        </AuthGuard>
        <Analytics />
      </body>
    </html>
  )
}
