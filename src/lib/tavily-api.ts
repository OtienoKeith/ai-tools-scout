import type { TavilyTool } from "../types";

const disallowedDomains = [
  "medium.com", "wordpress.com", "blogspot.com", "news.ycombinator.com",
  "producthunt.com", "reddit.com", "quora.com", "youtube.com"
];

const urlLooksLikeBlogOrList = (url: string) =>
  /\/(blog|article|news|review|post|list|guide|explained)\b/i.test(url);

const isLikelyToolHomepage = (url: string) => {
  try {
    const u = new URL(url);
    // Only block if clearly a blog/article or known list domain
    if (disallowedDomains.some(domain => u.hostname.includes(domain))) return false;
    if (urlLooksLikeBlogOrList(url)) return false;
    return true;
  } catch {
    return false;
  }
};

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
        query: `List 3 actual AI tools (not blogs, articles, or lists) for ${query}. For each, give: Name, short description, pricing, and direct homepage link.`,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: 3
      })
    });

    if (!response.ok) throw new Error(`Tavily API error: ${response.status}`);

    const data = await response.json();
    const tools: TavilyTool[] = [];
    const generateId = () =>
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substr(2, 9);

    if (data.results) {
      for (const result of data.results) {
        if (tools.length >= 3) break;
        const title = result.title || "";
        const url = result.url || "";
        const contentSnippet = result.content || "";

        if (!isLikelyToolHomepage(url)) continue;

        tools.push({
          id: generateId(),
          name: title.trim(),
          description: contentSnippet.trim().slice(0, 200),
          pricing: "Unknown",
          url
        });
      }
    }
    return tools;
  } catch (error) {
    console.error("searchAITools error:", error);
    return [];
  }
}
