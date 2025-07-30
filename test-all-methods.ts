import { getTranscriptViaInnerTube, getVideoInfoLegacy } from './src/lib/youtube-innertube'
import { extractCaptionTracks, fetchCaptionContent } from './src/lib/youtube-api'
import { fetchTranscriptExternal } from './src/lib/youtube-external'
import { YoutubeTranscript } from 'youtube-transcript'

const TEST_VIDEO_ID = '_GMtx9EsIKU' // The problematic video

async function testAllMethods() {
  console.log(`Testing all extraction methods for video: ${TEST_VIDEO_ID}`)
  console.log(`URL: https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`)
  console.log('='.repeat(60))
  
  const results: any[] = []
  
  // Test 1: youtube-transcript library
  console.log('\n1. Testing youtube-transcript library...')
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(TEST_VIDEO_ID)
    if (transcript && transcript.length > 0) {
      const text = transcript.map(t => t.text).join(' ')
      console.log('✅ SUCCESS! Length:', text.length)
      results.push({ method: 'youtube-transcript', success: true, length: text.length })
    } else {
      console.log('❌ FAILED: No transcript returned')
      results.push({ method: 'youtube-transcript', success: false })
    }
  } catch (error: any) {
    console.log('❌ FAILED:', error.message)
    results.push({ method: 'youtube-transcript', success: false, error: error.message })
  }
  
  // Test 2: InnerTube API
  console.log('\n2. Testing InnerTube API...')
  try {
    const transcript = await getTranscriptViaInnerTube(TEST_VIDEO_ID)
    if (transcript) {
      console.log('✅ SUCCESS! Length:', transcript.length)
      console.log('First 100 chars:', transcript.substring(0, 100))
      results.push({ method: 'InnerTube API', success: true, length: transcript.length })
    } else {
      console.log('❌ FAILED: No transcript returned')
      results.push({ method: 'InnerTube API', success: false })
    }
  } catch (error: any) {
    console.log('❌ FAILED:', error.message)
    results.push({ method: 'InnerTube API', success: false, error: error.message })
  }
  
  // Test 3: Direct caption extraction
  console.log('\n3. Testing direct caption extraction...')
  try {
    const tracks = await extractCaptionTracks(TEST_VIDEO_ID)
    if (tracks && tracks.length > 0) {
      console.log(`Found ${tracks.length} caption tracks`)
      const caption = await fetchCaptionContent(tracks[0].baseUrl)
      if (caption) {
        console.log('✅ SUCCESS! Length:', caption.length)
        results.push({ method: 'Direct extraction', success: true, length: caption.length })
      } else {
        console.log('❌ FAILED: Could not fetch caption content')
        results.push({ method: 'Direct extraction', success: false })
      }
    } else {
      console.log('❌ FAILED: No caption tracks found')
      results.push({ method: 'Direct extraction', success: false })
    }
  } catch (error: any) {
    console.log('❌ FAILED:', error.message)
    results.push({ method: 'Direct extraction', success: false, error: error.message })
  }
  
  // Test 4: External services
  console.log('\n4. Testing external services...')
  try {
    const result = await fetchTranscriptExternal(TEST_VIDEO_ID)
    if (result.success && result.text) {
      console.log(`✅ SUCCESS with ${result.method}! Length:`, result.text.length)
      results.push({ method: `External: ${result.method}`, success: true, length: result.text.length })
    } else {
      console.log('❌ FAILED:', result.error)
      results.push({ method: 'External services', success: false, error: result.error })
    }
  } catch (error: any) {
    console.log('❌ FAILED:', error.message)
    results.push({ method: 'External services', success: false, error: error.message })
  }
  
  // Test 5: Legacy video info
  console.log('\n5. Testing legacy video info...')
  try {
    const info = await getVideoInfoLegacy(TEST_VIDEO_ID)
    if (info) {
      console.log('Video info retrieved:', info.videoDetails?.title)
      const hasCaptions = !!info.captions
      console.log('Has captions:', hasCaptions)
      results.push({ method: 'Legacy video info', success: hasCaptions })
    } else {
      console.log('❌ FAILED: No video info')
      results.push({ method: 'Legacy video info', success: false })
    }
  } catch (error: any) {
    console.log('❌ FAILED:', error.message)
    results.push({ method: 'Legacy video info', success: false, error: error.message })
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY:')
  console.log('='.repeat(60))
  
  const successful = results.filter(r => r.success)
  console.log(`Success rate: ${successful.length}/${results.length}`)
  
  console.log('\nDetailed results:')
  results.forEach(r => {
    console.log(`- ${r.method}: ${r.success ? '✅ SUCCESS' : '❌ FAILED'}${r.error ? ` (${r.error})` : ''}`)
  })
  
  if (successful.length === 0) {
    console.log('\n⚠️  WARNING: No method succeeded!')
    console.log('This video might:')
    console.log('- Not have captions available')
    console.log('- Have region-restricted captions')
    console.log('- Require authentication')
    console.log('- Be private or age-restricted')
  }
}

// Run the test
testAllMethods().catch(console.error)