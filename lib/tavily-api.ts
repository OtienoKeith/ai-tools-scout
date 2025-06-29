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

    const apiKey = process.env.VITE_TAVILY_API_KEY
    
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
        }
      ]
      
      // Cache the mock results
      searchCache.set(cacheKey, { tools: mockTools, timestamp: Date.now() })
      return mockTools
    }

    // Enhanced search query for better results
    const enhancedQuery = `Find 5-7 specific AI software tools or applications for "${query}". For each tool, provide: 1. Exact tool name. 2. Brief description of its main function (1-2 sentences). 3. Pricing model (Free, Freemium, Paid, Subscription, Enterprise). 4. Direct homepage URL. 5. Pricing page URL if available. Focus ONLY on actual software tools, not articles, blogs, or reviews. Return in structured format.`

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: enhancedQuery,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: 8, // Increased for better coverage
        topic: "ai tools software applications"
      })
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()
    const tools: TavilyTool[] = [];

    // Enhanced parsing with better structure detection
    if (data.answer) {
      const lines = data.answer.split('\n').filter(line => line.trim() !== '');
      let currentTool: Partial<TavilyTool> = {};

      for (const line of lines) {
        if (tools.length >= 5) break; // Aim for 5 tools to ensure we have 3 good ones

        const trimmedLine = line.trim();
        
        // Skip non-tool content
        if (/\b(blog|article|news|review|guide|tutorial|how to|what is|why use)\b/i.test(trimmedLine)) {
          continue;
        }

        // Enhanced pattern matching
        const nameMatch = trimmedLine.match(/^(?:1\.|-\s*)?(?:Name|Tool):\s*(.+)/i) || 
                         trimmedLine.match(/^([^-:]+?)\s*-\s*(?:AI Tool|Software)/i) ||
                         trimmedLine.match(/^([A-Z][a-zA-Z0-9\s]+?)(?:\s*[-|]\s*|$)/);

        const descMatch = trimmedLine.match(/^(?:2\.|-\s*)?(?:Description|Function):\s*(.+)/i);
        const pricingMatch = trimmedLine.match(/^(?:3\.|-\s*)?(?:Pricing|Cost):\s*(.+)/i);
        const urlMatch = trimmedLine.match(/^(?:4\.|-\s*)?(?:URL|Link|Homepage):\s*(https?:\/\/[^\s]+)/i);
        const pricingUrlMatch = trimmedLine.match(/^(?:5\.|-\s*)?(?:Pricing URL|Pricing Link):\s*(https?:\/\/[^\s]+)/i);

        if (nameMatch && nameMatch[1]) {
          // Save previous tool if complete
          if (currentTool.name && currentTool.url && !tools.some(t => t.url === currentTool.url)) {
            tools.push({
              id: tools.length.toString(),
              ...currentTool
            } as TavilyTool);
          }
          currentTool = { 
            name: nameMatch[1].trim(), 
            description: "AI tool for various tasks", 
            pricing: "Unknown" 
          };
        } else if (descMatch && descMatch[1] && currentTool.name) {
          currentTool.description = descMatch[1].trim();
        } else if (pricingMatch && pricingMatch[1] && currentTool.name) {
          currentTool.pricing = pricingMatch[1].trim();
        } else if (urlMatch && urlMatch[1] && currentTool.name) {
          currentTool.url = urlMatch[1].trim();
        } else if (pricingUrlMatch && pricingUrlMatch[1] && currentTool.name) {
          currentTool.pricingUrl = pricingUrlMatch[1].trim();
        }
      }

      // Add the last tool if complete
      if (currentTool.name && currentTool.url && !tools.some(t => t.url === currentTool.url)) {
        tools.push({
          id: tools.length.toString(),
          ...currentTool
        } as TavilyTool);
      }
    }

    // Enhanced fallback parsing from results (relaxed filtering, blog parsing)
    if (tools.length < 6 && data.results && Array.isArray(data.results)) {
      for (const result of data.results) {
        if (tools.length >= 10) break; // Try to get up to 10 for deduplication

        const title = result.title || "";
        const url = result.url || "";
        const content = result.content || "";

        // If it's a blog/listicle, try to extract tool names/URLs from the content
        if (/\b(blog|list|top|best|tools|apps|ai)\b/i.test(title) && /\b(list|top|best|tools|apps|ai)\b/i.test(content)) {
          // Try to extract lines that look like tool listings
          const lines = content.split(/\n|\r|\d+\.|\*|\-/).map(l => l.trim()).filter(l => l.length > 2);
          for (const line of lines) {
            // Try to extract [Tool Name](URL) or Tool Name - URL
            let name = "";
            let toolUrl = "";
            let desc = "";
            const mdMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
            if (mdMatch) {
              name = mdMatch[1];
              toolUrl = mdMatch[2];
              desc = line.replace(mdMatch[0], '').trim();
            } else {
              // Try: Tool Name - https://...
              const dashMatch = line.match(/^([A-Za-z0-9\s\-\_\.]+)\s*[-:–]\s*(https?:\/\/[^\s]+)(.*)$/);
              if (dashMatch) {
                name = dashMatch[1].trim();
                toolUrl = dashMatch[2].trim();
                desc = dashMatch[3]?.trim() || '';
              }
            }
            // Fallback: just a URL
            if (!name && line.match(/https?:\/\//)) {
              try {
                const urlObj = new URL(line.match(/https?:\/\/[^\s]+/)![0]);
                name = urlObj.hostname.replace(/^www\./, '').split('.')[0];
                name = name.charAt(0).toUpperCase() + name.slice(1);
                toolUrl = urlObj.href;
              } catch {}
            }
            if (name && toolUrl && !tools.some(t => t.url === toolUrl)) {
              tools.push({
                id: tools.length.toString(),
                name,
                description: desc || title,
                pricing: "Unknown",
                url: toolUrl,
                pricingUrl: toolUrl + (toolUrl.endsWith('/') ? 'pricing' : '/pricing')
              });
              if (tools.length >= 6) break;
            }
          }
          if (tools.length >= 6) break;
          continue;
        }

        // Otherwise, treat as a direct tool result
        let toolName = title.split(/[\-|\|]/)[0].trim();
        if (!toolName || toolName.length < 2 || /voice cloning|ai tool|minutes|home|page|website|app|clone/i.test(toolName)) {
          try {
            const urlObj = new URL(url);
            toolName = urlObj.hostname.replace(/^www\./, '').split('.')[0];
            toolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);
          } catch (e) {
            toolName = "Unknown";
          }
        }

        let pricing = "Unknown";
        const lowerContent = content.toLowerCase();
        if (/\b(free|freemium)\b/.test(lowerContent)) pricing = "Freemium";
        else if (/\b(paid|premium|enterprise|subscription|\$)\b/.test(lowerContent)) pricing = "Paid";

        let pricingUrl = undefined;
        if (url && !url.includes('/pricing') && !url.includes('/plans')) {
          try {
            const urlObj = new URL(url);
            pricingUrl = `${urlObj.origin}/pricing`;
          } catch (e) {}
        }

        if (!tools.some(t => t.url === url)) {
          tools.push({
            id: tools.length.toString(),
            name: toolName,
            description: title,
            pricing,
            url,
            pricingUrl
          });
        }
        if (tools.length >= 6) break;
      }
    }

    // Ensure we have at least 3 results by adding fallback tools if needed
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

    // Deduplicate and limit to 6 results
    const uniqueTools = Array.from(new Map(tools.map(tool => [tool.url, tool])).values()).slice(0, 6);

    // Cache the results
    searchCache.set(cacheKey, { tools: uniqueTools, timestamp: Date.now() })

    return uniqueTools
  } catch (error) {
    console.error("Search API error:", error)
    throw new Error('Failed to search for tools')
  }
} 