import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'success' | 'icon' | 'tab' | 'list-item'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  withBorder?: boolean
  isActive?: boolean
}

export default function Button({
  isLoading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  children,
  withBorder = false,
  isActive = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  // Base button styles
  const baseStyles = 'transition-colors'

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  // Color variants
  const colorStyles = {
    primary: 'font-medium rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white',
    secondary: 'font-medium rounded-lg bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white',
    success: 'font-medium rounded-lg bg-emerald-600 hover:bg-emerald-800 disabled:bg-slate-400 text-white',
    icon: 'p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed',
    tab: `px-4 py-2 text-sm font-medium border-b-2 ${
      isActive
        ? 'border-green-500 text-green-600 dark:text-green-400'
        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
    }`,
    'list-item': `w-full px-6 py-4 text-left transition-all duration-200 ease-out transform hover:scale-[1.02] ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
    }`,
  }

  // Container styles (for withBorder)
  const containerStyles = withBorder
    ? 'rounded-xl border shadow-sm overflow-hidden h-10 flex justify-center align-middle border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
    : ''

  const buttonStyles = `${baseStyles} ${['icon', 'tab', 'list-item'].includes(variant) ? '' : sizeStyles[size]} ${colorStyles[variant]} ${className || ''}`

  const button = (
    <button
      disabled={disabled || isLoading}
      className={buttonStyles}
      {...props}
    >
      {isLoading ? loadingText || 'Loading...' : children}
    </button>
  )

  if (withBorder) {
    return <div className={containerStyles}>{button}</div>
  }

  return button
}
