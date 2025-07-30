'use client'

import React, { useState } from 'react'

interface ManualSubtitleInputProps {
  onSubmit: (text: string) => void
}

export default function ManualSubtitleInput({ onSubmit }: ManualSubtitleInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [subtitleUrl, setSubtitleUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async () => {
    if (!subtitleUrl.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      // Use our proxy to fetch the subtitle
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(subtitleUrl)}`)
      const text = await response.text()
      
      // Basic cleaning of subtitle formats
      const cleanedText = text
        .replace(/\d{2}:\d{2}:\d{2}[,.]\d{3} --> \d{2}:\d{2}:\d{2}[,.]\d{3}/g, '') // SRT timestamps
        .replace(/^\d+$/gm, '') // Line numbers
        .replace(/<[^>]*>/g, '') // XML/HTML tags
        .replace(/WEBVTT\s*/g, '') // WebVTT header
        .replace(/\n{3,}/g, '\n\n') // Multiple newlines
        .trim()
      
      if (cleanedText.length > 0) {
        onSubmit(cleanedText)
        setIsOpen(false)
        setSubtitleUrl('')
      } else {
        setError('Could not parse subtitle content')
      }
    } catch (err) {
      setError('Failed to fetch subtitle file')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        Manually input subtitle URL
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Manual Subtitle Input</h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              If automatic extraction fails, you can manually provide a subtitle file URL (.srt, .vtt, or .xml format)
            </p>
            
            <input
              type="url"
              value={subtitleUrl}
              onChange={(e) => setSubtitleUrl(e.target.value)}
              placeholder="https://example.com/subtitles.srt"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              disabled={loading}
            />
            
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !subtitleUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load Subtitle'}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setError('')
                  setSubtitleUrl('')
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
            
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">How to find subtitle URLs</summary>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>1. Open YouTube video → Settings → Subtitles → View all</p>
                <p>2. Right-click on subtitle language → Copy link address</p>
                <p>3. Or use browser developer tools (F12) → Network tab → Look for "timedtext" requests</p>
              </div>
            </details>
          </div>
        </div>
      )}
    </>
  )
}