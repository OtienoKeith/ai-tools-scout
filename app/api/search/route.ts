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
        query: `List 5 AI tools for ${query}. For each, provide: Name, official website URL, a brief description (1 line), and pricing. IMPORTANT: Return ONLY direct links to the AI tool's official homepage. DO NOT include blog posts, articles, reviews, or aggregator sites. Prioritize official product pages.`,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: 5
      })
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()
    
    // TODO: Implement new parsing logic based on Tavily's answer
    // For now, let's assume the answer is a string that needs parsing,
    // or if data.results still exists and is structured, use that.
    // This will be addressed in the next step.

    const tools: TavilyTool[] = [];
    // Stricter keywords for identifying non-tool content
    const contentKeywords = /\b(blog|article|review|news|story|post|guide|tutorial|top\s*\d*|best\s*\d*|alternatives|comparison|vs|roundup|examples|learn|how\s*to|what\s*is|benefits|disadvantages|forum|community|discussion|trends|insights|reports|studies|whitepaper|ebook|interview|webinar|course|template|checklist|ultimate\s*guide)\b/i;
    const domainKeywordsToAvoid = /\b(medium|dev\.to|wordpress|blogspot|substack|ghost|quora|reddit|youtube|vimeo|facebook|twitter|linkedin|pinterest|instagram|tiktok|news\.|forum\.|\.gov|\.edu|\.org(?!\.ai))\b/i;
    // More specific check for URLs that are likely content rather than homepages
    const pathKeywordsToAvoid = /\/(blog|article|news|post|guide|review|tutorial|category|tag|archive|docs|support|help|faq|forum|community|events|webinar|case-studies|whitepaper|resources|downloads|careers|about|contact|press|terms|privacy|policy|login|signup|signin|dashboard)\//i;
    const commonFileExtensions = /\.(pdf|docx|xlsx|pptx|zip|rar|exe|dmg|mp4|mov|avi|jpg|png|gif|webp|svg)$/i;

    // Helper to validate URL structure (basic)
    const isValidToolUrl = (url: string): boolean => {
      try {
        const parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false;
        if (domainKeywordsToAvoid.test(parsedUrl.hostname)) return false;
        if (pathKeywordsToAvoid.test(parsedUrl.pathname)) return false;
        if (commonFileExtensions.test(parsedUrl.pathname)) return false;
        // Avoid excessively long paths unless they are common for app subdomains
        if (parsedUrl.pathname.split('/').length > 4 && !parsedUrl.hostname.startsWith('app.')) return false;
        return true;
      } catch (e) {
        return false; // Invalid URL
      }
    };

    if (data.answer) {
      const lines = data.answer.split('\n');
      for (const line of lines) {
        if (tools.length >= 5) break;
        if (contentKeywords.test(line)) continue;

        // Regex to capture: "- Name: (Description) - Pricing: (Price) - Link: (URL)" or similar
        // Making it more flexible for variations in Tavily's output.
        const toolRegex = /-\s*Name:\s*(.+?)\s*-\s*URL:\s*(https?:\/\/[^\s]+)\s*-\s*Description:\s*(.+?)\s*-\s*Pricing:\s*(.+)/i;
        // Simpler regex if the above fails, focusing on Name and URL as primary.
        const simplerToolRegex = /-\s*(.+?)\s*-\s*(https?:\/\/[^\s]+)/i;

        let match = line.match(toolRegex);
        if (match && match[1] && match[2] && match[3] && match[4]) {
          const name = match[1].trim();
          const url = match[2].trim();
          const description = match[3].trim();
          const pricing = match[4].trim();

          if (!contentKeywords.test(name) && !contentKeywords.test(description) && isValidToolUrl(url)) {
            tools.push({ name, description, pricing, url });
          }
        } else {
          match = line.match(simplerToolRegex);
          if (match && match[1] && match[2]) {
            const name = match[1].trim();
            const url = match[2].trim();
             if (!contentKeywords.test(name) && isValidToolUrl(url)) {
                // Try to extract description and pricing if they are on the same line but not perfectly formatted
                const remainingLine = line.replace(name, "").replace(url, "").replace(/-/g, "").trim();
                const pricingGuess = remainingLine.match(/\b(free|paid|freemium|subscription|\$\d+)\b/i)?.[0] || "Unknown";
                const descriptionGuess = remainingLine.replace(pricingGuess, "").trim() || "No description available.";
                tools.push({ name, description: descriptionGuess, pricing: pricingGuess, url });
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

        // Ensure it's not already added from answer parsing (simple URL check)
        if (!tools.some(t => t.url === url)) {
          const toolName = title.split(/[-|–—]/)[0].trim(); // Get part before a delimiter
          let pricing = "Unknown";
          const lowerContent = contentSnippet.toLowerCase();
          if (/\b(free|freemium)\b/i.test(lowerContent)) pricing = "Freemium";
          else if (/\b(paid|subscription|\$\d+|enterprise|premium|pro)\b/i.test(lowerContent)) pricing = "Paid";

          tools.push({
            name: toolName,
            description: contentSnippet + "...",
            pricing,
            url
          });
        }
      }
    }
    return NextResponse.json({ tools: tools.slice(0, 5) });
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: 'Failed to search for tools' }, { status: 500 })
  }
} 