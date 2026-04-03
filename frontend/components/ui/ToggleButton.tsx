'use client'

import { memo, ReactNode } from 'react'

interface ToggleButtonProps {
  value?: string
  children?: ReactNode
  onChange: () => void
  title?: string
  variant?: 'text' | 'icon'
}

/**
 * Generic toggle button component.
 * Used for theme toggle, language toggle, and similar UI controls.
 * Pure presentation component - no business logic.
 */
export const ToggleButton = memo(function ToggleButton({
  value,
  children,
  onChange,
  title,
  variant = 'text',
}: ToggleButtonProps) {
  const textClasses = 'px-3 py-2 rounded-lg text-xs font-medium'
  const iconClasses = 'p-2 rounded-lg'
  const baseClasses = 'hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300'

  return (
    <button
      onClick={onChange}
      className={`${variant === 'text' ? textClasses : iconClasses} ${baseClasses}`}
      title={title}
    >
      {children || value}
    </button>
  )
})
