import { NextRequest, NextResponse } from 'next/server'
import { getSubtitlesDirectly } from '@/lib/youtube-direct'
import { extractVideoId } from '@/lib/youtube-transcript'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  const lang = searchParams.get('lang') || 'en'
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }
  
  const videoId = extractVideoId(url)
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }
  
  try {
    console.log(`Testing direct subtitle extraction for video: ${videoId}, language: ${lang}`)
    const subtitles = await getSubtitlesDirectly(videoId, lang)
    
    if (subtitles) {
      return NextResponse.json({
        success: true,
        videoId,
        language: lang,
        subtitleLength: subtitles.length,
        preview: subtitles.substring(0, 500) + '...',
        fullText: subtitles
      })
    } else {
      return NextResponse.json({
        success: false,
        videoId,
        language: lang,
        error: 'No subtitles found'
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      videoId,
      language: lang,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}