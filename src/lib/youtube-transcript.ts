import { YoutubeTranscript } from 'youtube-transcript'
import axios from 'axios'

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
  try {
    // First try using the youtube-transcript library
    const transcript = await fetchWithYoutubeTranscript(videoId, includeTimestamps)
    if (transcript) return transcript

    // Fallback to alternative method
    const alternativeTranscript = await fetchWithAlternativeMethod(videoId)
    if (alternativeTranscript) return { text: alternativeTranscript }

    throw new Error('No transcript available')
  } catch (error) {
    console.error('Error fetching transcript:', error)
    if (error instanceof Error && error.message.includes('Transcript is disabled')) {
      throw new Error('This video does not have captions enabled.')
    }
    if (error instanceof Error && error.message.includes('Could not find')) {
      throw new Error('This video is not available or does not exist.')
    }
    throw new Error('Unable to retrieve transcript for this video. It may not have captions available.')
  }
}

async function fetchWithYoutubeTranscript(videoId: string, includeTimestamps: boolean): Promise<TranscriptResult | null> {
  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)
    
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
    return null
  }
}

async function fetchWithAlternativeMethod(videoId: string): Promise<string | null> {
  try {
    // Alternative method using direct API call
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    })

    const html = response.data

    // Try to extract captions from the page data
    const ytInitialPlayerResponse = html.match(/var ytInitialPlayerResponse = ({.+?});/s)
    if (!ytInitialPlayerResponse) return null

    const playerData = JSON.parse(ytInitialPlayerResponse[1])
    const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks

    if (!captionTracks || captionTracks.length === 0) {
      return null
    }

    // Get the first available caption track (prefer English)
    const track = captionTracks.find((t: any) => t.languageCode === 'en') || captionTracks[0]
    
    // Fetch the actual captions
    const captionResponse = await axios.get(track.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    // Parse the XML response and extract text
    const captionText = captionResponse.data
      .replace(/<text[^>]*start="[\d.]+" dur="[\d.]+"[^>]*>/g, '')
      .replace(/<\/text>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()

    return captionText
  } catch (error) {
    console.error('Alternative method failed:', error)
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