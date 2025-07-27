'use client'

import { useState } from 'react'

interface TranscriptDisplayProps {
  transcript: string
  videoUrl: string
}

export default function TranscriptDisplay({ transcript, videoUrl }: TranscriptDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtube-transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Transcript
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg
                     transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
                     transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Source: <a href={videoUrl} target="_blank" rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline">
              {videoUrl}
            </a>
          </p>
        </div>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-normal">
            {transcript}
          </pre>
        </div>
      </div>
    </div>
  )
}