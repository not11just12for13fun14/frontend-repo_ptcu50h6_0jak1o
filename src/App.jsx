import { useMemo, useState } from 'react'

function App() {
  const [description, setDescription] = useState('')
  const [sector, setSector] = useState('')
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const backend = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await fetch(`${backend}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, sector: sector || null, region: region || null })
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50">
      <header className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Funding Opportunity Finder</h1>
        <p className="text-gray-600 mt-2">Describe your project in natural language and get matching grants and funds with a score and brief report.</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-16">
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Project description</label>
          <textarea
            className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-gray-800"
            rows={5}
            placeholder="e.g., We are building an AI-powered app to improve chronic disease management for seniors in the US."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector (optional)</label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2"
                placeholder="health, climate, ai, education..."
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region (optional)</label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2"
                placeholder="US, EU, Global, State-CA..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white font-semibold px-4 py-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Finding matches...' : 'Find opportunities'}
            </button>
            <a href="/test" className="text-sm text-gray-500 hover:text-gray-700 underline">Check backend</a>
          </div>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
        )}

        {data && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {data.results.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">No opportunities found. Try broadening your description.</div>
              )}
              {data.results.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.agency}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-indigo-600">{item.match_score}%</div>
                      <div className="text-xs text-gray-500">match</div>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 text-sm">{item.why}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                    {item.categories?.map((c) => (
                      <span key={c} className="px-2 py-1 bg-gray-100 rounded-full">{c}</span>
                    ))}
                    {item.region && <span className="px-2 py-1 bg-gray-100 rounded-full">{item.region}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {item.amount && <span className="text-gray-700"><span className="font-medium">Amount:</span> {item.amount}</span>}
                    {item.deadline && <span className="text-gray-700"><span className="font-medium">Deadline:</span> {item.deadline}</span>}
                    {item.url && (
                      <a href={item.url} target="_blank" className="text-indigo-600 hover:text-indigo-700 underline">View details</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <aside className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6">
                <h4 className="text-base font-semibold text-gray-800">Report</h4>
                <p className="text-sm text-gray-600 mt-1">Detected categories: <span className="font-medium">{data.report.detected_categories.join(', ')}</span></p>
                <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                  {data.report.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-gray-500">{data.report.notes}</p>
                <p className="mt-3 text-xs text-gray-400">Generated {new Date(data.report.generated_at).toLocaleString()}</p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
