import type { Metadata } from 'next'
import { ThemeProvider } from '@/lib/theme-context'
import { LanguageProvider } from '@/lib/language-context'
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
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <div className="min-h-screen">
              {children}
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
