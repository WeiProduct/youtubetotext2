#!/bin/bash

echo "🚀 Starting automated Vercel deployment..."

# Create a temporary directory for deployment
DEPLOY_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $DEPLOY_DIR"

# Copy all files to temporary directory
echo "📋 Copying files..."
cp -r . "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Remove unnecessary files
rm -rf .git .vercel node_modules .env.local
rm -f auto-deploy.sh test-deploy.txt

# Initialize new git repo
echo "🔧 Initializing clean git repository..."
git init
git add .
git commit -m "Initial deployment commit"

# Create GitHub repo using API (if you have gh CLI)
if command -v gh &> /dev/null; then
    echo "📦 Creating new GitHub repository..."
    gh repo create youtube-transcript-deploy --public --source=. --remote=origin --push
else
    echo "⚠️  GitHub CLI not found. Manual repo creation needed."
fi

# Deploy to Vercel
echo "🎯 Deploying to Vercel..."
vercel --prod --yes --name=youtube-transcript-app

echo "✅ Deployment complete!"