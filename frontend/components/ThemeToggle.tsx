'use client'

import { Moon, Sun } from 'lucide-react'
import { useMounted } from '@/lib/hooks/useMounted'
import { useTheme } from '@/lib/theme-context'
import { ToggleButton } from './ui/ToggleButton'

export function ThemeToggle() {
  const mounted = useMounted()
  const { theme, toggleTheme } = useTheme()

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  return (
    <ToggleButton
      onChange={toggleTheme}
      variant="icon"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </ToggleButton>
  )
}
