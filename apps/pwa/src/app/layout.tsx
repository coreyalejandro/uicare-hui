import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'UICare — Behavioral Safety Aid',
  description:
    'A local-first behavioral safety aid for high-risk neurodivergent users. ' +
    'Not a medical device. Not a clinical tool. A personal safety companion.',
  manifest: '/manifest.json',
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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
