import { tavily } from "@tavily/core";

interface TavilyTool {
  id: string;
  name: string;
  description: string;
  pricing: string;
  url: string;
  pricingUrl?: string;
}

// Cache for recent searches to improve performance
const searchCache = new Map<string, { tools: TavilyTool[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function searchAITools(query: string): Promise<TavilyTool[]> {
  try {
    // Check cache first for faster responses
    const cacheKey = query.toLowerCase().trim();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.tools;
    }

    const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
    
    if (!apiKey) {
      // Return enhanced mock data for development
      const mockTools: TavilyTool[] = [
        {
          id: "chatgpt",
          name: "ChatGPT",
          description: "Advanced conversational AI for writing, coding, and problem-solving tasks with natural language processing.",
          pricing: "Freemium",
          url: "https://chat.openai.com",
          pricingUrl: "https://openai.com/pricing"
        },
        {
          id: "midjourney",
          name: "Midjourney",
          description: "AI-powered image generation tool for creating stunning artwork and visuals from text descriptions.",
          pricing: "Paid",
          url: "https://midjourney.com",
          pricingUrl: "https://docs.midjourney.com/docs/plans"
        },
        {
          id: "notion-ai",
          name: "Notion AI",
          description: "AI writing assistant integrated directly into your workspace for notes, documents, and collaboration.",
          pricing: "Paid",
          url: "https://notion.so",
          pricingUrl: "https://www.notion.so/pricing"
        },
        {
          id: "jasper",
          name: "Jasper",
          description: "AI content creation platform for marketing copy, blog posts, and creative writing with templates.",
          pricing: "Paid",
          url: "https://jasper.ai",
          pricingUrl: "https://jasper.ai/pricing"
        },
        {
          id: "copy-ai",
          name: "Copy.ai",
          description: "AI copywriting tool that generates marketing content, social media posts, and business copy.",
          pricing: "Freemium",
          url: "https://copy.ai",
          pricingUrl: "https://copy.ai/pricing"
        },
        {
          id: "grammarly",
          name: "Grammarly",
          description: "AI-powered writing assistant that helps improve grammar, style, and tone in real-time.",
          pricing: "Freemium",
          url: "https://grammarly.com",
          pricingUrl: "https://www.grammarly.com/premium"
        }
      ];
      
      // Cache the mock results
      searchCache.set(cacheKey, { tools: mockTools, timestamp: Date.now() });
      return mockTools;
    }

    // Initialize Tavily client
    const client = tavily({ apiKey });

    // Enhanced search query for better AI tool discovery
    const enhancedQuery = `Find 6-8 specific AI software tools or applications for "${query}". For each tool, provide: 1. Exact tool name. 2. Brief description of its main function (1-2 sentences). 3. Pricing model (Free, Freemium, Paid, Subscription, Enterprise). 4. Direct homepage URL. 5. Pricing page URL if available. Focus ONLY on actual software tools, not articles, blogs, or reviews. Return in structured format.`;

    // Use Tavily Search with optimized parameters
    const response = await client.search({
      query: enhancedQuery,
      searchDepth: "advanced", // Better content extraction
      maxResults: 10, // Get more results to ensure we have enough tools
      includeAnswer: "advanced", // Get detailed answer for better parsing
      includeRawContent: "markdown", // Get full content for better tool extraction
      chunksPerSource: 3, // More content chunks per source
      topic: "general", // General search for AI tools
      includeDomains: [], // No domain restrictions
      excludeDomains: ["medium.com", "dev.to", "hashnode.dev"] // Exclude blog platforms
    });

    const tools: TavilyTool[] = [];

    // Parse the answer for structured tool information
    if (response.answer) {
      const lines = response.answer.split('\n').filter(line => line.trim() !== '');
      let currentTool: Partial<TavilyTool> = {};

      for (const line of lines) {
        if (tools.length >= 6) break; // Limit to 6 tools

        const trimmedLine = line.trim();
        
        // Skip non-tool content
        if (/\b(blog|article|news|review|guide|tutorial|how to|what is|why use)\b/i.test(trimmedLine)) {
          continue;
        }

        // Enhanced pattern matching for tool extraction
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
            tools.push(currentTool as TavilyTool);
          }
          currentTool = { 
            id: nameMatch[1].trim().toLowerCase().replace(/\s+/g, '-'),
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

      // Add the last processed tool if it's complete
      if (tools.length < 6 && currentTool.name && currentTool.url && !tools.some(t => t.url === currentTool.url)) {
        tools.push(currentTool as TavilyTool);
      }
    }

    // Fallback: Parse from search results if answer parsing yields too few tools
    if (tools.length < 3 && response.results && Array.isArray(response.results)) {
      for (const result of response.results) {
        if (tools.length >= 6) break;

        const title = result.title || "";
        const url = result.url || "";
        const content = result.content || "";

        // Skip if it looks like a blog/article
        if (/\b(blog|article|news|review|guide|tutorial|how to|what is|why use)\b/i.test(title) ||
            /\b(blog|article|news|review|guide|tutorial|how to|what is|why use)\b/i.test(content)) {
          continue;
        }

        // Extract tool name from title or content
        let toolName = title;
        if (!toolName || toolName.length < 2) {
          // Try to extract from content
          const nameMatch = content.match(/^([A-Z][a-zA-Z0-9\s]+?)(?:\s*[-|]\s*|$)/);
          if (nameMatch) {
            toolName = nameMatch[1].trim();
          }
        }

        if (toolName && url && !tools.some(t => t.url === url)) {
          tools.push({
            id: toolName.toLowerCase().replace(/\s+/g, '-'),
            name: toolName,
            description: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
            pricing: "Unknown",
            url: url
          });
        }
      }
    }

    // Add fallback tools if we still don't have enough
    const fallbackTools: TavilyTool[] = [
      {
        id: "chatgpt",
        name: "ChatGPT",
        description: "Advanced conversational AI for writing, coding, and problem-solving tasks.",
        pricing: "Freemium",
        url: "https://chat.openai.com",
        pricingUrl: "https://openai.com/pricing"
      },
      {
        id: "midjourney",
        name: "Midjourney",
        description: "AI-powered image generation tool for creating stunning artwork from text descriptions.",
        pricing: "Paid",
        url: "https://midjourney.com",
        pricingUrl: "https://docs.midjourney.com/docs/plans"
      },
      {
        id: "notion-ai",
        name: "Notion AI",
        description: "AI writing assistant integrated into your workspace for notes and collaboration.",
        pricing: "Paid",
        url: "https://notion.so",
        pricingUrl: "https://www.notion.so/pricing"
      }
    ];

    // Add fallback tools that aren't already in results
    for (const fallbackTool of fallbackTools) {
      if (tools.length >= 6) break;
      if (!tools.some(t => t.name.toLowerCase() === fallbackTool.name.toLowerCase())) {
        tools.push(fallbackTool);
      }
    }

    // Ensure we have unique tools
    const uniqueTools = tools.filter((tool, index, self) => 
      index === self.findIndex(t => t.url === tool.url)
    );

    // Cache the results
    searchCache.set(cacheKey, { tools: uniqueTools, timestamp: Date.now() });

    return uniqueTools;
  } catch (error) {
    console.error("Tavily search error:", error);
    
    // Return fallback tools on error
    return [
      {
        id: "chatgpt",
        name: "ChatGPT",
        description: "Advanced conversational AI for writing, coding, and problem-solving tasks.",
        pricing: "Freemium",
        url: "https://chat.openai.com",
        pricingUrl: "https://openai.com/pricing"
      },
      {
        id: "midjourney",
        name: "Midjourney",
        description: "AI-powered image generation tool for creating stunning artwork from text descriptions.",
        pricing: "Paid",
        url: "https://midjourney.com",
        pricingUrl: "https://docs.midjourney.com/docs/plans"
      },
      {
        id: "notion-ai",
        name: "Notion AI",
        description: "AI writing assistant integrated into your workspace for notes and collaboration.",
        pricing: "Paid",
        url: "https://notion.so",
        pricingUrl: "https://www.notion.so/pricing"
      }
    ];
  }
} 