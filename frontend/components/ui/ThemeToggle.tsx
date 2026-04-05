'use client'

import { Moon, Sun } from 'lucide-react'
import { useMounted } from '@/lib/hooks/useMounted'
import { useTheme } from '@/lib/theme-context'
import { useLanguageSafe } from '@/lib/language-context'
import { ToggleButton } from './ToggleButton'

export function ThemeToggle() {
  const mounted = useMounted()
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguageSafe()

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  const mode = theme === 'light' ? 'dark' : 'light'
  const modeText = mode === 'dark' ? 'dark' : 'light'

  return (
    <ToggleButton
      onChange={toggleTheme}
      variant="icon"
      title={t('theme.switch', { mode: modeText })}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </ToggleButton>
  )
}
