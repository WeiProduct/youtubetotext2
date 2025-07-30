const { execSync } = require('child_process');

async function deployToVercel() {
  console.log('🚀 Starting Vercel deployment...\n');
  
  try {
    // Check if vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch {
      console.log('Installing Vercel CLI...');
      execSync('npm i -g vercel', { stdio: 'inherit' });
    }
    
    console.log('📦 Building project locally first...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('\n✅ Build successful!');
    console.log('\n📤 Now deploying to Vercel...');
    console.log('\nPlease follow these steps:');
    console.log('1. Run: vercel');
    console.log('2. When prompted:');
    console.log('   - Set up and deploy? → Yes');
    console.log('   - Scope → Select your account');
    console.log('   - Link to existing project? → No');
    console.log('   - Project name → youtube-text-converter (or any name)');
    console.log('   - Directory → ./ (just press Enter)');
    console.log('   - Modify settings? → No');
    console.log('\n3. After initial deployment, run: vercel --prod');
    console.log('\n4. Your site will be live at the URL shown!');
    
    console.log('\n💡 Alternative: Use the one-click deploy:');
    console.log('https://vercel.com/new/clone?repository-url=https://github.com/WeiProduct/youtubetotextclaude');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deployToVercel();