import { YoutubeTranscript } from 'youtube-transcript'
import axios from 'axios'
import { extractCaptionTracks, fetchCaptionContent, getVideoInfo } from './youtube-api'
import { fetchTranscriptExternal } from './youtube-external'
import { getTranscriptViaInnerTube } from './youtube-innertube'
import { getSubtitlesDirectly, detectVideoLanguage } from './youtube-direct'
import { logStart, logSuccess, logError, logInfo, debugLogger, getDebugReport } from './debug-logger'

export interface TranscriptSegment {
  text: string
  duration: number
  offset: number
}

export interface TranscriptResult {
  text: string
  segments?: TranscriptSegment[]
  language?: string
}

export async function getYouTubeTranscript(videoId: string, includeTimestamps: boolean = false): Promise<TranscriptResult> {
  const attemptLogs: string[] = []
  const errors: string[] = []
  
  // Clear previous logs and start fresh
  debugLogger.clearLogs()
  logStart('getYouTubeTranscript', `Starting transcript extraction for video: ${videoId}`, { videoId, includeTimestamps })
  
  try {
    // PRIORITY 1: InnerTube API (most reliable)
    attemptLogs.push('Attempting YouTube InnerTube API...')
    logStart('InnerTube API', 'Attempting to extract transcript via InnerTube API')
    try {
      const innerTubeTranscript = await getTranscriptViaInnerTube(videoId)
      if (innerTubeTranscript) {
        attemptLogs.push('✓ Success with InnerTube API')
        logSuccess('InnerTube API', 'Successfully extracted transcript', { textLength: innerTubeTranscript.length })
        console.log('Transcript extraction attempts:', attemptLogs)
        return { text: innerTubeTranscript }
      } else {
        attemptLogs.push('✗ InnerTube API returned no transcript')
        errors.push('InnerTube API: No transcript found')
        logError('InnerTube API', 'No transcript found in response')
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      errors.push(`InnerTube API: ${errMsg}`)
      attemptLogs.push(`✗ InnerTube API failed: ${errMsg}`)
      logError('InnerTube API', `Failed with error: ${errMsg}`, { error: e })
    }
    
    // PRIORITY 2: Try youtube-transcript library
    attemptLogs.push('Attempting youtube-transcript library...')
    logStart('youtube-transcript', 'Attempting to extract transcript via youtube-transcript library')
    try {
      const transcript = await fetchWithYoutubeTranscript(videoId, includeTimestamps)
      if (transcript) {
        attemptLogs.push('✓ Success with youtube-transcript library')
        logSuccess('youtube-transcript', 'Successfully extracted transcript', { textLength: transcript.text.length, hasSegments: !!transcript.segments })
        console.log('Transcript extraction attempts:', attemptLogs)
        return transcript
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      errors.push(`youtube-transcript: ${errMsg}`)
      attemptLogs.push(`✗ youtube-transcript failed: ${errMsg}`)
      logError('youtube-transcript', `Failed with error: ${errMsg}`, { error: e })
    }

    // Fallback to alternative method
    attemptLogs.push('Attempting alternative scraping method...')
    logStart('Alternative Method', 'Attempting to extract transcript via alternative scraping')
    try {
      const alternativeTranscript = await fetchWithAlternativeMethod(videoId)
      if (alternativeTranscript) {
        attemptLogs.push('✓ Success with alternative method')
        logSuccess('Alternative Method', 'Successfully extracted transcript', { textLength: alternativeTranscript.length })
        console.log('Transcript extraction attempts:', attemptLogs)
        return { text: alternativeTranscript }
      } else {
        attemptLogs.push('✗ Alternative method returned no transcript')
        errors.push('Alternative method: No transcript found')
        logError('Alternative Method', 'No transcript found')
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      errors.push(`Alternative method: ${errMsg}`)
      attemptLogs.push(`✗ Alternative method failed: ${errMsg}`)
      logError('Alternative Method', `Failed with error: ${errMsg}`, { error: e })
    }

    // Try direct URL method as last resort (not working reliably)
    attemptLogs.push('Attempting direct URL subtitle extraction...')
    logStart('Direct URL', 'Attempting to extract transcript via direct URL')
    try {
      // Try to detect video language first
      const detectedLang = await detectVideoLanguage(videoId)
      attemptLogs.push(`Detected language: ${detectedLang}`)
      logInfo('Direct URL', `Detected video language: ${detectedLang}`)
      
      // Try direct URL method with detected language
      const directSubtitles = await getSubtitlesDirectly(videoId, detectedLang)
      if (directSubtitles) {
        attemptLogs.push('✓ Success with direct URL method!')
        logSuccess('Direct URL', 'Successfully extracted transcript', { textLength: directSubtitles.length, language: detectedLang })
        console.log('Transcript extraction attempts:', attemptLogs)
        return { text: directSubtitles }
      }
      
      // If detected language failed, try English as fallback
      if (detectedLang !== 'en') {
        logInfo('Direct URL', 'Trying English as fallback language')
        const englishSubtitles = await getSubtitlesDirectly(videoId, 'en')
        if (englishSubtitles) {
          attemptLogs.push('✓ Success with direct URL method (English fallback)!')
          logSuccess('Direct URL', 'Successfully extracted transcript with English fallback', { textLength: englishSubtitles.length })
          console.log('Transcript extraction attempts:', attemptLogs)
          return { text: englishSubtitles }
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      errors.push(`Direct URL: ${errMsg}`)
      attemptLogs.push(`✗ Direct URL method failed: ${errMsg}`)
      logError('Direct URL', `Failed with error: ${errMsg}`, { error: e })
    }

    // Fallback to external services
    attemptLogs.push('Attempting external transcript services...')
    logStart('External Services', 'Attempting to extract transcript via external services')
    try {
      const externalResult = await fetchTranscriptExternal(videoId)
      if (externalResult.success && externalResult.text) {
        attemptLogs.push(`✓ Success with external service: ${externalResult.method}`)
        logSuccess('External Services', `Successfully extracted transcript via ${externalResult.method}`, { textLength: externalResult.text.length, method: externalResult.method })
        console.log('Transcript extraction attempts:', attemptLogs)
        return { text: externalResult.text }
      } else {
        const errMsg = externalResult.error || 'No transcript found'
        errors.push(`External services: ${errMsg}`)
        attemptLogs.push(`✗ External services failed: ${errMsg}`)
        logError('External Services', `Failed: ${errMsg}`, { error: externalResult.error })
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      errors.push(`External services: ${errMsg}`)
      attemptLogs.push(`✗ External services failed: ${errMsg}`)
      logError('External Services', `Failed with error: ${errMsg}`, { error: e })
    }

    // Detailed error message with all attempts
    const debugReport = getDebugReport()
    const detailedError = [
      'Failed to extract transcript after trying all methods.',
      '',
      'Attempt details:',
      ...attemptLogs.map(log => `  ${log}`),
      '',
      'Errors encountered:',
      ...errors.map(e => `  • ${e}`),
      '',
      'Video ID: ' + videoId,
      'Video URL: https://www.youtube.com/watch?v=' + videoId,
      '',
      'Make sure the video has captions/subtitles enabled.',
      'Some videos may have region-restricted captions or require authentication.',
      '',
      '=== Debug Report ===',
      debugReport
    ].join('\n')
    
    logError('getYouTubeTranscript', 'All extraction methods failed', { videoId, errors })
    throw new Error(detailedError)
  } catch (error) {
    console.error('Error fetching transcript:', error)
    console.error('Attempt history:', attemptLogs)
    
    // If it's already our detailed error, throw it as is
    if (error instanceof Error && error.message.includes('Attempt details:')) {
      throw error
    }
    
    // Otherwise, try to parse specific errors
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      if (errorMsg.includes('disabled') || errorMsg.includes('unavailable')) {
        throw new Error('This video does not have captions enabled. Please try a video with CC/subtitles.')
      }
      if (errorMsg.includes('not found') || errorMsg.includes('invalid')) {
        throw new Error('This video could not be found. Please check the URL.')
      }
      if (errorMsg.includes('private')) {
        throw new Error('This video is private or age-restricted.')
      }
    }
    throw error
  }
}

async function fetchWithYoutubeTranscript(videoId: string, includeTimestamps: boolean): Promise<TranscriptResult | null> {
  try {
    // Try different methods to get transcript
    let transcriptData: any[] = []
    
    try {
      // Method 1: Direct fetch
      transcriptData = await YoutubeTranscript.fetchTranscript(videoId)
    } catch (e1) {
      console.log('Method 1 failed, trying alternative...')
      
      try {
        // Method 2: With language preference
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'en'
        })
      } catch (e2) {
        console.log('Method 2 failed, trying any language...')
        
        // Method 3: Get any available language
        const transcriptList = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: undefined
        })
        if (transcriptList && transcriptList.length > 0) {
          transcriptData = transcriptList
        }
      }
    }
    
    if (!transcriptData || transcriptData.length === 0) {
      return null
    }

    // Combine all transcript segments into a single text
    const fullTranscript = transcriptData
      .map((segment: any) => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    const result: TranscriptResult = {
      text: fullTranscript
    }

    if (includeTimestamps) {
      result.segments = transcriptData.map((segment: any) => ({
        text: segment.text,
        duration: segment.duration || 0,
        offset: segment.offset || 0
      }))
    }

    return result
  } catch (error) {
    console.error('youtube-transcript library failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return null
  }
}


async function fetchWithAlternativeMethod(videoId: string): Promise<string | null> {
  try {
    console.log(`Alternative method: Attempting to extract captions for video ${videoId}`)
    
    // First try to get video info
    const videoInfo = await getVideoInfo(videoId)
    if (videoInfo) {
      console.log('Video info retrieved:', videoInfo.title)
    }
    
    // Use our new robust extraction method
    const captionTracks = await extractCaptionTracks(videoId)
    
    if (!captionTracks || captionTracks.length === 0) {
      console.log('No caption tracks found')
      return null
    }
    
    console.log(`Found ${captionTracks.length} caption tracks`)
    
    // Prefer English tracks, but fallback to any available
    const track = captionTracks.find((t: any) => 
      t.languageCode === 'en' || 
      t.languageCode === 'en-US' || 
      t.languageCode === 'en-GB'
    ) || captionTracks[0]
    
    console.log(`Using caption track: ${track.languageCode} - ${track.name?.simpleText || 'Default'}`)
    
    // Fetch the actual caption content
    const captionText = await fetchCaptionContent(track.baseUrl)
    
    if (captionText) {
      console.log(`Successfully extracted ${captionText.length} characters of caption text`)
      return captionText
    }
    
    return null
  } catch (error) {
    console.error('Alternative method failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }
    return null
  }
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}