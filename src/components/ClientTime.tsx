'use client'

import React, { useState, useEffect } from 'react'

export default function ClientTime() {
  const [time, setTime] = useState<string>('')
  
  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
    
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!time) {
    return <span>Loading...</span>
  }
  
  return <span>{time}</span>
}