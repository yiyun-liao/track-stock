'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { translations, type Language } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string, defaults?: { [key: string]: string }) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null
    const browserLanguage = navigator.language.startsWith('zh') ? 'zh' : 'en'
    const initialLanguage = savedLanguage || browserLanguage
    setLanguage(initialLanguage)
    setMounted(true)
  }, [])

  // Update localStorage when language changes
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('language', language)
  }, [language, mounted])

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }

  const t = (key: string, defaults?: { [key: string]: string }): string => {
    const value = translations[language][key]
    if (!value && defaults) {
      return defaults[key] || key
    }
    return value || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function useLanguageSafe() {
  const context = useContext(LanguageContext)

  if (!context) {
    return {
      language: 'zh' as Language,
      toggleLanguage: () => {},
      t: (key: string) => key,
    }
  }

  return context
}
