// Test direct YouTube subtitle URL access
const https = require('https');

function testSubtitleUrl(videoId, lang) {
  const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=srv1`;
  console.log(`Testing URL: ${url}`);
  
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  };
  
  https.get(url, options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Response length: ${data.length} bytes`);
      if (data.length > 0) {
        console.log(`First 200 chars: ${data.substring(0, 200)}`);
        if (data.includes('<text')) {
          console.log('✅ SUCCESS: Found subtitle content!');
        } else if (data.includes('<!DOCTYPE')) {
          console.log('❌ ERROR: Got HTML error page');
        } else {
          console.log('❓ UNKNOWN: Response format unclear');
        }
      }
    });
  }).on('error', (err) => {
    console.error('Request error:', err);
  });
}

// Test different videos
console.log('=== Testing Video 1 ===');
testSubtitleUrl('nKIu9yen5nc', 'en');

setTimeout(() => {
  console.log('\n=== Testing Video 2 ===');
  testSubtitleUrl('_GMtx9EsIKU', 'en');
}, 2000);