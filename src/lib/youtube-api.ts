import axios from 'axios'
import { logStart, logSuccess, logError, logInfo } from './debug-logger'

interface CaptionTrack {
  baseUrl: string
  vssId: string
  languageCode: string
  name?: { simpleText: string }
  isTranslatable?: boolean
}

export async function getVideoInfo(videoId: string) {
  try {
    logStart('getVideoInfo', `Fetching video info for: ${videoId}`)
    // Method 1: Try noembed API first (no CORS issues)
    const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    const noembedResponse = await axios.get(noembedUrl)
    console.log('Video info from noembed:', noembedResponse.data.title)
    logSuccess('getVideoInfo', 'Successfully fetched video info', {
      title: noembedResponse.data.title,
      author: noembedResponse.data.author_name
    })
    
    return {
      title: noembedResponse.data.title,
      author: noembedResponse.data.author_name,
      thumbnail: noembedResponse.data.thumbnail_url
    }
  } catch (error) {
    console.error('Failed to get video info:', error)
    logError('getVideoInfo', 'Failed to fetch video info', { error })
    return null
  }
}

export async function extractCaptionTracks(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    logStart('extractCaptionTracks', `Extracting caption tracks for: ${videoId}`)
    // Use proxy if running in browser to avoid CORS
    const isServer = typeof window === 'undefined'
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
    logInfo('extractCaptionTracks', `Running in ${isServer ? 'server' : 'browser'} mode`)
    
    let response
    if (isServer) {
      // Direct fetch on server
      logInfo('extractCaptionTracks', 'Fetching YouTube page directly')
      response = await axios.get(youtubeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })
    } else {
      // Use proxy on client
      logInfo('extractCaptionTracks', 'Fetching YouTube page via proxy')
      response = await axios.get(`/api/proxy?url=${encodeURIComponent(youtubeUrl)}`)
    }
    
    logInfo('extractCaptionTracks', 'Page fetched', { 
      status: response.status,
      contentLength: response.data?.length 
    })

    const html = response.data
    
    // Try multiple patterns to find caption data
    const patterns = [
      /"captionTracks":\s*(\[[^\]]+\])/,
      /"playerCaptionsTracklistRenderer":\s*\{"captionTracks":\s*(\[[^\]]+\])/,
      /"captions":\s*\{"playerCaptionsTracklistRenderer":\s*\{"captionTracks":\s*(\[[^\]]+\])/
    ]
    
    logInfo('extractCaptionTracks', 'Searching for caption data patterns')
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        try {
          const tracks = JSON.parse(match[1])
          console.log(`Found ${tracks.length} caption tracks`)
          logSuccess('extractCaptionTracks', `Found ${tracks.length} caption tracks`, {
            tracks: tracks.map((t: any) => ({ lang: t.languageCode, name: t.name?.simpleText }))
          })
          return tracks
        } catch (e) {
          console.error('Failed to parse caption tracks:', e)
          logError('extractCaptionTracks', 'Failed to parse caption JSON', { error: e })
        }
      }
    }
    
    // Alternative: Look for ytInitialPlayerResponse
    logInfo('extractCaptionTracks', 'Trying ytInitialPlayerResponse pattern')
    const ytPlayerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s)
    if (ytPlayerMatch) {
      try {
        const playerData = JSON.parse(ytPlayerMatch[1])
        const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks
        if (captionTracks) {
          console.log(`Found ${captionTracks.length} caption tracks from ytInitialPlayerResponse`)
          logSuccess('extractCaptionTracks', `Found ${captionTracks.length} caption tracks from ytInitialPlayerResponse`, {
            tracks: captionTracks.map((t: any) => ({ lang: t.languageCode, name: t.name?.simpleText }))
          })
          return captionTracks
        } else {
          logInfo('extractCaptionTracks', 'No caption tracks in ytInitialPlayerResponse', {
            hasCaptions: !!playerData?.captions,
            playabilityStatus: playerData?.playabilityStatus?.status
          })
        }
      } catch (e) {
        console.error('Failed to parse ytInitialPlayerResponse:', e)
        logError('extractCaptionTracks', 'Failed to parse ytInitialPlayerResponse', { error: e })
      }
    } else {
      logInfo('extractCaptionTracks', 'ytInitialPlayerResponse not found in page')
    }
    
    logError('extractCaptionTracks', 'No caption tracks found with any pattern')
    return null
  } catch (error) {
    console.error('Failed to extract caption tracks:', error)
    logError('extractCaptionTracks', 'Failed to extract caption tracks', { error })
    throw error
  }
}

export async function fetchCaptionContent(captionUrl: string): Promise<string> {
  try {
    logStart('fetchCaptionContent', 'Fetching caption content from URL')
    // Add format parameter for better compatibility
    const url = new URL(captionUrl)
    url.searchParams.set('fmt', 'srv3') // Request SRV3 format
    logInfo('fetchCaptionContent', 'Caption URL prepared', { url: url.toString() })
    
    const isServer = typeof window === 'undefined'
    let response
    
    if (isServer) {
      // Direct fetch on server
      logInfo('fetchCaptionContent', 'Fetching caption XML directly')
      response = await axios.get(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        }
      })
    } else {
      // Use proxy on client
      logInfo('fetchCaptionContent', 'Fetching caption XML via proxy')
      response = await axios.get(`/api/proxy?url=${encodeURIComponent(url.toString())}`)
    }
    
    logInfo('fetchCaptionContent', 'Caption XML fetched', {
      status: response.status,
      contentLength: response.data?.length
    })
    
    const xmlContent = response.data
    
    // Parse different XML formats
    logInfo('fetchCaptionContent', 'Parsing caption XML', {
      hasTranscriptTag: xmlContent.includes('<transcript>'),
      xmlLength: xmlContent.length
    })
    
    if (xmlContent.includes('<transcript>')) {
      // SRV3 format
      const textMatches = xmlContent.match(/<text[^>]*>([^<]*)<\/text>/g)
      if (textMatches) {
        const result = textMatches
          .map((match: string) => {
            const text = match.replace(/<[^>]*>/g, '')
            return decodeXMLEntities(text)
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        logSuccess('fetchCaptionContent', 'Successfully parsed SRV3 format', {
          textLength: result.length,
          matchCount: textMatches.length
        })
        return result
      }
    } else {
      // Try other formats
      const allTextMatches = xmlContent.match(/>([^<]+)</g)
      if (allTextMatches) {
        const result = allTextMatches
          .map((match: string) => {
            const text = match.slice(1, -1)
            return decodeXMLEntities(text)
          })
          .filter((text: string) => text.trim().length > 0)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        logSuccess('fetchCaptionContent', 'Successfully parsed alternative format', {
          textLength: result.length,
          matchCount: allTextMatches.length
        })
        return result
      }
    }
    
    logError('fetchCaptionContent', 'Could not parse caption content', {
      xmlSnippet: xmlContent.substring(0, 200)
    })
    throw new Error('Could not parse caption content')
  } catch (error) {
    console.error('Failed to fetch caption content:', error)
    logError('fetchCaptionContent', 'Failed to fetch caption content', { error })
    throw error
  }
}

function decodeXMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
}