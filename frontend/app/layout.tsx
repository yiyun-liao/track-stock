import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Track Stock - AI 美股監控系統',
  description: 'Real-time stock tracking with AI-powered analysis and Telegram notifications',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-slate-50">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
