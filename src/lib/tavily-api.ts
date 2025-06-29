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
        query: `${query} AI tools software applications`,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        max_results: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data: TavilyResponse = await response.json();
    
    // Extract and format tools from search results
    const tools: TavilyTool[] = [];
    
    for (const result of data.results.slice(0, 3)) {
      // Extract tool information from the search result
      const toolName = result.title.split(' - ')[0] || result.title.split(' | ')[0] || result.title;
      const description = result.content.substring(0, 200) + "...";
      
      // Try to determine pricing from content
      let pricing = "Unknown";
      const content = result.content.toLowerCase();
      if (content.includes("free") || content.includes("freemium")) {
        pricing = "Freemium";
      } else if (content.includes("paid") || content.includes("subscription")) {
        pricing = "Paid";
      }

      tools.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        name: toolName,
        description,
        pricing,
        url: result.url
      });
    }

    return tools;
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