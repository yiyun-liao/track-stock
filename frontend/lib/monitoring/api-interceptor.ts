/**
 * API Interceptor for Automatic Performance Tracking
 *
 * Wraps axios interceptors to automatically track:
 * - All API call durations
 * - Response times
 * - Duplicate calls
 * - Errors
 */

import { AxiosError, AxiosInstance } from 'axios'
import { trackApiCall } from './performance'

interface RequestMetadata {
  startTime: number
  endpoint: string
}

const requestMetadata = new WeakMap<any, RequestMetadata>()

/**
 * Setup API interceptors for automatic performance tracking
 */
export function setupApiInterceptors(axiosInstance: AxiosInstance) {
  // Request interceptor - capture start time
  axiosInstance.interceptors.request.use((config) => {
    const metadata: RequestMetadata = {
      startTime: performance.now(),
      endpoint: `${config.method?.toUpperCase()} ${config.url}`,
    }

    // Store metadata in config object
    ;(config as any).__metadata = metadata

    return config
  })

  // Response interceptor - track success
  axiosInstance.interceptors.response.use(
    (response) => {
      const metadata = (response.config as any).__metadata as RequestMetadata | undefined

      if (metadata) {
        const duration = performance.now() - metadata.startTime
        trackApiCall(metadata.endpoint, duration, 'success')
      }

      return response
    },
    (error: AxiosError) => {
      const config = error.config as any
      const metadata = config?.__metadata as RequestMetadata | undefined

      if (metadata) {
        const duration = performance.now() - metadata.startTime
        trackApiCall(metadata.endpoint, duration, 'error')

        // Log error with context
        console.error(
          `❌ API Error: ${metadata.endpoint} (${duration.toFixed(0)}ms)`,
          error.response?.status,
          error.message
        )
      }

      return Promise.reject(error)
    }
  )
}

/**
 * Console command to get performance report in DevTools
 *
 * Usage in browser console:
 * ```
 * window.getPerformanceReport()
 * ```
 */
export function exposePerformanceUtils() {
  const { getPerformanceReport, resetMetrics } = require('./performance')

  ;(window as any).getPerformanceReport = () => {
    const report = getPerformanceReport()
    console.table(report.callsByEndpoint)
    console.log('📊 Performance Report:', report)
    return report
  }

  ;(window as any).resetMetrics = () => {
    resetMetrics()
    console.log('✅ Metrics reset')
  }
}
