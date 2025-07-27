'use client'

import { useState } from 'react'

interface URLInputProps {
  onSubmit: (url: string) => void
  loading: boolean
}

export default function URLInput({ onSubmit, loading }: URLInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                     text-white font-semibold rounded-lg transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Extract Text'
          )}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Supports youtube.com and youtu.be URLs
      </p>
    </form>
  )
}