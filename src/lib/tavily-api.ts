import type { TavilyTool } from "../types";

// Fallback mock data for development or if API key is not set
function getMockTools(query: string): TavilyTool[] {
  return [
    {
      id: "mock-1",
      name: "MockTool",
      description: `A mock AI tool for ${query}.`,
      pricing: "Free",
      url: "https://mocktool.com"
    },
    {
      id: "mock-2",
      name: "ExampleAI",
      description: `An example AI tool for ${query}.`,
      pricing: "Paid",
      url: "https://exampleai.com"
    }
  ];
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
        query: `List 3 actual, individual AI tools for ${query}. For each, provide: Name, short description (1–2 lines), pricing, and direct link to the tool's homepage.`,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: 3
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();

    const tools: TavilyTool[] = [];
    const generateId = () =>
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substr(2, 9);

    if (data.results) {
      for (const result of data.results) {
        if (tools.length >= 3) break;

        tools.push({
          id: generateId(),
          name: result.title || "",
          description: (result.content || "").slice(0, 200),
          pricing: "Unknown",
          url: result.url || ""
        });
      }
    }
    return tools;
  } catch (error) {
    console.error("searchAITools error:", error);
    return [];
  }
}
