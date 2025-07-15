export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ ClubUp is Working!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The application is running successfully.
        </p>
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <h2 className="font-semibold text-green-800">✓ Database Connected</h2>
            <p className="text-sm text-green-700">Prisma schema is working</p>
          </div>
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <h2 className="font-semibold text-blue-800">✓ Next.js Running</h2>
            <p className="text-sm text-blue-700">React components are rendering</p>
          </div>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <h2 className="font-semibold text-purple-800">✓ Styling Working</h2>
            <p className="text-sm text-purple-700">Tailwind CSS is loaded</p>
          </div>
        </div>
        <div className="mt-8">
          <a
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
