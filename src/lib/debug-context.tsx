'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface DebugLog {
  id: string
  timestamp: Date
  type: 'info' | 'error' | 'warning' | 'success'
  message: string
  details?: any
}

interface DebugContextType {
  logs: DebugLog[]
  addLog: (type: DebugLog['type'], message: string, details?: any) => void
  clearLogs: () => void
  isDebugVisible: boolean
  toggleDebug: () => void
}

const DebugContext = createContext<DebugContextType | undefined>(undefined)

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isDebugVisible, setIsDebugVisible] = useState(false)

  const addLog = useCallback((type: DebugLog['type'], message: string, details?: any) => {
    const newLog: DebugLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    }
    
    setLogs(prev => [...prev, newLog].slice(-50)) // Keep last 50 logs
    
    // Also log to console
    const consoleMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'
    console[consoleMethod](`[${type.toUpperCase()}]`, message, details || '')
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const toggleDebug = useCallback(() => {
    setIsDebugVisible(prev => !prev)
  }, [])

  return (
    <DebugContext.Provider value={{ logs, addLog, clearLogs, isDebugVisible, toggleDebug }}>
      {children}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  const context = useContext(DebugContext)
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider')
  }
  return context
}