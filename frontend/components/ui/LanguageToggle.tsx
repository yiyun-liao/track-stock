'use client'

import { useMounted } from '@/lib/hooks/useMounted'
import { useLanguage } from '@/lib/language-context'
import { ToggleButton } from './ToggleButton'

export function LanguageToggle() {
  const mounted = useMounted()
  const { language, toggleLanguage } = useLanguage()

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  return (
    <ToggleButton
      value={language === 'zh' ? 'EN' : '中'}
      onChange={toggleLanguage}
      title={`Switch to ${language === 'zh' ? 'English' : '中文'}`}
    />
  )
}
