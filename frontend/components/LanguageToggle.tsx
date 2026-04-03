'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

export function LanguageToggle() {
  const [mounted, setMounted] = useState(false)
  const { language, toggleLanguage } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-xs font-medium"
      title={`Switch to ${language === 'zh' ? 'English' : '中文'}`}
    >
      {language === 'zh' ? 'EN' : '中'}
    </button>
  )
}
