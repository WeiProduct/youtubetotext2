import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '2.2.0',
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