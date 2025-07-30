// Test YouTube InnerTube API directly
const https = require('https');

async function testInnerTubeAPI(videoId) {
  const apiKey = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
  const url = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`;
  
  const payload = JSON.stringify({
    context: {
      client: {
        hl: 'en',
        gl: 'US',
        clientName: 'WEB',
        clientVersion: '2.20240726.00.00',
        clientScreen: 'WATCH',
        platform: 'DESKTOP'
      }
    },
    videoId: videoId
  });
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          // Check for captions
          const captions = json?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          
          if (captions && captions.length > 0) {
            console.log(`✅ Found ${captions.length} caption tracks:`);
            captions.forEach((track, i) => {
              console.log(`  ${i + 1}. Language: ${track.languageCode}, Name: ${track.name?.simpleText || 'Auto-generated'}`);
              if (track.baseUrl) {
                console.log(`     URL: ${track.baseUrl.substring(0, 100)}...`);
              }
            });
            
            // Test fetching the first caption
            if (captions[0].baseUrl) {
              console.log('\nTesting caption download...');
              testCaptionUrl(captions[0].baseUrl);
            }
          } else {
            console.log('❌ No captions found');
          }
          
          resolve(json);
        } catch (e) {
          console.error('Failed to parse response:', e);
          console.log('Response:', data.substring(0, 500));
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });
    
    req.write(payload);
    req.end();
  });
}

function testCaptionUrl(url) {
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': 'https://www.youtube.com'
    }
  }, (res) => {
    console.log(`Caption URL Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Caption response length: ${data.length} bytes`);
      if (data.includes('<text')) {
        console.log('✅ Caption content is XML format');
        // Extract first few captions
        const matches = data.match(/<text[^>]*>([^<]+)<\/text>/g);
        if (matches) {
          console.log(`First 3 captions:`);
          matches.slice(0, 3).forEach((match, i) => {
            const text = match.replace(/<[^>]*>/g, '');
            console.log(`  ${i + 1}. ${text}`);
          });
        }
      }
    });
  });
}

// Test videos
console.log('=== Testing Video: nKIu9yen5nc ===');
testInnerTubeAPI('nKIu9yen5nc').catch(console.error);

setTimeout(() => {
  console.log('\n=== Testing Video: _GMtx9EsIKU ===');
  testInnerTubeAPI('_GMtx9EsIKU').catch(console.error);
}, 5000);