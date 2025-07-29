import axios from 'axios'

interface CaptionTrack {
  baseUrl: string
  vssId: string
  languageCode: string
  name?: { simpleText: string }
  isTranslatable?: boolean
}

export async function getVideoInfo(videoId: string) {
  try {
    // Method 1: Try noembed API first (no CORS issues)
    const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    const noembedResponse = await axios.get(noembedUrl)
    console.log('Video info from noembed:', noembedResponse.data.title)
    
    return {
      title: noembedResponse.data.title,
      author: noembedResponse.data.author_name,
      thumbnail: noembedResponse.data.thumbnail_url
    }
  } catch (error) {
    console.error('Failed to get video info:', error)
    return null
  }
}

export async function extractCaptionTracks(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    // Use proxy if running in browser to avoid CORS
    const isServer = typeof window === 'undefined'
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
    
    let response
    if (isServer) {
      // Direct fetch on server
      response = await axios.get(youtubeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })
    } else {
      // Use proxy on client
      response = await axios.get(`/api/proxy?url=${encodeURIComponent(youtubeUrl)}`)
    }

    const html = response.data
    
    // Try multiple patterns to find caption data
    const patterns = [
      /"captionTracks":\s*(\[[^\]]+\])/,
      /"playerCaptionsTracklistRenderer":\s*\{"captionTracks":\s*(\[[^\]]+\])/,
      /"captions":\s*\{"playerCaptionsTracklistRenderer":\s*\{"captionTracks":\s*(\[[^\]]+\])/
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        try {
          const tracks = JSON.parse(match[1])
          console.log(`Found ${tracks.length} caption tracks`)
          return tracks
        } catch (e) {
          console.error('Failed to parse caption tracks:', e)
        }
      }
    }
    
    // Alternative: Look for ytInitialPlayerResponse
    const ytPlayerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s)
    if (ytPlayerMatch) {
      try {
        const playerData = JSON.parse(ytPlayerMatch[1])
        const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks
        if (captionTracks) {
          console.log(`Found ${captionTracks.length} caption tracks from ytInitialPlayerResponse`)
          return captionTracks
        }
      } catch (e) {
        console.error('Failed to parse ytInitialPlayerResponse:', e)
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to extract caption tracks:', error)
    throw error
  }
}

export async function fetchCaptionContent(captionUrl: string): Promise<string> {
  try {
    // Add format parameter for better compatibility
    const url = new URL(captionUrl)
    url.searchParams.set('fmt', 'srv3') // Request SRV3 format
    
    const isServer = typeof window === 'undefined'
    let response
    
    if (isServer) {
      // Direct fetch on server
      response = await axios.get(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        }
      })
    } else {
      // Use proxy on client
      response = await axios.get(`/api/proxy?url=${encodeURIComponent(url.toString())}`)
    }
    
    const xmlContent = response.data
    
    // Parse different XML formats
    if (xmlContent.includes('<transcript>')) {
      // SRV3 format
      const textMatches = xmlContent.match(/<text[^>]*>([^<]*)<\/text>/g)
      if (textMatches) {
        return textMatches
          .map((match: string) => {
            const text = match.replace(/<[^>]*>/g, '')
            return decodeXMLEntities(text)
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
    } else {
      // Try other formats
      const allTextMatches = xmlContent.match(/>([^<]+)</g)
      if (allTextMatches) {
        return allTextMatches
          .map((match: string) => {
            const text = match.slice(1, -1)
            return decodeXMLEntities(text)
          })
          .filter((text: string) => text.trim().length > 0)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
    }
    
    throw new Error('Could not parse caption content')
  } catch (error) {
    console.error('Failed to fetch caption content:', error)
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