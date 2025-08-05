// Debug logger utility for tracking extraction progress
export interface DebugLog {
  timestamp: string
  method: string
  status: 'start' | 'success' | 'error' | 'info'
  message: string
  details?: any
}

class DebugLogger {
  private logs: DebugLog[] = []
  private enabled: boolean = true

  log(method: string, status: DebugLog['status'], message: string, details?: any) {
    if (!this.enabled) return

    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      method,
      status,
      message,
      details
    }

    this.logs.push(log)

    // Also log to console with formatting
    const emoji = {
      start: '🔵',
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    }[status]

    console.log(`${emoji} [${method}] ${message}`, details || '')
  }

  getLogs(): DebugLog[] {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }
}

// Global instance
export const debugLogger = new DebugLogger()

// Convenience methods
export function logStart(method: string, message: string, details?: any) {
  debugLogger.log(method, 'start', message, details)
}

export function logSuccess(method: string, message: string, details?: any) {
  debugLogger.log(method, 'success', message, details)
}

export function logError(method: string, message: string, details?: any) {
  debugLogger.log(method, 'error', message, details)
}

export function logInfo(method: string, message: string, details?: any) {
  debugLogger.log(method, 'info', message, details)
}

// Format logs for response
export function getDebugReport(): string {
  const logs = debugLogger.getLogs()
  return logs.map(log => {
    const time = new Date(log.timestamp).toLocaleTimeString()
    return `[${log.status.toUpperCase()}] ${time} - ${log.method}: ${log.message}${log.details ? '\n  Details: ' + JSON.stringify(log.details, null, 2) : ''}`
  }).join('\n')
}