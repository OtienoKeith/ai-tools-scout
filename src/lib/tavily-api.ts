import type { TavilyTool } from "../types";

// Domains that often contain blogs, news, or lists, not direct product pages
const disallowedDomains = [
  "medium.com", "wordpress.com", "blogspot.com", "news.ycombinator.com",
  "producthunt.com", "reddit.com", "quora.com", "youtube.com"
];

// Helper to detect if a URL looks like a blog, article, news, review, or list
const urlLooksLikeBlogOrList = (url: string) =>
  /\/(blog|article|news|reviews?|posts?|lists?|guide|explained)\/|(\d{2,})|top-\d/i.test(url);

// Helper to determine if a URL is likely a tool homepage
const isLikelyToolHomepage = (url: string) => {
  try {
    const u = new URL(url);
    // Only allow URLs at domain root or one level deep (site.com or site.com/tool)
    const pathParts = u.pathname.split('/').filter(Boolean);
    if (pathParts.length > 1) return false;
    // Exclude known blog/news domains
    if (disallowedDomains.some(domain => u.hostname.includes(domain))) return false;
    // Exclude URLs that look like blog/list
    if (urlLooksLikeBlogOrList(url)) return false;
    return true;
  } catch {
    return false;
  }
};

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
        query: `List 3 actual, individual AI tools (not blogs, articles, reviews, or listicles) for ${query}. For each, provide:
- Name
- Short description (1–2 lines)
- Pricing
- Direct link to the tool's homepage (not to blogs, articles, or lists; only product homepages).`,
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

    const blogLikeKeywords = /\b(blog|article|top|best|guide|review|vs|alternatives|\d+\s+(tools|ways|apps))\b/i;
    const urlKeywordsToAvoid = /\/(blog|article|news)\b|medium\.com|wordpress\.com|blogspot\.com/i;
    const generateId = () =>
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substr(2, 9);

    const tools: TavilyTool[] = [];

    // (Optional) Try to parse answer text if it's structured
    if (data.answer) {
      const lines = data.answer.split('\n');
      for (const line of lines) {
        if (blogLikeKeywords.test(line) || urlKeywordsToAvoid.test(line)) {
          continue;
        }
        // Example: ToolName - Description - Pricing - URL
        const match = line.match(/^(.+?)\s*-\s*(.+?)\s*-\s*(.+?)\s*-\s*(https?:\/\/\S+)/);
        if (match && isLikelyToolHomepage(match[4])) {
          tools.push({
            id: generateId(),
            name: match[1].trim(),
            description: match[2].trim(),
            pricing: match[3].trim(),
            url: match[4].trim()
          });
        }
      }
    }

    // Fallback: parse the raw results array
    if (tools.length < 3 && data.results) {
      for (const result of data.results) {
        if (tools.length >= 3) break;

        const title = result.title || "";
        const url = result.url || "";
        const contentSnippet = result.content || "";

        // Stricter filtering
        if (
          blogLikeKeywords.test(title) ||
          urlKeywordsToAvoid.test(url) ||
          !isLikelyToolHomepage(url)
        ) {
          continue;
        }

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
