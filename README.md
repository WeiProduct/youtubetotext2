# YouTube to Text Converter

A web application that extracts transcripts from YouTube videos and converts them to downloadable text files.

## Features

- Extract transcripts from YouTube videos using just the URL
- Support for youtube.com and youtu.be URLs
- Copy transcript to clipboard
- Download transcript as a text file
- Clean, responsive user interface
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WeiProduct/Youtubetotext.git
cd Youtubetotext
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Navigate to the website
2. Paste a YouTube video URL in the input field
3. Click "Extract Text"
4. The transcript will appear below
5. Use "Copy" to copy the text or "Download" to save as a file

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes

## Current Limitations

The current implementation provides a placeholder transcript. To enable real transcript extraction, you can:

1. Use the `youtube-transcript` npm package
2. Implement YouTube Data API v3 integration
3. Use web scraping techniques (be mindful of rate limits)

## Deployment

Build the application for production:

```bash
npm run build
npm start
```

Or deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WeiProduct/Youtubetotext)

## Contributing

Feel free to open issues or submit pull requests to improve the application.

## License

MIT