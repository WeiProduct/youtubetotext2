import { NextRequest, NextResponse } from 'next/server'
import { extractVideoId, getYouTubeTranscript } from '@/lib/youtube-transcript'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
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
    const transcript = await getYouTubeTranscript(videoId)
    
    return NextResponse.json({
      success: true,
      videoId,
      transcript,
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