import { useEffect, useState } from 'react'

/**
 * Hook for safe rendering after hydration.
 * Prevents hydration mismatches by ensuring component is only rendered after mounting.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const mounted = useMounted()
 *   if (!mounted) return <Placeholder />
 *   return <ActualContent />
 * }
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
