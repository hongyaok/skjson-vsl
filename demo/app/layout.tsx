import type { Metadata } from 'next'

import './globals.css'
import { BackgroundWrapper } from '@/components/BackgroundWrapper'

export const metadata: Metadata = {
  title: 'skjson | Train in Python. Run in the browser. No backend needed.',
  description: 'Export scikit-learn models to JSON and run inference directly in the browser using JavaScript.',
  icons: '/icon.svg',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="lowercase">
        <BackgroundWrapper>
          {children}
        </BackgroundWrapper>
      </body>
    </html>
  )
}
