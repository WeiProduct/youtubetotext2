// Direct YouTube subtitle extraction using /api/timedtext endpoint
// Based on successful implementation from AI录音笔记
import { logStart, logSuccess, logError, logInfo } from './debug-logger'

interface LanguageVariants {
  [key: string]: string[]
}

const LANGUAGE_VARIANTS: LanguageVariants = {
  'zh': ['zh-Hans', 'zh-CN', 'zh', 'zh-Hans-CN', 'zh-Hant', 'zh-TW'],
  'zh-Hans': ['zh-Hans', 'zh-CN', 'zh', 'zh-Hans-CN'],
  'zh-Hant': ['zh-Hant', 'zh-TW', 'zh-HK'],
  'en': ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU'],
  'es': ['es', 'es-ES', 'es-419', 'es-MX'],
  'fr': ['fr', 'fr-FR', 'fr-CA'],
  'de': ['de', 'de-DE', 'de-AT', 'de-CH'],
  'ja': ['ja', 'ja-JP'],
  'ko': ['ko', 'ko-KR'],
  'pt': ['pt', 'pt-BR', 'pt-PT'],
  'ru': ['ru', 'ru-RU'],
  'ar': ['ar', 'ar-SA', 'ar-AE'],
  'hi': ['hi', 'hi-IN'],
  'it': ['it', 'it-IT'],
  'nl': ['nl', 'nl-NL'],
  'pl': ['pl', 'pl-PL'],
  'tr': ['tr', 'tr-TR'],
  'vi': ['vi', 'vi-VN'],
  'th': ['th', 'th-TH'],
  'id': ['id', 'id-ID'],
  'ms': ['ms', 'ms-MY']
}

export async function getSubtitlesDirectly(videoId: string, language: string = 'en'): Promise<string | null> {
  console.log(`[Direct] Attempting to fetch subtitles for video ${videoId} in language ${language}`)
  logInfo('Direct URL', `Attempting to fetch subtitles for video ${videoId} in language ${language}`)
  
  // The direct URL approach doesn't work without proper parameters from InnerTube API
  // This method is now deprecated in favor of InnerTube API
  logError('Direct URL', 'Method deprecated - requires parameters from InnerTube API')
  return null
}

function processSubtitleContent(content: string): string {
  // Detect format and process accordingly
  if (content.includes('<text')) {
    return processXMLSubtitles(content)
  } else if (content.includes('WEBVTT')) {
    return processWebVTTSubtitles(content)
  } else if (content.includes('"events"')) {
    return processJSONSubtitles(content)
  }
  
  // Return as-is if format unknown
  return content
}

function processXMLSubtitles(content: string): string {
  const textRegex = /<text[^>]*>([^<]+)<\/text>/gi
  const matches = [...content.matchAll(textRegex)]
  
  let result = ''
  for (const match of matches) {
    let text = match[1]
    // Decode HTML entities
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec)))
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    
    result += text + ' '
  }
  
  return result.trim()
}

function processWebVTTSubtitles(content: string): string {
  const lines = content.split('\n')
  let result = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip headers, timestamps, and empty lines
    if (trimmed.startsWith('WEBVTT') || 
        trimmed.includes('-->') || 
        trimmed === '' ||
        /^\d+$/.test(trimmed)) {
      continue
    }
    
    // Remove speaker labels like <v Speaker>
    const cleanLine = trimmed.replace(/<v[^>]*>/g, '').replace(/<\/v>/g, '')
    result += cleanLine + ' '
  }
  
  return result.trim()
}

function processJSONSubtitles(content: string): string {
  try {
    const data = JSON.parse(content)
    let result = ''
    
    if (data.events) {
      for (const event of data.events) {
        if (event.segs) {
          for (const seg of event.segs) {
            if (seg.utf8) {
              result += seg.utf8 + ' '
            }
          }
        }
      }
    }
    
    return result.trim()
  } catch (error) {
    console.error('[Direct] Failed to parse JSON subtitles:', error)
    return content
  }
}

// Auto-detect language from video page
export async function detectVideoLanguage(videoId: string): Promise<string> {
  try {
    logStart('detectVideoLanguage', `Detecting language for video: ${videoId}`)
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })
    
    logInfo('detectVideoLanguage', 'YouTube page fetched', { status: response.status })
    const html = await response.text()
    
    // Try to find default audio language
    const audioLangMatch = html.match(/"defaultAudioTrackIndex":\d+,"audioTracks":\[{"captionTrackIndices":\[[^\]]*\],"defaultCaptionTrackIndex":\d+,"visibility":"UNKNOWN","hasDefaultTrack":true,"captionsInitialState":"CAPTIONS_INITIAL_STATE_OFF_RECOMMENDED","id":{"itag":\d+},"audioTrackId":"[^"]*\.([^"]+)"/)
    if (audioLangMatch) {
      logSuccess('detectVideoLanguage', `Detected language from audio track: ${audioLangMatch[1]}`)
      return audioLangMatch[1]
    }
    
    // Try to find from caption tracks
    const captionMatch = html.match(/"captionTracks":\[{"baseUrl":"[^"]*","name":\{"simpleText":"[^"]*"\},"vssId":"[^"]*","languageCode":"([^"]+)"/)
    if (captionMatch) {
      logSuccess('detectVideoLanguage', `Detected language from caption tracks: ${captionMatch[1]}`)
      return captionMatch[1]
    }
    
    logInfo('detectVideoLanguage', 'No language detected, defaulting to English')
    return 'en' // Default to English
  } catch (error) {
    console.error('[Direct] Failed to detect language:', error)
    logError('detectVideoLanguage', 'Failed to detect language', { error })
    return 'en'
  }
}