import { NextRequest, NextResponse } from 'next/server'
import { extractVideoId, getYouTubeTranscript } from '@/lib/youtube-transcript'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    steps: []
  }
  let videoId: string | null = null

  try {
    const { url, includeTimestamps } = await request.json()
    debugInfo.steps.push({ step: 'Parse request', url, includeTimestamps })
    
    if (!url) {
      debugInfo.error = 'YouTube URL is required'
      return NextResponse.json(
        { error: 'YouTube URL is required', debug: debugInfo },
        { status: 400 }
      )
    }

    // Extract video ID from YouTube URL
    videoId = extractVideoId(url)
    debugInfo.steps.push({ step: 'Extract video ID', videoId })
    
    if (!videoId) {
      debugInfo.error = 'Invalid YouTube URL'
      return NextResponse.json(
        { error: 'Invalid YouTube URL', debug: debugInfo },
        { status: 400 }
      )
    }

    // Get transcript using our utility function
    debugInfo.steps.push({ step: 'Starting transcript extraction', method: 'getYouTubeTranscript' })
    const transcriptResult = await getYouTubeTranscript(videoId, includeTimestamps || false)
    
    debugInfo.steps.push({ 
      step: 'Transcript extracted', 
      textLength: transcriptResult.text.length,
      hasSegments: !!transcriptResult.segments,
      language: transcriptResult.language
    })
    
    debugInfo.duration = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      videoId,
      transcript: transcriptResult.text,
      segments: transcriptResult.segments,
      url,
      debug: debugInfo // Always include debug info for now
    })
  } catch (error) {
    console.error('Error processing YouTube URL:', error)
    debugInfo.error = error instanceof Error ? error.message : 'Failed to extract transcript'
    debugInfo.errorStack = error instanceof Error ? error.stack : undefined
    debugInfo.duration = Date.now() - startTime
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to extract transcript',
        videoId: videoId || undefined,
        debug: debugInfo // Always include debug info for now
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}