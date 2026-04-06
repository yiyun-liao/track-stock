import { zhTranslations } from './zh'
import { enTranslations } from './en'

export type Language = 'zh' | 'en'

export const translations: Record<Language, Record<string, string>> = {
  zh: zhTranslations,
  en: enTranslations,
}

export { zhTranslations, enTranslations }
