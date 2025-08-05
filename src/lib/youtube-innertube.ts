// YouTube InnerTube API - Direct API access
import axios from 'axios'
import { logStart, logSuccess, logError, logInfo } from './debug-logger'

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
    logInfo('InnerTube', `Starting extraction for video: ${videoId}`, { client: 'WEB_EMBEDDED_PLAYER' })
    
    // First, get video info
    const videoInfo = await makeInnerTubeRequest('player', {
      videoId: videoId,
      contentCheckOk: true,
      racyCheckOk: true
    })
    
    // Log the response status
    logInfo('InnerTube', 'Received response from player endpoint', {
      hasVideoInfo: !!videoInfo,
      playabilityStatus: videoInfo?.playabilityStatus?.status,
      hasCaptions: !!videoInfo?.captions
    })
    
    if (!videoInfo || !videoInfo.captions) {
      console.log('No captions found in video info')
      logError('InnerTube', 'No captions object in response', {
        hasVideoInfo: !!videoInfo,
        playabilityStatus: videoInfo?.playabilityStatus
      })
      return null
    }
    
    const captionTracks = videoInfo.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!captionTracks || captionTracks.length === 0) {
      console.log('No caption tracks available')
      logError('InnerTube', 'No caption tracks in captions object', {
        captionsStructure: Object.keys(videoInfo.captions || {})
      })
      return null
    }
    
    logInfo('InnerTube', `Found ${captionTracks.length} caption tracks`, {
      tracks: captionTracks.map((t: any) => ({ lang: t.languageCode, name: t.name?.simpleText }))
    })
    
    // Find English caption track
    const englishTrack = captionTracks.find((track: any) => 
      track.languageCode === 'en' || 
      track.languageCode === 'en-US' ||
      track.languageCode.startsWith('en')
    ) || captionTracks[0]
    
    if (!englishTrack || !englishTrack.baseUrl) {
      console.log('No suitable caption track found')
      logError('InnerTube', 'No suitable caption track with baseUrl', {
        availableTracks: captionTracks.map((t: any) => t.languageCode)
      })
      return null
    }
    
    console.log(`Found caption track: ${englishTrack.languageCode}`)
    logInfo('InnerTube', `Selected caption track: ${englishTrack.languageCode}`, {
      hasBaseUrl: !!englishTrack.baseUrl,
      trackName: englishTrack.name?.simpleText
    })
    
    // Fetch the captions
    logInfo('InnerTube', 'Fetching caption content from baseUrl')
    const captionResponse = await axios.get(englishTrack.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    logInfo('InnerTube', 'Caption content fetched', {
      status: captionResponse.status,
      contentLength: captionResponse.data?.length,
      contentType: captionResponse.headers['content-type']
    })
    
    // Parse the caption XML
    const captionText = parseCaptionXML(captionResponse.data)
    if (captionText) {
      logSuccess('InnerTube', 'Successfully extracted and parsed captions', {
        textLength: captionText.length,
        client: 'WEB_EMBEDDED_PLAYER'
      })
    }
    return captionText
    
  } catch (error) {
    console.error('InnerTube extraction failed:', error)
    logError('InnerTube', 'WEB_EMBEDDED_PLAYER client failed', { error })
    
    // Try Android client as fallback
    try {
      console.log('Trying Android client...')
      logInfo('InnerTube', 'Attempting Android client as fallback')
      const videoInfo = await makeInnerTubeRequest('player', {
        videoId: videoId,
        contentCheckOk: true,
        racyCheckOk: true
      }, INNERTUBE_CLIENTS.ANDROID)
      
      logInfo('InnerTube', 'Android client response received', {
        hasVideoInfo: !!videoInfo,
        playabilityStatus: videoInfo?.playabilityStatus?.status,
        hasCaptions: !!videoInfo?.captions
      })
      
      const captionTracks = videoInfo.captions?.playerCaptionsTracklistRenderer?.captionTracks
      if (captionTracks && captionTracks.length > 0) {
        logInfo('InnerTube', `Android client found ${captionTracks.length} caption tracks`)
        const track = captionTracks[0]
        const captionResponse = await axios.get(track.baseUrl)
        const result = parseCaptionXML(captionResponse.data)
        if (result) {
          logSuccess('InnerTube', 'Successfully extracted captions via Android client', {
            textLength: result.length
          })
        }
        return result
      } else {
        logError('InnerTube', 'Android client found no caption tracks')
      }
    } catch (androidError) {
      console.error('Android client also failed:', androidError)
      logError('InnerTube', 'Android client also failed', { error: androidError })
    }
    
    logError('InnerTube', 'All InnerTube clients failed to extract captions')
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