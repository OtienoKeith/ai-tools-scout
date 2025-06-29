import { useState } from "react"
import { Search, Loader2, ExternalLink, DollarSign } from "lucide-react"
import { searchAITools } from "../lib/tavily-api"

interface AITool {
  id: string
  name: string
  description: string
  pricing: string
  url: string
  pricingUrl?: string
}

function App() {
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<AITool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query?: string) => {
    const searchQuery = query || userInput
    if (!searchQuery.trim()) return
    setLoading(true)
    setError(null)
    try {
      const tools = await searchAITools(searchQuery)
      setResults(tools)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setUserInput(example)
    handleSearch(example)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing.toLowerCase()) {
      case "free":
        return "bg-green-900 text-green-300"
      case "paid":
        return "bg-blue-900 text-blue-300"
      case "freemium":
        return "bg-purple-900 text-purple-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  // Show all results (up to 6)
  const displayResults = results.slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Find the Best AI Tools for Any Task</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Discover the perfect AI tools to boost your productivity. From content creation to data analysis, 
            we'll help you find the right tools for your needs.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-400 text-sm">Find tools based on what you want to accomplish, not just keywords</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">Pricing Info</h3>
              <p className="text-gray-400 text-sm">See pricing models and get direct links to pricing pages</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Fast Results</h3>
              <p className="text-gray-400 text-sm">Get curated results quickly with intelligent caching</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-16">
          {/* Main Search */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-6">What do you want to accomplish?</h2>
            
            {/* Search Input and Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="e.g., Create images, Write content, Analyze data..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-16 text-xl px-8 bg-gray-800 border-gray-600 border-2 focus:border-blue-400 rounded-xl shadow-lg"
                disabled={loading}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !userInput.trim()}
                className="h-16 px-10 text-xl font-semibold bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Search className="w-6 h-6 mr-3 inline" />
                Search
              </button>
            </div>

            {/* Quick Examples */}
            <div className="mb-6">
              <p className="text-gray-400 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Text summarization",
                  "Image generation",
                  "Speech-to-text transcription",
                  "Data visualization",
                  "Grammar correction"
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-400 text-lg">Finding the best AI tools for you...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-center py-6">
              <div className="text-red-500 text-lg mb-2">⚠️ Search Error</div>
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 h-10 px-6 text-sm bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {displayResults.length > 0 && !loading && (
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Top Tools We Found ({displayResults.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayResults.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-gray-800 border-gray-700 border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-lg p-6 relative"
                >
                  {/* Pricing Badge Top Right */}
                  <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded ${getPricingColor(tool.pricing)}`}>{tool.pricing}</span>
                  {/* Tool Name */}
                  <h3 className="text-2xl font-bold mb-2">{tool.name}</h3>
                  {/* Description */}
                  <p className="text-base leading-relaxed text-gray-300 mb-6">{tool.description}</p>
                  {/* Main Action Button: Go to Pricing if available, else homepage */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg group"
                      onClick={() => window.open(tool.pricingUrl || tool.url, "_blank")}
                    >
                      {tool.pricingUrl ? "View Pricing" : "Visit Site"}
                      <ExternalLink className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Section */}
        {displayResults.length === 0 && !loading && userInput && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😕</div>
            <h3 className="text-3xl font-bold mb-4">Oops! We couldn't find any AI tools for "{userInput}".</h3>
            <p className="text-lg text-gray-300 mb-6 max-w-xl mx-auto">
              🔍 You can try a different keyword like:<br/>
              <span className="inline-block mt-2">
                ✏️ <span className="font-semibold">writing</span> &nbsp;|&nbsp; 🎨 <span className="font-semibold">design</span> &nbsp;|&nbsp; 📊 <span className="font-semibold">data analysis</span> &nbsp;|&nbsp; 🤖 <span className="font-semibold">automation</span>
              </span>
              <br/><br/>
              Or do a manual search — sometimes the best tools are just one click away! 🧭
            </p>
            <button
              onClick={() => {
                setUserInput("")
                setResults([])
              }}
              className="h-12 px-8 text-lg border border-gray-600 hover:bg-gray-800 rounded-lg mt-4"
            >
              Start New Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App 