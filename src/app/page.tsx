'use client'

import { useState } from 'react'
import TranscriptDisplay from '@/components/TranscriptDisplay'
import URLInput from '@/components/URLInput'

export default function Home() {
  const [transcript, setTranscript] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [videoUrl, setVideoUrl] = useState<string>('')

  const handleExtractTranscript = async (url: string) => {
    setLoading(true)
    setError('')
    setVideoUrl(url)
    
    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract transcript')
      }

      setTranscript(data.transcript)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            YouTube to Text
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Extract transcripts from YouTube videos instantly
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
                <div>
                  <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                  {error.includes('captions') && (
                    <p className="text-red-500 dark:text-red-300 text-xs mt-2">
                      Tip: Try a different video that has captions/subtitles enabled.
                    </p>
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
    </main>
  )
}