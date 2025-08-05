'use client'

import React, { useState } from 'react'
import TranscriptDisplay from '@/components/TranscriptDisplay'
import URLInput from '@/components/URLInput'
import ManualSubtitleInput from '@/components/ManualSubtitleInput'
import ClientTime from '@/components/ClientTime'
import { useDebug } from '@/lib/debug-context'

export default function Home() {
  const [transcript, setTranscript] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const { addLog } = useDebug()
  
  // Add initial log to confirm debug panel is working
  React.useEffect(() => {
    addLog('info', 'YouTube to Text app loaded successfully', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  }, [addLog])

  const handleExtractTranscript = async (url: string) => {
    console.log('Starting extraction for:', url)
    setLoading(true)
    setError('')
    setVideoUrl(url)
    setTranscript('') // Clear previous transcript
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      const data = await response.json()
      console.log('API Response:', data)

      // Log debug information if available
      if (data.debugLogs && Array.isArray(data.debugLogs)) {
        console.log('=== Debug Logs from Extraction ===')
        data.debugLogs.forEach((log: any) => {
          const emoji = {
            start: '🔵',
            success: '✅',
            error: '❌',
            info: 'ℹ️'
          }[log.status] || '📝'
          console.log(`${emoji} [${log.method}] ${log.message}`, log.details || '')
        })
        console.log('=== End Debug Logs ===')
      }

      if (!response.ok) {
        // Include debug steps in error if available
        let errorMsg = data.error || 'Failed to extract transcript'
        if (data.debug && data.debug.steps) {
          console.log('Debug steps:', data.debug.steps)
        }
        throw new Error(errorMsg)
      }

      if (data.transcript) {
        setTranscript(data.transcript)
      } else {
        throw new Error('No transcript data received')
      }
    } catch (err) {
      console.error('Extraction error:', err)
      let errorMessage = 'An error occurred'
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out after 30 seconds'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Version indicator for debugging */}
      <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
        v3.2.2 - Build {new Date().toISOString().split('T')[0]}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            YouTube to Text
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Extract transcripts from YouTube videos instantly
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Press Ctrl/Cmd + D to toggle debug panel
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <URLInput 
            onSubmit={handleExtractTranscript}
            loading={loading}
          />

          {loading && (
            <div className="mt-8 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300">Extracting transcript...</p>
            </div>
          )}

          {error && !loading && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                  {error.includes('captions') && (
                    <div className="mt-3">
                      <p className="text-red-500 dark:text-red-300 text-xs">
                        Tip: Try a different video or <ManualSubtitleInput onSubmit={(text) => {
                          setTranscript(text)
                          setError('')
                        }} />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {transcript && !loading && (
            <TranscriptDisplay 
              transcript={transcript}
              videoUrl={videoUrl}
            />
          )}
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Only works with videos that have captions enabled</p>
        </footer>
      </div>
      
      {/* Inline Debug Panel - Always Visible */}
      <div className="fixed bottom-4 right-4 w-96 max-h-[500px] bg-black/95 text-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="bg-gray-800 p-3 rounded-t-lg flex justify-between items-center">
          <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
            <span className="animate-pulse">🔴</span> Debug Console
          </h3>
          <button 
            onClick={() => window.location.reload()} 
            className="text-gray-400 hover:text-white text-xs"
          >
            Refresh
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-2 text-xs font-mono overflow-y-auto max-h-[400px]">
          {/* Status */}
          <div className="p-2 bg-blue-900/50 rounded border border-blue-700/50">
            <div className="text-blue-400 font-bold">📊 STATUS</div>
            <div className="text-blue-200 mt-1">
              App Version: v3.2.2<br/>
              Environment: Production<br/>
              Debug Mode: Enabled<br/>
              Time: <ClientTime />
            </div>
          </div>
          
          {/* Current State */}
          <div className="p-2 bg-purple-900/50 rounded border border-purple-700/50">
            <div className="text-purple-400 font-bold">🔍 CURRENT STATE</div>
            <div className="text-purple-200 mt-1">
              Loading: {loading ? 'Yes' : 'No'}<br/>
              Has Error: {error ? 'Yes' : 'No'}<br/>
              Has Transcript: {transcript ? 'Yes' : 'No'}<br/>
              URL Entered: {videoUrl ? 'Yes' : 'No'}
            </div>
          </div>
          
          {/* URL Info */}
          {videoUrl && (
            <div className="p-2 bg-green-900/50 rounded border border-green-700/50">
              <div className="text-green-400 font-bold">🔗 URL INFO</div>
              <div className="text-green-200 mt-1 break-all">
                {videoUrl}<br/>
                Video ID: {videoUrl.match(/v=([^&]+)/)?.[1] || 'Unknown'}
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="p-2 bg-yellow-900/50 rounded border border-yellow-700/50">
              <div className="text-yellow-400 font-bold animate-pulse">⏳ LOADING</div>
              <div className="text-yellow-200 mt-1">
                Extracting transcript...<br/>
                This may take a few seconds
              </div>
            </div>
          )}
          
          {/* Error Details */}
          {error && (
            <div className="p-2 bg-red-900/50 rounded border border-red-700/50">
              <div className="text-red-400 font-bold">❌ ERROR DETAILS</div>
              <div className="text-red-200 mt-1 whitespace-pre-wrap">
                {error}
              </div>
              {!error.includes('Attempt details:') && (
                <div className="text-red-300 text-xs mt-2">
                  Tip: Make sure the video has captions/CC enabled
                </div>
              )}
            </div>
          )}
          
          {/* Success */}
          {transcript && !loading && (
            <div className="p-2 bg-green-900/50 rounded border border-green-700/50">
              <div className="text-green-400 font-bold">✅ SUCCESS</div>
              <div className="text-green-200 mt-1">
                Transcript extracted!<br/>
                Length: {transcript.length} characters
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="p-2 bg-gray-800 rounded border border-gray-700">
            <div className="text-gray-400 font-bold">ℹ️ INFO</div>
            <div className="text-gray-300 mt-1">
              This debug panel shows real-time app state.<br/>
              Original debug panel (Ctrl+D) seems to be not loading.
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}