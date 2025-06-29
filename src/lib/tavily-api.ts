export interface TavilyTool {
  id: string;
  name: string;
  description: string;
  pricing: string;
  url: string;
}

interface TavilyResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

export async function searchAITools(query: string): Promise<TavilyTool[]> {
  const apiKey = import.meta.env.VITE_TAVILY_API_KEY;
  
  if (!apiKey) {
    // Fallback to mock data for development
    console.warn("Tavily API key not found, using mock data");
    return getMockTools(query);
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: `List 5 AI tools for ${query}. For each, provide: Name, official website URL, a brief description (1 line), and pricing. IMPORTANT: Return ONLY direct links to the AI tool's official homepage. DO NOT include blog posts, articles, reviews, or aggregator sites. Prioritize official product pages.`,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: 5
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    
    const tools: TavilyTool[] = [];
    const contentKeywords = /\b(blog|article|review|news|story|post|guide|tutorial|top\s*\d*|best\s*\d*|alternatives|comparison|vs|roundup|examples|learn|how\s*to|what\s*is|benefits|disadvantages|forum|community|discussion|trends|insights|reports|studies|whitepaper|ebook|interview|webinar|course|template|checklist|ultimate\s*guide)\b/i;
    const domainKeywordsToAvoid = /\b(medium|dev\.to|wordpress|blogspot|substack|ghost|quora|reddit|youtube|vimeo|facebook|twitter|linkedin|pinterest|instagram|tiktok|news\.|forum\.|\.gov|\.edu|\.org(?!\.ai))\b/i;
    const pathKeywordsToAvoid = /\/(blog|article|news|post|guide|review|tutorial|category|tag|archive|docs|support|help|faq|forum|community|events|webinar|case-studies|whitepaper|resources|downloads|careers|about|contact|press|terms|privacy|policy|login|signup|signin|dashboard)\//i;
    const commonFileExtensions = /\.(pdf|docx|xlsx|pptx|zip|rar|exe|dmg|mp4|mov|avi|jpg|png|gif|webp|svg)$/i;
    const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);

    const isValidToolUrl = (url: string): boolean => {
      try {
        const parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false;
        if (domainKeywordsToAvoid.test(parsedUrl.hostname)) return false;
        if (pathKeywordsToAvoid.test(parsedUrl.pathname)) return false;
        if (commonFileExtensions.test(parsedUrl.pathname)) return false;
        if (parsedUrl.pathname.split('/').length > 4 && !parsedUrl.hostname.startsWith('app.')) return false;
        return true;
      } catch (e) {
        return false;
      }
    };

    if (data.answer) {
      const lines = data.answer.split('\n');
      for (const line of lines) {
        if (tools.length >= 5) break;
        if (contentKeywords.test(line)) continue;

        const toolRegex = /-\s*Name:\s*(.+?)\s*-\s*URL:\s*(https?:\/\/[^\s]+)\s*-\s*Description:\s*(.+?)\s*-\s*Pricing:\s*(.+)/i;
        const simplerToolRegex = /-\s*(.+?)\s*-\s*(https?:\/\/[^\s]+)/i;

        let match = line.match(toolRegex);
        if (match && match[1] && match[2] && match[3] && match[4]) {
          const name = match[1].trim();
          const url = match[2].trim();
          const description = match[3].trim();
          const pricing = match[4].trim();

          if (!contentKeywords.test(name) && !contentKeywords.test(description) && isValidToolUrl(url)) {
            tools.push({ id: generateId(), name, description, pricing, url });
          }
        } else {
          match = line.match(simplerToolRegex);
          if (match && match[1] && match[2]) {
            const name = match[1].trim();
            const url = match[2].trim();
            if (!contentKeywords.test(name) && isValidToolUrl(url)) {
                const remainingLine = line.replace(name, "").replace(url, "").replace(/-/g, "").trim();
                const pricingGuess = remainingLine.match(/\b(free|paid|freemium|subscription|\$\d+)\b/i)?.[0] || "Unknown";
                const descriptionGuess = remainingLine.replace(pricingGuess, "").trim() || "No description available.";
                tools.push({ id: generateId(), name, description: descriptionGuess, pricing: pricingGuess, url });
            }
          }
        }
      }
    }

    if (tools.length < 5 && data.results) {
      for (const result of data.results) {
        if (tools.length >= 5) break;

        const title = result.title || "";
        const url = result.url || "";
        const contentSnippet = (result.content || "").substring(0, 200);

        if (contentKeywords.test(title) || contentKeywords.test(contentSnippet) || !isValidToolUrl(url)) {
          continue;
        }

        if (!tools.some(t => t.url === url)) {
          const toolName = title.split(/[-|–—]/)[0].trim();
          let pricing = "Unknown";
          const lowerContent = contentSnippet.toLowerCase();
          if (/\b(free|freemium)\b/i.test(lowerContent)) pricing = "Freemium";
          else if (/\b(paid|subscription|\$\d+|enterprise|premium|pro)\b/i.test(lowerContent)) pricing = "Paid";

          tools.push({
            id: generateId(),
            name: toolName,
            description: contentSnippet + "...",
            pricing,
            url
          });
        }
      }
    }
    return tools.slice(0, 5);
  } catch (error) {
    console.error("Tavily API error:", error);
    // Fallback to mock data on error
    return getMockTools(query);
  }
}

// Mock data fallback
function getMockTools(query: string): TavilyTool[] {
  const mockTools: TavilyTool[] = [
    {
      id: "1",
      name: "ChatGPT",
      description: "Advanced conversational AI for writing, coding, and problem-solving tasks.",
      pricing: "Freemium",
      url: "https://chat.openai.com",
    },
    {
      id: "2",
      name: "Midjourney",
      description: "AI-powered image generation tool for creating stunning artwork and visuals.",
      pricing: "Paid",
      url: "https://midjourney.com",
    },
    {
      id: "3",
      name: "Notion AI",
      description: "AI writing assistant integrated directly into your workspace and notes.",
      pricing: "Paid",
      url: "https://notion.so",
    },
  ];
  
  // Filter based on query for more realistic behavior
  return mockTools.filter(tool => 
    tool.name.toLowerCase().includes(query.toLowerCase()) ||
    tool.description.toLowerCase().includes(query.toLowerCase())
  );
} 