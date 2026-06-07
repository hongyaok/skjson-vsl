'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 opacity-50 bg-secondary/50 px-3 py-1.5 rounded-full">
        <Switch disabled checked={false} className="data-[checked]:!bg-[#facc15] data-[unchecked]:!bg-[#facc15] data-[state=checked]:!bg-[#facc15] data-[state=unchecked]:!bg-[#facc15]" />
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center space-x-2 bg-secondary/30 hover:bg-secondary/50 transition-colors px-3 py-1.5 rounded-full border border-border/50">
      <Switch 
        id="theme-mode" 
        checked={isDark} 
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
        className="data-[checked]:!bg-[#facc15] data-[unchecked]:!bg-[#facc15] data-[state=checked]:!bg-[#facc15] data-[state=unchecked]:!bg-[#facc15] shadow-sm"
      />
    </div>
  )
}
