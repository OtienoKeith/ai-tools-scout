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
        query: `List 3 actual AI tools for ${query}. For each, give: - Name - Short description (1–2 lines) - Pricing - Link to the tool (not to blogs or articles) Return in plain format, no blog links, no summaries.`,
        search_depth: "advanced", // Using advanced for better answer synthesis
        include_answer: true,
        include_raw_content: false, // Keep false if only answer is needed
        max_results: 3 // Requesting 3 tools
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
    const blogLikeKeywords = /\b(blog|article|top|best|guide|review|vs|alternatives|\d+\s+(tools|ways|apps))\b/i;
    const urlKeywordsToAvoid = /\/(blog|article|news)\b|medium\.com|wordpress\.com|blogspot\.com/i;

    if (data.answer) {
      const lines = data.answer.split('\n');
      for (const line of lines) {
        if (blogLikeKeywords.test(line) || urlKeywordsToAvoid.test(line)) {
          continue;
        }

        // Regex to capture: "- Name: (Description) - Pricing: (Price) - Link: (URL)" or similar variations
        // This regex is an attempt and might need refinement based on actual Tavily output.
        const toolRegex = /-\s*(.+?):\s*(.+?)\s*-\s*Pricing:\s*(.+?)\s*-\s*Link:\s*(https?:\/\/[^\s]+)/i;
        const match = line.match(toolRegex);

        if (match && match[1] && match[2] && match[3] && match[4]) {
          const name = match[1].trim();
          const description = match[2].trim();
          const pricing = match[3].trim();
          const url = match[4].trim();

          if (!blogLikeKeywords.test(name) && !urlKeywordsToAvoid.test(url)) {
            tools.push({ name, description, pricing, url });
          }
        } else {
          // Fallback for lines that don't match the full structure but might contain a tool
          // Example: "ToolName (Pricing) - URL"
          const simpleToolRegex = /^\s*-\s*([^:(]+?)\s*(?:\(([^)]+)\))?\s*-\s*(https?:\/\/[^\s]+)/i;
          const simpleMatch = line.match(simpleToolRegex);
          if (simpleMatch && simpleMatch[1] && simpleMatch[3]) {
            const name = simpleMatch[1].trim();
            const pricing = simpleMatch[2]?.trim() || "Unknown";
            const url = simpleMatch[3].trim();
            if (!blogLikeKeywords.test(name) && !urlKeywordsToAvoid.test(url)) {
               tools.push({ name, description: "N/A", pricing, url });
            }
          }
        }
      }
    }

    // Fallback to results if answer parsing yields too few tools or is not present
    if (tools.length < 3 && data.results) {
      for (const result of data.results) {
        if (tools.length >= 3) break;

        const title = result.title || "";
        const url = result.url || "";
        const contentSnippet = result.content || "";

        if (blogLikeKeywords.test(title) || urlKeywordsToAvoid.test(url) || blogLikeKeywords.test(contentSnippet.substring(0,100))) {
          continue;
        }

        // More checks to ensure it's a tool
        if (url.includes("example.com")) continue; // Placeholder for actual non-tool domains

        const toolName = title.split(' - ')[0]?.split(' | ')[0]?.trim() || title.trim();
        let pricing = "Unknown";
        const lowerContent = contentSnippet.toLowerCase();
        if (lowerContent.includes("free") || lowerContent.includes("freemium")) pricing = "Freemium";
        else if (lowerContent.includes("paid") || lowerContent.includes("subscription") || lowerContent.includes("$")) pricing = "Paid";

        // Ensure it's not already added from answer parsing (simple URL check)
        if (!tools.some(t => t.url === url)) {
          tools.push({
            name: toolName,
            description: contentSnippet.substring(0, 150) + "...",
            pricing,
            url
          });
        }
      }
    }

    return NextResponse.json({ tools: tools.slice(0, 3) }) // Ensure we only return max 3
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: 'Failed to search for tools' }, { status: 500 })
  }
} 