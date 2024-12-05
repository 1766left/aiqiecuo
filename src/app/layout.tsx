import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI 切磋大会积分系统',
  description: '会议积分管理与转账系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
