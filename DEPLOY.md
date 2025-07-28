# Deployment Guide for YouTube to Text

## Option 1: Deploy to Vercel (Recommended - FREE)

### Quick Deploy (One-Click)

1. **Click this link**: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/WeiProduct/Youtubetotext)

2. **Sign in to Vercel**:
   - If you don't have an account, click "Sign Up"
   - You can use GitHub, GitLab, or Bitbucket to sign in

3. **Configure your project**:
   - Project Name: Leave as default or change to your preference
   - Framework Preset: Will auto-detect as Next.js
   - Root Directory: Leave as default (`.`)
   - Build Command: Leave as default (`npm run build`)
   - Output Directory: Leave as default
   - Install Command: Leave as default (`npm install`)

4. **Click "Deploy"**
   - Vercel will automatically clone your repository
   - Install dependencies
   - Build the project
   - Deploy it to a live URL

5. **Your site is live!**
   - You'll get a URL like: `https://youtubetotext.vercel.app`
   - The site will have full functionality including API routes

### Manual Deploy via Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# In your project directory
cd Youtubetotext

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: (press enter for default)
# - Directory: ./ (press enter)
# - Override settings: No
```

## Option 2: Deploy to Other Platforms

### Netlify

```bash
# Build command
npm run build

# Publish directory
.next
```

Note: API routes won't work on Netlify without additional configuration.

### Railway

1. Connect your GitHub repository
2. Railway will auto-detect Next.js
3. Deploy with one click

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Use these settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

## Environment Variables

No environment variables are required for basic functionality.

Optional variables:
- `NEXT_PUBLIC_DEBUG_MODE=true` - Enable debug panel in production (not recommended)

## Post-Deployment

After deployment:

1. **Test the application**:
   - Visit your deployment URL
   - Try extracting a transcript from a YouTube video with captions
   - Test the copy and download functions

2. **Monitor performance**:
   - Vercel provides analytics and logs
   - Check the Functions tab for API performance

3. **Custom domain** (optional):
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

## Troubleshooting

### "No transcript available" error
- Make sure the YouTube video has captions enabled
- Try a different video
- Check browser console for detailed errors (if debug mode is enabled)

### Build failures
- Run `npm install` locally
- Run `npm run build` to test locally
- Check for TypeScript errors

### API timeout
- Some videos with very long transcripts might timeout
- The API has a 30-second timeout limit
- Try shorter videos

## Support

For issues, please open an issue on GitHub:
https://github.com/WeiProduct/Youtubetotext/issues