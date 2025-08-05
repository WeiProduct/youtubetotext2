import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '3.2.1',
    timestamp: new Date().toISOString(),
    features: {
      proxy: true,
      robustExtraction: true,
      debugPanel: true,
      innerTubeApi: true,
      externalServices: true,
      manualInput: true
    }
  })
}