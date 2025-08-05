import { NextRequest, NextResponse } from 'next/server'
import { getTranscriptViaInnerTubeDebug } from '@/lib/youtube-innertube-debug'
import { extractVideoId } from '@/lib/youtube-transcript'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }
    
    console.log('=== DEBUG ENDPOINT START ===')
    console.log('Processing video:', videoId)
    
    const { transcript, debug } = await getTranscriptViaInnerTubeDebug(videoId)
    
    return NextResponse.json({
      success: !!transcript,
      videoId,
      transcript: transcript ? transcript.substring(0, 500) + '...' : null,
      transcriptLength: transcript ? transcript.length : 0,
      debug: {
        environment: {
          platform: process.platform,
          nodeVersion: process.version,
          vercel: !!process.env.VERCEL,
          vercelEnv: process.env.VERCEL_ENV,
          region: process.env.VERCEL_REGION
        },
        request: debug.request,
        response: {
          status: debug.response.status,
          headers: debug.response.headers,
          // Limit response data size
          data: JSON.stringify(debug.response.data).substring(0, 1000) + '...',
          playabilityStatus: debug.response.data?.playabilityStatus,
          captionsAvailable: !!debug.response.data?.captions
        },
        error: debug.error ? {
          message: debug.error.message,
          stack: debug.error.stack,
          code: debug.error.code
        } : null
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}