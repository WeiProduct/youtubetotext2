#!/bin/bash

echo "=== Deployment Status Check ==="
echo ""

# Check local version
echo "Local Git Status:"
git log --oneline -n 1
echo ""

# Check production version
echo "Production Status:"
echo -n "Health endpoint: "
curl -s https://youtubetotextclaude.vercel.app/api/health | python3 -m json.tool 2>/dev/null || echo "Not deployed yet"
echo ""

echo -n "Homepage status: "
curl -s -o /dev/null -w "%{http_code}" https://youtubetotextclaude.vercel.app
echo ""

# Test if new features are deployed
echo ""
echo "Testing new features:"
echo -n "Proxy endpoint: "
curl -s -o /dev/null -w "%{http_code}" "https://youtubetotextclaude.vercel.app/api/proxy?url=https://example.com"
echo ""

echo ""
echo "If status codes are 404, the new endpoints haven't been deployed yet."
echo "You may need to manually trigger deployment in Vercel dashboard."