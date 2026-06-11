import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { BackgroundWrapper } from '@/components/BackgroundWrapper'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'skjson-vsl | Interactive ML Model Visualizations',
  description: 'Beautiful, framework-agnostic web components for visualizing scikit-learn models. Decision trees, random forests, gradient boosting, and linear models.',
  icons: '/icon.svg',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`lowercase ${inter.variable} font-sans`}>
        <BackgroundWrapper>
          {children}
        </BackgroundWrapper>
      </body>
    </html>
  )
}
