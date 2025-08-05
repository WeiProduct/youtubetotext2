// External service fallback for YouTube transcript extraction
import axios from 'axios'
import { logStart, logSuccess, logError, logInfo } from './debug-logger'

interface ExternalTranscriptService {
  name: string
  fetchTranscript: (videoId: string) => Promise<string | null>
}

// Method 1: Using downsub.com API (no auth required)
async function fetchFromDownSub(videoId: string): Promise<string | null> {
  try {
    console.log('Trying DownSub service...')
    logInfo('DownSub', 'Attempting to fetch transcript from DownSub service')
    const response = await axios.get(
      `https://downsub.com/?url=https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )
    
    // Extract subtitle URLs from the response
    const match = response.data.match(/subtitle-download-url="([^"]+)"/g)
    if (match && match.length > 0) {
      // Get the first English subtitle URL
      const subtitleUrl = match[0].replace(/subtitle-download-url="|"/g, '')
      
      // Download the subtitle
      const subtitleResponse = await axios.get(subtitleUrl)
      const text = subtitleResponse.data
        .replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, '')
        .replace(/^\d+$/gm, '')
        .replace(/\n{2,}/g, ' ')
        .trim()
      
      logSuccess('DownSub', 'Successfully extracted transcript', { textLength: text.length })
      return text
    }
    logError('DownSub', 'No subtitle URLs found in response')
    return null
  } catch (error) {
    console.error('DownSub failed:', error)
    logError('DownSub', 'Failed to fetch transcript', { error })
    return null
  }
}

// Method 2: Using savesubs.com API
async function fetchFromSaveSubs(videoId: string): Promise<string | null> {
  try {
    console.log('Trying SaveSubs service...')
    logInfo('SaveSubs', 'Attempting to fetch transcript from SaveSubs service')
    const response = await axios.post(
      'https://savesubs.com/action/extract',
      `url=https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )
    
    if (response.data && response.data.subtitles) {
      // Find English subtitles
      const englishSub = response.data.subtitles.find(
        (sub: any) => sub.language === 'English' || sub.language === 'en'
      )
      
      if (englishSub && englishSub.url) {
        const subResponse = await axios.get(englishSub.url)
        logSuccess('SaveSubs', 'Successfully extracted transcript', { textLength: subResponse.data?.length })
        return subResponse.data
      }
      logError('SaveSubs', 'No English subtitles found')
    }
    return null
  } catch (error) {
    console.error('SaveSubs failed:', error)
    logError('SaveSubs', 'Failed to fetch transcript', { error })
    return null
  }
}

// Method 3: Using YouTube's official oEmbed API to check if video exists
async function checkVideoExists(videoId: string): Promise<boolean> {
  try {
    logInfo('checkVideoExists', `Checking if video ${videoId} exists`)
    const response = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    logInfo('checkVideoExists', 'Video exists', { status: response.status })
    return response.status === 200
  } catch {
    logError('checkVideoExists', 'Video not found or is private')
    return false
  }
}

// Method 4: Direct YouTube subtitle URL construction
async function fetchDirectSubtitleUrl(videoId: string): Promise<string | null> {
  try {
    console.log('Trying direct subtitle URL...')
    logInfo('Direct Subtitle URL', 'Attempting to fetch transcript from direct YouTube URLs')
    // Common subtitle URL patterns
    const subtitleUrls = [
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`,
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US&fmt=srv3`,
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=vtt`,
      `https://video.google.com/timedtext?v=${videoId}&lang=en`
    ]
    
    for (const url of subtitleUrls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (response.data) {
          // Parse the subtitle content
          const text = response.data
            .replace(/<[^>]*>/g, '') // Remove HTML/XML tags
            .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/g, '') // Remove timestamps
            .replace(/^\d+$/gm, '') // Remove sequence numbers
            .replace(/\n{2,}/g, ' ') // Replace multiple newlines
            .trim()
          
          if (text.length > 0) {
            logSuccess('Direct Subtitle URL', `Successfully extracted transcript from ${url}`, { textLength: text.length })
            return text
          }
        }
      } catch (e) {
        // Try next URL
        continue
      }
    }
    logError('Direct Subtitle URL', 'All direct URLs failed')
    return null
  } catch (error) {
    console.error('Direct subtitle URL failed:', error)
    logError('Direct Subtitle URL', 'Failed to fetch transcript', { error })
    return null
  }
}

// Main export function that tries all methods
export async function fetchTranscriptExternal(videoId: string): Promise<{
  success: boolean
  text?: string
  method?: string
  error?: string
}> {
  console.log(`Attempting external transcript extraction for video: ${videoId}`)
  logStart('External Services', `Starting external transcript extraction for video: ${videoId}`)
  
  // First check if video exists
  const videoExists = await checkVideoExists(videoId)
  if (!videoExists) {
    return {
      success: false,
      error: 'Video not found or is private'
    }
  }
  
  // Try each external service
  const services: ExternalTranscriptService[] = [
    { name: 'Direct Subtitle URL', fetchTranscript: fetchDirectSubtitleUrl },
    { name: 'DownSub', fetchTranscript: fetchFromDownSub },
    { name: 'SaveSubs', fetchTranscript: fetchFromSaveSubs }
  ]
  
  for (const service of services) {
    try {
      logInfo('External Services', `Trying ${service.name}`)
      const transcript = await service.fetchTranscript(videoId)
      if (transcript && transcript.length > 0) {
        console.log(`Success with ${service.name}!`)
        logSuccess('External Services', `Successfully extracted transcript with ${service.name}`, { 
          method: service.name, 
          textLength: transcript.length 
        })
        return {
          success: true,
          text: transcript,
          method: service.name
        }
      }
    } catch (error) {
      console.error(`${service.name} error:`, error)
      logError('External Services', `${service.name} failed`, { error })
    }
  }
  
  logError('External Services', 'All external services failed to retrieve transcript')
  return {
    success: false,
    error: 'No external service could retrieve the transcript. The video may not have captions available.'
  }
}