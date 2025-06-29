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
        query: `List 3 actual AI tools for ${query}. For each, give: - Name - Short description (1–2 lines) - Pricing - Link to the tool (not to blogs or articles) Return in plain format, no blog links, no summaries.`,
        search_depth: "advanced", // Using advanced for better answer synthesis
        include_answer: true,
        include_raw_content: false, // Keep false if only answer is needed
        max_results: 3 // Requesting 3 tools
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    
    const tools: TavilyTool[] = [];
    const blogLikeKeywords = /\b(blog|article|top|best|guide|review|vs|alternatives|\d+\s+(tools|ways|apps))\b/i;
    const urlKeywordsToAvoid = /\/(blog|article|news)\b|medium\.com|wordpress\.com|blogspot\.com/i;
    const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);

    if (data.answer) {
      const lines = data.answer.split('\n');
      for (const line of lines) {
        if (blogLikeKeywords.test(line) || urlKeywordsToAvoid.test(line)) {
          continue;
        }
        const toolRegex = /-\s*(.+?):\s*(.+?)\s*-\s*Pricing:\s*(.+?)\s*-\s*Link:\s*(https?:\/\/[^\s]+)/i;
        const match = line.match(toolRegex);

        if (match && match[1] && match[2] && match[3] && match[4]) {
          const name = match[1].trim();
          const description = match[2].trim();
          const pricing = match[3].trim();
          const url = match[4].trim();

          if (!blogLikeKeywords.test(name) && !urlKeywordsToAvoid.test(url)) {
            tools.push({ id: generateId(), name, description, pricing, url });
          }
        } else {
          const simpleToolRegex = /^\s*-\s*([^:(]+?)\s*(?:\(([^)]+)\))?\s*-\s*(https?:\/\/[^\s]+)/i;
          const simpleMatch = line.match(simpleToolRegex);
          if (simpleMatch && simpleMatch[1] && simpleMatch[3]) {
            const name = simpleMatch[1].trim();
            const pricing = simpleMatch[2]?.trim() || "Unknown";
            const url = simpleMatch[3].trim();
            if (!blogLikeKeywords.test(name) && !urlKeywordsToAvoid.test(url)) {
               tools.push({ id: generateId(), name, description: "N/A", pricing, url });
            }
          }
        }
      }
    }

    if (tools.length < 3 && data.results) {
      for (const result of data.results) {
        if (tools.length >= 3) break;

        const title = result.title || "";
        const url = result.url || "";
        const contentSnippet = result.content || "";

        if (blogLikeKeywords.test(title) || urlKeywordsToAvoid.test(url) || blogLikeKeywords.test(contentSnippet.substring(0,100))) {
          continue;
        }
        if (url.includes("example.com")) continue;

        const toolName = title.split(' - ')[0]?.split(' | ')[0]?.trim() || title.trim();
        let pricing = "Unknown";
        const lowerContent = contentSnippet.toLowerCase();
        if (lowerContent.includes("free") || lowerContent.includes("freemium")) pricing = "Freemium";
        else if (lowerContent.includes("paid") || lowerContent.includes("subscription") || lowerContent.includes("$")) pricing = "Paid";

        if (!tools.some(t => t.url === url)) {
          tools.push({
            id: generateId(),
            name: toolName,
            description: contentSnippet.substring(0, 150) + "...",
            pricing,
            url
          });
        }
      }
    }
    return tools.slice(0, 3); // Ensure we only return max 3
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