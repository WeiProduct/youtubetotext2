import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DebugProvider } from '@/lib/debug-context'
import DebugPanel from '@/components/DebugPanel'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube to Text Converter',
  description: 'Convert YouTube videos to text transcripts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DebugProvider>
          {children}
          <DebugPanel />
        </DebugProvider>
      </body>
    </html>
  )
}