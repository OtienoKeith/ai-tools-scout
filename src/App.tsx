import { useState, useEffect } from "react"
import { Search, Loader2, ExternalLink, Clock } from "lucide-react"
import { storeMemory, getRecentMemories, getMemoryByQuery } from "./lib/mem0-api"
import { searchAITools } from "./lib/tavily-api"

interface AITool {
  id: string
  name: string
  description: string
  pricing: string
  url: string
}

function App() {
  // App State Setup - Define 5 main state variables
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<AITool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Mem0 Integration - Load recent memories on app load
  useEffect(() => {
    const loadRecentMemories = async () => {
      try {
        const memories = await getRecentMemories()
        setRecentSearches(memories)
      } catch (error) {
        console.error("Failed to load recent memories:", error)
      }
    }

    loadRecentMemories()
  }, [])

  const handleSearch = async () => {
    if (!userInput.trim()) return

    setLoading(true)
    setError(null)

    try {
      const tools = await searchAITools(userInput)
      setResults(tools)

      // Mem0 Integration - Store memory after successful search
      if (tools && tools.length > 0) {
        await storeMemory(userInput, tools)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleRecentSearchClick = async (query: string) => {
    setUserInput(query)
    setLoading(true)
    setError(null)

    try {
      // Mem0 Integration - Try to get memory by query first
      const memoryResults = await getMemoryByQuery(query)
      
      if (memoryResults) {
        // Use stored memory results
        setResults(memoryResults)
        console.log("Using stored memory for:", query)
      } else {
        // Fallback to API search
        const tools = await searchAITools(query)
        setResults(tools)
      }
    } catch (err) {
      console.error('Recent search error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
      setResults([])
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Find the Best AI Tools for Any Task</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Just tell us what you want to do, and we'll scout the web for the best AI tools.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-16">
          {/* Search Input and Button */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="What do you need help with?"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-14 text-lg px-6 bg-gray-800 border-gray-600 border-2 focus:border-blue-400 rounded-lg"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !userInput.trim()}
              className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5 mr-2 inline" />
              Search
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
              <p className="text-gray-400 text-lg">Scouting the web for the best AI tools...</p>
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

          {/* Recent Searches - Only show if there are recent searches and not currently searching */}
          {recentSearches.length > 0 && !loading && results.length === 0 && (
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-400">Recent Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results.length > 0 && !loading && (
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Top Tools We Found</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-gray-800 border-gray-700 border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-lg p-6"
                >
                  <div className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl font-bold">{tool.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getPricingColor(tool.pricing)}`}>
                        {tool.pricing}
                      </span>
                    </div>
                    <p className="text-base leading-relaxed text-gray-300">
                      {tool.description}
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg group"
                      onClick={() => window.open(tool.url, "_blank")}
                    >
                      Visit Site
                      <ExternalLink className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Section */}
        {results.length === 0 && !loading && userInput && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold mb-4">No tools found. Try another search.</h3>
            <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
              We couldn't find any AI tools matching your search. Try different keywords or check your spelling.
            </p>
            <button
              onClick={() => {
                setUserInput("")
                setResults([])
              }}
              className="h-12 px-8 text-lg border-gray-600 hover:bg-gray-800 rounded-lg border-2"
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