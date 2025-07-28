'use client'

import { useDebug } from '@/lib/debug-context'
import { useState, useEffect } from 'react'

export default function DebugPanel() {
  const { logs, clearLogs, isDebugVisible, toggleDebug } = useDebug()
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Add keyboard shortcut (Ctrl/Cmd + D)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        toggleDebug()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleDebug])
  
  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEBUG_MODE !== 'true') {
    return null
  }

  if (!isDebugVisible) {
    return (
      <button
        onClick={toggleDebug}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all group"
        title="Show Debug Panel (Ctrl/Cmd + D)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Debug Console (⌘D)
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h3 className="font-semibold">Debug Console</h3>
          <span className="text-xs text-gray-400">({logs.length} logs)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="text-gray-400 hover:text-white p-1"
            title="Clear logs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white p-1"
          >
            <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={toggleDebug}
            className="text-gray-400 hover:text-white p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Logs */}
      {isExpanded && (
        <div className="overflow-y-auto max-h-[500px] p-3 space-y-2 text-sm font-mono">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No debug logs yet</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded border ${
                  log.type === 'error'
                    ? 'bg-red-900/20 border-red-800 text-red-200'
                    : log.type === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-800 text-yellow-200'
                    : log.type === 'success'
                    ? 'bg-green-900/20 border-green-800 text-green-200'
                    : 'bg-gray-800 border-gray-700 text-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        log.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs">{log.message}</div>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                          Details
                        </summary>
                        <pre className="mt-1 text-xs overflow-x-auto p-2 bg-black/30 rounded">
                          {typeof log.details === 'object' 
                            ? JSON.stringify(log.details, null, 2)
                            : log.details}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}