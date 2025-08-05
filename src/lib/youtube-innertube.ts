// YouTube InnerTube API - Direct API access
import axios from 'axios'

const INNERTUBE_API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8' // Public API key from YouTube
const INNERTUBE_CLIENT_VERSION = '2.20240726.00.00' // Updated version

interface InnerTubeConfig {
  key: string
  clientName: string
  clientVersion: string
}

const INNERTUBE_CLIENTS = {
  WEB_EMBEDDED: {
    key: INNERTUBE_API_KEY,
    clientName: 'WEB_EMBEDDED_PLAYER',
    clientVersion: INNERTUBE_CLIENT_VERSION,
    clientScreen: 'EMBED',
    platform: 'DESKTOP'
  },
  WEB: {
    key: INNERTUBE_API_KEY,
    clientName: 'WEB',
    clientVersion: INNERTUBE_CLIENT_VERSION,
    clientScreen: 'WATCH',
    platform: 'DESKTOP'
  },
  ANDROID: {
    key: INNERTUBE_API_KEY,
    clientName: 'ANDROID',
    clientVersion: '19.09.37',
    clientScreen: 'EMBED',
    platform: 'MOBILE'
  }
}

async function makeInnerTubeRequest(endpoint: string, body: any, client = INNERTUBE_CLIENTS.WEB_EMBEDDED) {
  const url = `https://www.youtube.com/youtubei/v1/${endpoint}?key=${client.key}`
  
  const payload = {
    ...body,
    context: {
      client: {
        clientName: client.clientName,
        clientVersion: client.clientVersion,
        clientScreen: client.clientScreen,
        platform: client.platform,
        gl: 'US',
        hl: 'en',
        timeZone: 'UTC',
        utcOffsetMinutes: 0
      },
      user: {
        lockedSafetyMode: false
      },
      request: {
        useSsl: true,
        internalExperimentFlags: [],
        consistencyTokenJars: []
      }
    },
    playbackContext: {
      contentPlaybackContext: {
        signatureTimestamp: 19950
      }
    }
  }
  
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com',
        'X-YouTube-Client-Name': client.clientName === 'WEB_EMBEDDED_PLAYER' ? '56' : client.clientName === 'WEB' ? '1' : '3',
        'X-YouTube-Client-Version': client.clientVersion,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })
    
    return response.data
  } catch (error) {
    console.error('InnerTube request failed:', error)
    throw error
  }
}

export async function getTranscriptViaInnerTube(videoId: string): Promise<string | null> {
  try {
    console.log('Attempting InnerTube API extraction...')
    
    // First, get video info
    const videoInfo = await makeInnerTubeRequest('player', {
      videoId: videoId,
      contentCheckOk: true,
      racyCheckOk: true
    })
    
    if (!videoInfo || !videoInfo.captions) {
      console.log('No captions found in video info')
      return null
    }
    
    const captionTracks = videoInfo.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!captionTracks || captionTracks.length === 0) {
      console.log('No caption tracks available')
      return null
    }
    
    // Find English caption track
    const englishTrack = captionTracks.find((track: any) => 
      track.languageCode === 'en' || 
      track.languageCode === 'en-US' ||
      track.languageCode.startsWith('en')
    ) || captionTracks[0]
    
    if (!englishTrack || !englishTrack.baseUrl) {
      console.log('No suitable caption track found')
      return null
    }
    
    console.log(`Found caption track: ${englishTrack.languageCode}`)
    
    // Fetch the captions
    const captionResponse = await axios.get(englishTrack.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    // Parse the caption XML
    const captionText = parseCaptionXML(captionResponse.data)
    return captionText
    
  } catch (error) {
    console.error('InnerTube extraction failed:', error)
    
    // Try Android client as fallback
    try {
      console.log('Trying Android client...')
      const videoInfo = await makeInnerTubeRequest('player', {
        videoId: videoId,
        contentCheckOk: true,
        racyCheckOk: true
      }, INNERTUBE_CLIENTS.ANDROID)
      
      const captionTracks = videoInfo.captions?.playerCaptionsTracklistRenderer?.captionTracks
      if (captionTracks && captionTracks.length > 0) {
        const track = captionTracks[0]
        const captionResponse = await axios.get(track.baseUrl)
        return parseCaptionXML(captionResponse.data)
      }
    } catch (androidError) {
      console.error('Android client also failed:', androidError)
    }
    
    return null
  }
}

function parseCaptionXML(xml: string): string {
  try {
    // Extract text content from XML
    const textMatches = xml.match(/<text[^>]*>([^<]+)<\/text>/g)
    if (!textMatches) {
      console.error('No text elements found in XML')
      return ''
    }
    
    // Extract and decode text content
    const textContent = textMatches
      .map(match => {
        // Extract text between tags
        const textMatch = match.match(/>([^<]+)</)
        if (!textMatch) return ''
        
        // Decode HTML entities
        return textMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, '/')
          .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec)))
          .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    return textContent
  } catch (error) {
    console.error('Error parsing caption XML:', error)
    return ''
  }
}

// Alternative: Use get_video_info endpoint
export async function getVideoInfoLegacy(videoId: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://www.youtube.com/get_video_info?video_id=${videoId}&el=detailpage&hl=en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )
    
    // Parse URL-encoded response
    const params = new URLSearchParams(response.data)
    const playerResponse = params.get('player_response')
    
    if (playerResponse) {
      return JSON.parse(playerResponse)
    }
    
    return null
  } catch (error) {
    console.error('get_video_info failed:', error)
    return null
  }
}