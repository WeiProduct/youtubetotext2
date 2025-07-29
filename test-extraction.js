// Test script for YouTube transcript extraction
const { extractCaptionTracks, fetchCaptionContent, getVideoInfo } = require('./src/lib/youtube-api');

async function testExtraction() {
  const videoId = '_GMtx9EsIKU'; // The problematic video
  
  console.log('Testing video:', videoId);
  console.log('URL:', `https://www.youtube.com/watch?v=${videoId}`);
  console.log('-'.repeat(50));
  
  try {
    // Get video info
    console.log('1. Getting video info...');
    const info = await getVideoInfo(videoId);
    if (info) {
      console.log('   Title:', info.title);
      console.log('   Author:', info.author);
    }
    
    // Extract caption tracks
    console.log('\n2. Extracting caption tracks...');
    const tracks = await extractCaptionTracks(videoId);
    
    if (tracks && tracks.length > 0) {
      console.log(`   Found ${tracks.length} caption tracks:`);
      tracks.forEach((track, i) => {
        console.log(`   ${i + 1}. Language: ${track.languageCode}, Name: ${track.name?.simpleText || 'Default'}`);
      });
      
      // Try to fetch content from first track
      console.log('\n3. Fetching caption content from first track...');
      const content = await fetchCaptionContent(tracks[0].baseUrl);
      
      if (content) {
        console.log('   Success! Caption length:', content.length, 'characters');
        console.log('   First 200 characters:', content.substring(0, 200) + '...');
      } else {
        console.log('   Failed to fetch caption content');
      }
    } else {
      console.log('   No caption tracks found');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data?.substring(0, 200));
    }
  }
}

// Run the test
testExtraction();