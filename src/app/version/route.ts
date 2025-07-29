import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '1.0.1',
    lastUpdated: '2025-07-28T13:30:00Z',
    features: {
      debugPanel: true,
      testPage: true,
      debugPanelDefaultVisible: true
    },
    message: 'If you see this, the deployment is working correctly!'
  })
}