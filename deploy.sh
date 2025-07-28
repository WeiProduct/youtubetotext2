#!/bin/bash

echo "🚀 Starting Vercel deployment..."
echo ""
echo "This script will help you deploy to Vercel."
echo ""
echo "Prerequisites:"
echo "1. You need a Vercel account (free)"
echo "2. You need to be logged in to Vercel CLI"
echo ""
echo "If you haven't logged in yet, press Ctrl+C and run: vercel login"
echo ""
read -p "Press Enter to continue deployment..."

# Deploy with Vercel
echo ""
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your site should now be live on Vercel!"
echo "Check the URL above to access your YouTube to Text converter."