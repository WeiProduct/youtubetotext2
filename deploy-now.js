const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Automated Vercel Deployment Starting...\n');

// Clean up
console.log('🧹 Cleaning up old configurations...');
if (fs.existsSync('.vercel')) {
  fs.rmSync('.vercel', { recursive: true });
}

// Ensure build works
console.log('🔨 Testing build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!\n');
} catch (error) {
  console.error('❌ Build failed! Please fix errors first.');
  process.exit(1);
}

// Create deployment config
console.log('📝 Creating deployment configuration...');
const deployConfig = {
  name: 'youtube-transcript-' + Date.now(),
  framework: 'nextjs',
  public: true,
  github: {
    enabled: false
  }
};

fs.writeFileSync('vercel-deploy.json', JSON.stringify(deployConfig, null, 2));

console.log('\n🎯 Ready for deployment!\n');
console.log('Please run ONE of these commands:\n');
console.log('Option 1 (New project):');
console.log('  vercel --prod\n');
console.log('Option 2 (Import from GitHub):');
console.log('  Open: https://vercel.com/new/clone?repository-url=https://github.com/WeiProduct/youtubetotext2\n');
console.log('Option 3 (Direct deploy):');
console.log('  vercel deploy --prod --public --name=yt-text-' + Date.now());