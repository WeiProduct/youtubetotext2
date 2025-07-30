#!/bin/bash

echo "Starting Vercel deployment..."

# Clean any existing .vercel directory
rm -rf .vercel

# Create a new deployment
echo "Creating new Vercel project..."

# Use expect to automate the interactive process
cat > deploy-expect.exp << 'EOF'
#!/usr/bin/expect -f

set timeout 120
spawn vercel

# Wait for the first prompt
expect {
    "Set up and deploy" {
        send "y\r"
    }
    "Log in to Vercel" {
        send "\r"
        expect "Continue with"
        send "\033[A\r"  # Select GitHub
        expect eof
        exit 1
    }
}

# Select scope
expect "Which scope do you want to deploy to?" {
    send "\r"
}

# Link to existing project
expect "Link to existing project?" {
    send "n\r"
}

# Project name
expect "What's your project's name?" {
    send "youtube-text-converter\r"
}

# Directory
expect "In which directory is your code located?" {
    send "./\r"
}

# Modify settings
expect "Want to modify these settings?" {
    send "n\r"
}

expect eof
EOF

# Make the expect script executable
chmod +x deploy-expect.exp

# Check if expect is installed
if ! command -v expect &> /dev/null; then
    echo "Installing expect..."
    brew install expect || sudo apt-get install expect -y
fi

# Run the deployment
./deploy-expect.exp

# Clean up
rm deploy-expect.exp

echo "Deployment initiated!"
echo "Now deploying to production..."

# Deploy to production
vercel --prod --yes

echo "Deployment complete!"