"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Search, Loader2, ExternalLink, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storeMemory, getRecentMemories, getMemoryByQuery } from "@/lib/mem0-api"

interface AITool {
  id: string
  name: string
  description: string
  pricing: string
  url: string
  pricingUrl?: string
}

export default function AIToolsScout() {
  // Step 1: App State Setup - Define 5 main state variables
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<AITool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Step 3: Mem0 Integration - Load recent memories on app load
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
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userInput }),
      })

      if (!response.ok) {
        throw new Error('Failed to search for tools')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setResults(data.tools)

      // Step 3: Mem0 Integration - Store memory after successful search
      if (data.tools && data.tools.length > 0) {
        await storeMemory(userInput, data.tools)
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
      // Step 3: Mem0 Integration - Try to get memory by query first
      const memoryResults = await getMemoryByQuery(query)
      
      if (memoryResults) {
        // Use stored memory results
        setResults(memoryResults)
        console.log("Using stored memory for:", query)
      } else {
        // Fallback to API search
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        })

        if (!response.ok) {
          throw new Error('Failed to search for tools')
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        setResults(data.tools)
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
            <Input
              type="text"
              placeholder="What do you need help with?"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-14 text-lg px-6 bg-gray-800 border-gray-600 border-2 focus:border-blue-400"
              disabled={loading}
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !userInput.trim()}
              className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
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
              <Button
                onClick={() => setError(null)}
                className="mt-4 h-10 px-6 text-sm bg-red-600 hover:bg-red-700"
              >
                Dismiss
              </Button>
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
                <Card
                  key={tool.id}
                  className="bg-gray-800 border-gray-700 border-2 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <CardTitle className="text-2xl font-bold">{tool.name}</CardTitle>
                      <Badge className={`${getPricingColor(tool.pricing)} font-semibold`}>{tool.pricing}</Badge>
                    </div>
                    <CardDescription className="text-base leading-relaxed text-gray-300">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Pricing Information */}
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                        <span className="text-sm font-medium text-gray-300">Pricing</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{tool.pricing}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors group"
                        onClick={() => window.open(tool.url, "_blank")}
                      >
                        Visit Site
                        <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      
                      {tool.pricingUrl && (
                        <Button
                          variant="outline"
                          className="h-12 px-4 text-lg font-semibold border-gray-600 hover:bg-gray-700 transition-colors group"
                          onClick={() => window.open(tool.pricingUrl, "_blank")}
                        >
                          <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
            <Button
              variant="outline"
              onClick={() => {
                setUserInput("")
                setResults([])
              }}
              className="h-12 px-8 text-lg border-gray-600 hover:bg-gray-800"
            >
              Start New Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
