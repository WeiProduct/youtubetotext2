// YouTube InnerTube API with extensive debugging
import axios from 'axios'

const INNERTUBE_API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'
const INNERTUBE_CLIENT_VERSION = '2.20240726.00.00'

interface DebugInfo {
  request: {
    url: string
    headers: any
    body: any
  }
  response: {
    status: number
    headers: any
    data: any
  }
  error?: any
}

export async function getTranscriptViaInnerTubeDebug(videoId: string): Promise<{ transcript: string | null, debug: DebugInfo }> {
  const debugInfo: DebugInfo = {
    request: { url: '', headers: {}, body: {} },
    response: { status: 0, headers: {}, data: {} }
  }

  try {
    console.log('=== INNERTUBE DEBUG START ===')
    console.log('Video ID:', videoId)
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION
    })

    const url = `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}&prettyPrint=false`
    
    // Try different payload configurations
    const payloads = [
      {
        name: 'Standard Web Client',
        data: {
          videoId: videoId,
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: INNERTUBE_CLIENT_VERSION,
              clientScreen: 'WATCH',
              platform: 'DESKTOP',
              hl: 'en',
              gl: 'US',
              timeZone: 'UTC',
              utcOffsetMinutes: 0,
              userInterfaceTheme: 'USER_INTERFACE_THEME_LIGHT',
              browserName: 'Chrome',
              browserVersion: '120.0.0.0',
              acceptHeader: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              deviceMake: '',
              deviceModel: '',
              originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
              screenDensityFloat: 1,
              screenHeightPoints: 1080,
              screenWidthPoints: 1920
            },
            user: {
              lockedSafetyMode: false
            },
            request: {
              useSsl: true,
              consistencyTokenJars: [],
              internalExperimentFlags: []
            },
            clickTracking: {
              clickTrackingParams: ''
            },
            adSignalsInfo: {
              params: []
            }
          },
          playbackContext: {
            contentPlaybackContext: {
              currentUrl: `https://www.youtube.com/watch?v=${videoId}`,
              vis: 0,
              splay: false,
              autoCaptionsDefaultOn: false,
              autonavState: 'STATE_NONE',
              html5Preference: 'HTML5_PREF_WANTS',
              lactMilliseconds: '-1',
              referer: 'https://www.youtube.com/',
              signatureTimestamp: 19950,
              autoplay: true,
              autonav: true
            }
          },
          attestation: {
            playerAttestationRenderer: {
              challenge: 'a=4&a2=1&b=VOLigXAR-30&c=1607634673&d=u&e=' + videoId,
              botguardData: {
                program: 'oSl4AX0JAooBAb5EB5cVTdQ4IyBpqAW6fKeFtQP9SP+5kOt+cZcMSZU4XhOw3r5MdfKzBLyPqHfKJdOs8B4f9n6sW7BzSMGC0+5WePLCUhnfTtlLKcT7eDU6gkJXmSg5MyEBR7yT1+k='
              }
            }
          },
          params: 'CgIQBg==',
          contentCheckOk: true,
          racyCheckOk: true,
          captionsRequested: true
        }
      },
      {
        name: 'Embedded Player',
        data: {
          videoId: videoId,
          context: {
            client: {
              clientName: 'WEB_EMBEDDED_PLAYER',
              clientVersion: INNERTUBE_CLIENT_VERSION,
              clientScreen: 'EMBED',
              platform: 'DESKTOP',
              hl: 'en',
              gl: 'US'
            }
          },
          playbackContext: {
            contentPlaybackContext: {
              signatureTimestamp: 19950
            }
          },
          contentCheckOk: true,
          racyCheckOk: true
        }
      },
      {
        name: 'Android Client',
        data: {
          videoId: videoId,
          context: {
            client: {
              clientName: 'ANDROID',
              clientVersion: '19.09.37',
              clientScreen: 'EMBED',
              platform: 'MOBILE',
              hl: 'en',
              gl: 'US',
              androidSdkVersion: 30
            }
          },
          contentCheckOk: true,
          racyCheckOk: true,
          params: 'CgIQBg=='
        }
      }
    ]

    for (const payload of payloads) {
      console.log(`\n--- Trying ${payload.name} ---`)
      
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': payload.name === 'Android Client' 
          ? 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com/',
        'X-YouTube-Client-Name': payload.name === 'WEB_EMBEDDED_PLAYER' ? '56' : payload.name === 'ANDROID' ? '3' : '1',
        'X-YouTube-Client-Version': payload.data.context.client.clientVersion,
        'X-Goog-Visitor-Id': 'CgtmelQ4Y2k3cmlqVSiAt4WoBg%3D%3D',
        'X-Youtube-Bootstrap-Logged-In': 'false',
        'X-Youtube-Device': 'cbr=Chrome&cbrver=120.0.0.0&ceng=WebKit&cengver=537.36&cos=Windows&cosver=10.0',
        'X-Youtube-Page-CL': '677741211',
        'X-Youtube-Page-Label': 'youtube.desktop.web_20240729_08_RC00',
        'X-Origin': 'https://www.youtube.com',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'same-origin',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
      }

      debugInfo.request = {
        url: url,
        headers: headers,
        body: payload.data
      }

      console.log('Request URL:', url)
      console.log('Request Headers:', JSON.stringify(headers, null, 2))
      console.log('Request Body:', JSON.stringify(payload.data, null, 2))

      try {
        const response = await axios.post(url, payload.data, {
          headers: headers,
          timeout: 10000,
          validateStatus: () => true // Accept any status
        })

        debugInfo.response = {
          status: response.status,
          headers: response.headers,
          data: response.data
        }

        console.log('Response Status:', response.status)
        console.log('Response Headers:', JSON.stringify(response.headers, null, 2))
        
        if (response.status !== 200) {
          console.log('Response Body:', JSON.stringify(response.data, null, 2))
          continue
        }

        // Check playabilityStatus
        const playabilityStatus = response.data?.playabilityStatus
        console.log('Playability Status:', playabilityStatus?.status)
        if (playabilityStatus?.status !== 'OK') {
          console.log('Playability Reason:', playabilityStatus?.reason)
          console.log('Error Screen:', playabilityStatus?.errorScreen)
          continue
        }

        // Check for captions
        const captions = response.data?.captions
        console.log('Captions Available:', !!captions)
        
        const captionTracks = captions?.playerCaptionsTracklistRenderer?.captionTracks
        if (!captionTracks || captionTracks.length === 0) {
          console.log('No caption tracks found')
          console.log('Captions object:', JSON.stringify(captions, null, 2))
          continue
        }

        console.log(`Found ${captionTracks.length} caption tracks`)
        captionTracks.forEach((track: any, i: number) => {
          console.log(`Track ${i + 1}: ${track.languageCode} - ${track.name?.simpleText || 'Auto-generated'}`)
        })

        // Find English track
        const track = captionTracks.find((t: any) => 
          t.languageCode === 'en' || 
          t.languageCode === 'en-US' ||
          t.languageCode.startsWith('en')
        ) || captionTracks[0]

        if (!track || !track.baseUrl) {
          console.log('No suitable track found')
          continue
        }

        console.log('Selected track:', track.languageCode)
        console.log('Caption URL:', track.baseUrl)

        // Fetch captions
        const captionResponse = await axios.get(track.baseUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/xml, application/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.youtube.com/'
          },
          timeout: 10000
        })

        if (captionResponse.data) {
          const transcript = parseCaptionXML(captionResponse.data)
          console.log('=== INNERTUBE DEBUG SUCCESS ===')
          return { transcript, debug: debugInfo }
        }
      } catch (error) {
        console.error(`Error with ${payload.name}:`, error)
        debugInfo.error = error
      }
    }

    console.log('=== INNERTUBE DEBUG FAILED ===')
    return { transcript: null, debug: debugInfo }
  } catch (error) {
    console.error('Fatal error in InnerTube debug:', error)
    debugInfo.error = error
    return { transcript: null, debug: debugInfo }
  }
}

function parseCaptionXML(xml: string): string {
  try {
    const textMatches = xml.match(/<text[^>]*>([^<]+)<\/text>/g)
    if (!textMatches) return ''
    
    const textContent = textMatches
      .map(match => {
        const textMatch = match.match(/>([^<]+)</)
        if (!textMatch) return ''
        
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