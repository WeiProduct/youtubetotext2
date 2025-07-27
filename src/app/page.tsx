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

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {transcript && !loading && (
            <TranscriptDisplay 
              transcript={transcript}
              videoUrl={videoUrl}
            />
          )}
        </div>
      </div>
    </main>
  )
}