import { NextRequest, NextResponse } from 'next/server'
import { extractVideoId, getYouTubeTranscript } from '@/lib/youtube-transcript'

export async function POST(request: NextRequest) {
  try {
    const { url, includeTimestamps } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // Get transcript using our utility function
    const transcriptResult = await getYouTubeTranscript(videoId, includeTimestamps || false)
    
    return NextResponse.json({
      success: true,
      videoId,
      transcript: transcriptResult.text,
      segments: transcriptResult.segments,
      url
    })
  } catch (error) {
    console.error('Error processing YouTube URL:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract transcript' },
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