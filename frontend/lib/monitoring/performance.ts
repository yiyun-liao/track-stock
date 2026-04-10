/**
 * Performance Monitoring Tool
 *
 * Tracks:
 * - API response times
 * - Duplicate API calls
 * - Component render counts
 *
 * Usage:
 * ```
 * import { trackApiCall, getPerformanceReport } from '@/lib/monitoring/performance'
 *
 * const startTime = performance.now()
 * const response = await apiClient.getStocks()
 * trackApiCall('GET /api/stocks', performance.now() - startTime)
 * ```
 */

interface ApiCall {
  endpoint: string
  method: string
  duration: number
  timestamp: number
  status: 'success' | 'error'
}

interface PerformanceMetrics {
  apiCalls: ApiCall[]
  slowApiThreshold: number // ms
  duplicateCallWindow: number // ms
}

const metrics: PerformanceMetrics = {
  apiCalls: [],
  slowApiThreshold: 2000, // 2 seconds
  duplicateCallWindow: 1000, // 1 second
}

/**
 * Track an API call
 */
export function trackApiCall(
  endpoint: string,
  duration: number,
  status: 'success' | 'error' = 'success'
) {
  const now = performance.now()

  const call: ApiCall = {
    endpoint,
    method: endpoint.split(' ')[0],
    duration,
    timestamp: now,
    status,
  }

  metrics.apiCalls.push(call)

  // Warn if API is slow
  if (duration > metrics.slowApiThreshold) {
    console.warn(
      `⚠️  Slow API: ${endpoint} took ${duration.toFixed(0)}ms (threshold: ${metrics.slowApiThreshold}ms)`
    )
  }

  // Warn if duplicate call detected
  checkDuplicateCall(endpoint, now)
}

/**
 * Check if same endpoint was called recently (possible duplicate)
 */
function checkDuplicateCall(endpoint: string, now: number) {
  const recentCalls = metrics.apiCalls.filter(
    (call) =>
      call.endpoint === endpoint &&
      now - call.timestamp < metrics.duplicateCallWindow
  )

  if (recentCalls.length > 1) {
    console.warn(
      `⚠️  Possible Duplicate Call: ${endpoint} called ${recentCalls.length} times in ${metrics.duplicateCallWindow}ms`
    )
  }
}

/**
 * Get performance report
 */
export function getPerformanceReport() {
  const now = performance.now()
  const recentCalls = metrics.apiCalls.filter(
    (call) => now - call.timestamp < 60000 // Last 60 seconds
  )

  const slowCalls = recentCalls.filter(
    (call) => call.duration > metrics.slowApiThreshold
  )

  const avgDuration =
    recentCalls.length > 0
      ? recentCalls.reduce((sum, call) => sum + call.duration, 0) / recentCalls.length
      : 0

  const callsByEndpoint: Record<string, number> = {}
  recentCalls.forEach((call) => {
    callsByEndpoint[call.endpoint] = (callsByEndpoint[call.endpoint] || 0) + 1
  })

  return {
    totalCalls: recentCalls.length,
    averageDuration: avgDuration.toFixed(0),
    slowCalls: slowCalls.length,
    callsByEndpoint,
    lastUpdated: new Date().toLocaleTimeString(),
  }
}

/**
 * Reset performance metrics
 */
export function resetMetrics() {
  metrics.apiCalls = []
}

/**
 * Set thresholds
 */
export function setThresholds(
  slowApiThreshold?: number,
  duplicateCallWindow?: number
) {
  if (slowApiThreshold) metrics.slowApiThreshold = slowApiThreshold
  if (duplicateCallWindow) metrics.duplicateCallWindow = duplicateCallWindow
}
