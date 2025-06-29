interface TavilyTool {
  id: string
  name: string
  description: string
  pricing: string
  url: string
  pricingUrl?: string
}

// Cache for recent searches to improve performance
const searchCache = new Map<string, { tools: TavilyTool[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function searchAITools(query: string): Promise<TavilyTool[]> {
  try {
    // Check cache first for faster responses
    const cacheKey = query.toLowerCase().trim()
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.tools
    }

    const apiKey = import.meta.env.VITE_TAVILY_API_KEY
    
    if (!apiKey) {
      // Return enhanced mock data for development
      const mockTools: TavilyTool[] = [
        {
          id: "1",
          name: "ChatGPT",
          description: "Advanced conversational AI for writing, coding, and problem-solving tasks with natural language processing.",
          pricing: "Freemium",
          url: "https://chat.openai.com",
          pricingUrl: "https://openai.com/pricing"
        },
        {
          id: "2",
          name: "Midjourney",
          description: "AI-powered image generation tool for creating stunning artwork and visuals from text descriptions.",
          pricing: "Paid",
          url: "https://midjourney.com",
          pricingUrl: "https://docs.midjourney.com/docs/plans"
        },
        {
          id: "3",
          name: "Notion AI",
          description: "AI writing assistant integrated directly into your workspace for notes, documents, and collaboration.",
          pricing: "Paid",
          url: "https://notion.so",
          pricingUrl: "https://www.notion.so/pricing"
        },
        {
          id: "4",
          name: "Jasper",
          description: "AI content creation platform for marketing copy, blog posts, and creative writing with templates.",
          pricing: "Paid",
          url: "https://jasper.ai",
          pricingUrl: "https://jasper.ai/pricing"
        },
        {
          id: "5",
          name: "Copy.ai",
          description: "AI copywriting tool that generates marketing content, social media posts, and business copy.",
          pricing: "Freemium",
          url: "https://copy.ai",
          pricingUrl: "https://copy.ai/pricing"
        },
        {
          id: "6",
          name: "Claude",
          description: "AI assistant by Anthropic for writing, analysis, and creative tasks with advanced reasoning.",
          pricing: "Freemium",
          url: "https://claude.ai",
          pricingUrl: "https://claude.ai/pricing"
        }
      ]
      
      // Cache the mock results
      searchCache.set(cacheKey, { tools: mockTools, timestamp: Date.now() })
      return mockTools
    }

    // Simple, direct search query
    const searchQuery = `AI tools for ${query} - find specific software applications and tools`

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: searchQuery,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        max_results: 10,
        topic: "ai tools software applications"
      })
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()
    const tools: TavilyTool[] = [];

    // Simple parsing from search results
    if (data.results && Array.isArray(data.results)) {
      for (const result of data.results) {
        if (tools.length >= 6) break;

        const title = result.title || "";
        const url = result.url || "";
        const content = result.content || "";

        // Skip if it's clearly not a tool
        if (!url || url.includes('blog') || url.includes('article') || url.includes('news')) {
          continue;
        }

        // Extract tool name from title or URL
        let toolName = title.split(/[\-|\|]/)[0].trim();
        if (!toolName || toolName.length < 2) {
          try {
            const urlObj = new URL(url);
            toolName = urlObj.hostname.replace(/^www\./, '').split('.')[0];
            toolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);
          } catch (e) {
            toolName = "Unknown Tool";
          }
        }

        // Determine pricing from content
        let pricing = "Unknown";
        const lowerContent = content.toLowerCase();
        if (/\b(free|freemium)\b/.test(lowerContent)) {
          pricing = "Freemium";
        } else if (/\b(paid|premium|enterprise|subscription|\$)\b/.test(lowerContent)) {
          pricing = "Paid";
        }

        // Generate pricing URL
        let pricingUrl = undefined;
        if (url && !url.includes('/pricing') && !url.includes('/plans')) {
          try {
            const urlObj = new URL(url);
            pricingUrl = `${urlObj.origin}/pricing`;
          } catch (e) {}
        }

        // Avoid duplicates
        if (!tools.some(t => t.url === url)) {
          tools.push({
            id: tools.length.toString(),
            name: toolName,
            description: title || content.substring(0, 100) + "...",
            pricing,
            url,
            pricingUrl
          });
        }
      }
    }

    // Add fallback tools if we don't have enough
    if (tools.length < 3) {
      const fallbackTools: TavilyTool[] = [
        {
          id: "fallback1",
          name: "ChatGPT",
          description: "Advanced conversational AI for writing, coding, and problem-solving tasks.",
          pricing: "Freemium",
          url: "https://chat.openai.com",
          pricingUrl: "https://openai.com/pricing"
        },
        {
          id: "fallback2",
          name: "Claude",
          description: "AI assistant by Anthropic for writing, analysis, and creative tasks.",
          pricing: "Freemium",
          url: "https://claude.ai",
          pricingUrl: "https://claude.ai/pricing"
        },
        {
          id: "fallback3",
          name: "Jasper",
          description: "AI content creation platform for marketing copy and creative writing.",
          pricing: "Paid",
          url: "https://jasper.ai",
          pricingUrl: "https://jasper.ai/pricing"
        }
      ];

      // Add fallback tools that aren't already in results
      for (const fallbackTool of fallbackTools) {
        if (tools.length >= 3) break;
        if (!tools.some(t => t.name.toLowerCase() === fallbackTool.name.toLowerCase())) {
          tools.push(fallbackTool);
        }
      }
    }

    // Cache the results
    searchCache.set(cacheKey, { tools, timestamp: Date.now() })

    return tools
  } catch (error) {
    console.error("Search API error:", error)
    throw new Error('Failed to search for tools')
  }
} 