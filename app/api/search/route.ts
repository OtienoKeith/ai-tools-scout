import { NextRequest, NextResponse } from 'next/server'

interface TavilyTool {
  name: string
  description: string
  pricing: string
  url: string
}

interface TavilyResponse {
  results: Array<{
    title: string
    url: string
    content: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const apiKey = process.env.TAVILY_API_KEY
    
    if (!apiKey) {
      // Return mock data for development
      const mockTools: TavilyTool[] = [
        {
          name: "ChatGPT",
          description: "Advanced conversational AI for writing, coding, and problem-solving tasks.",
          pricing: "Freemium",
          url: "https://chat.openai.com",
        },
        {
          name: "Midjourney",
          description: "AI-powered image generation tool for creating stunning artwork and visuals.",
          pricing: "Paid",
          url: "https://midjourney.com",
        },
        {
          name: "Notion AI",
          description: "AI writing assistant integrated directly into your workspace and notes.",
          pricing: "Paid",
          url: "https://notion.so",
        },
      ]
      
      return NextResponse.json({ tools: mockTools })
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: `${query} AI tools software applications`,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        max_results: 10
      })
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data: TavilyResponse = await response.json()
    
    // Extract and format tools from search results
    const tools: TavilyTool[] = []
    
    for (const result of data.results.slice(0, 3)) {
      // Extract tool information from the search result
      const toolName = result.title.split(' - ')[0] || result.title.split(' | ')[0] || result.title
      const description = result.content.substring(0, 200) + "..."
      
      // Try to determine pricing from content
      let pricing = "Unknown"
      const content = result.content.toLowerCase()
      if (content.includes("free") || content.includes("freemium")) {
        pricing = "Freemium"
      } else if (content.includes("paid") || content.includes("subscription")) {
        pricing = "Paid"
      }

      tools.push({
        name: toolName,
        description,
        pricing,
        url: result.url
      })
    }

    return NextResponse.json({ tools })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: 'Failed to search for tools' }, { status: 500 })
  }
} 