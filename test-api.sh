#!/bin/bash

# Test the API endpoint with the problematic video
echo "Testing YouTube transcript extraction API..."
echo "Video: https://www.youtube.com/watch?v=_GMtx9EsIKU"
echo "----------------------------------------"

curl -X POST http://localhost:3002/api/youtube-transcript \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=_GMtx9EsIKU"}' \
  | python3 -m json.tool