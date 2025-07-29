'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-4">Debug Test Page</h1>
      <p className="mb-4">If you can see this page, the deployment is working.</p>
      
      <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-2">Debug Panel Status:</h2>
        <p>The debug panel should be visible in the bottom-right corner.</p>
        <p>If not visible, press <kbd className="bg-gray-200 px-2 py-1 rounded">Ctrl/Cmd + D</kbd></p>
      </div>
      
      <div className="bg-blue-100 border-2 border-blue-400 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Quick Actions:</h2>
        <ul className="list-disc list-inside">
          <li>Check browser console for errors (F12)</li>
          <li>Clear browser cache and refresh</li>
          <li>Try in incognito/private mode</li>
        </ul>
      </div>
      
      <div className="mt-8">
        <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Back to Main App
        </a>
      </div>
    </div>
  )
}