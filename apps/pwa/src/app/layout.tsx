import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RealityProvider } from '@/components/RealityProvider'
import { SettingsProvider } from '@/components/SettingsContext'
import dynamic from 'next/dynamic'

const UIcareToolbar = dynamic(
  () => import('@/components/UIcareToolbar').then(mod => mod.UIcareToolbar),
  { ssr: false }
)

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'UICare — Behavioral Safety Aid',
  description:
    'A local-first behavioral safety aid for high-risk neurodivergent users. ' +
    'Not a medical device. Not a clinical tool. A personal safety companion.',
  icons: {
    icon: '/app-icon.svg',
    apple: '/app-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UICare Safety',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gradient-to-br from-background to-background/95 text-foreground min-h-screen">
        <SettingsProvider>
          <RealityProvider>
            <div className="relative">
              {children}
              <UIcareToolbar />
            </div>
          </RealityProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
