// ... existing code ...

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
    // Hardcoded demo queries and their results
    const demoQueries: Record<string, TavilyTool[]> = {
      "image generation": [
        {
          id: "midjourney",
          name: "Midjourney",
          description: "AI-powered image generation tool for creating stunning artwork from text descriptions.",
          pricing: "Paid",
          url: "https://midjourney.com",
          pricingUrl: "https://docs.midjourney.com/docs/plans"
        },
        {
          id: "dalle",
          name: "DALL·E",
          description: "OpenAI's AI system that creates realistic images and art from a description in natural language.",
          pricing: "Paid",
          url: "https://openai.com/dall-e-2/",
          pricingUrl: "https://openai.com/pricing"
        },
        {
          id: "leonardo-ai",
          name: "Leonardo AI",
          description: "AI art generator for creating production-quality visual assets with ease.",
          pricing: "Freemium",
          url: "https://leonardo.ai",
          pricingUrl: "https://leonardo.ai/pricing"
        }
      ],
      "text summarization": [
        {
          id: "chatgpt",
          name: "ChatGPT",
          description: "Advanced conversational AI for writing, coding, and summarizing text.",
          pricing: "Freemium",
          url: "https://chat.openai.com",
          pricingUrl: "https://openai.com/pricing"
        },
        {
          id: "claude",
          name: "Claude",
          description: "Anthropic's AI assistant for summarizing, writing, and answering questions.",
          pricing: "Freemium",
          url: "https://claude.ai",
          pricingUrl: "https://claude.ai/pricing"
        },
        {
          id: "smodin-summarizer",
          name: "Smodin Summarizer",
          description: "AI-powered tool for automatic text and document summarization.",
          pricing: "Freemium",
          url: "https://smodin.io/summarizer",
          pricingUrl: "https://smodin.io/pricing"
        }
      ],
      "speech-to-text transcription": [
        {
          id: "whisper",
          name: "Whisper by OpenAI",
          description: "Automatic speech recognition system for transcribing audio to text.",
          pricing: "Free",
          url: "https://openai.com/research/whisper",
          pricingUrl: "https://openai.com/pricing"
        },
        {
          id: "otter-ai",
          name: "Otter.ai",
          description: "AI-powered meeting transcription and note-taking tool.",
          pricing: "Freemium",
          url: "https://otter.ai",
          pricingUrl: "https://otter.ai/pricing"
        },
        {
          id: "fireflies-ai",
          name: "Fireflies.ai",
          description: "AI meeting assistant for recording, transcribing, and searching voice conversations.",
          pricing: "Freemium",
          url: "https://fireflies.ai",
          pricingUrl: "https://fireflies.ai/pricing"
        }
      ],
      "grammar correction": [
        {
          id: "grammarly",
          name: "Grammarly",
          description: "AI-powered writing assistant that helps improve grammar, style, and tone in real-time.",
          pricing: "Freemium",
          url: "https://grammarly.com",
          pricingUrl: "https://www.grammarly.com/premium"
        },
        {
          id: "prowritingaid",
          name: "ProWritingAid",
          description: "AI-powered grammar checker, style editor, and writing mentor in one package.",
          pricing: "Freemium",
          url: "https://prowritingaid.com",
          pricingUrl: "https://prowritingaid.com/en/App/Purchase"
        },
        {
          id: "ginger-ai",
          name: "Ginger AI",
          description: "AI grammar and spell checker for clear and effective writing.",
          pricing: "Freemium",
          url: "https://gingersoftware.com",
          pricingUrl: "https://www.gingersoftware.com/grammarcheck/premium"
        }
      ],
      "remove background from images": [
        {
          id: "remove-bg",
          name: "Remove.bg",
          description: "Remove image backgrounds automatically with AI.",
          pricing: "Freemium",
          url: "https://remove.bg",
          pricingUrl: "https://www.remove.bg/pricing"
        },
        {
          id: "photoroom",
          name: "PhotoRoom",
          description: "AI photo editor for removing backgrounds and creating product images.",
          pricing: "Freemium",
          url: "https://photoroom.com",
          pricingUrl: "https://www.photoroom.com/pricing"
        },
        {
          id: "cleanup-pictures",
          name: "Cleanup.pictures",
          description: "Remove unwanted objects, people, or text from images with AI.",
          pricing: "Freemium",
          url: "https://cleanup.pictures",
          pricingUrl: "https://cleanup.pictures/pricing"
        }
      ],
      "video generation from text": [
        {
          id: "pictory",
          name: "Pictory",
          description: "AI video generator that turns scripts or articles into engaging videos.",
          pricing: "Paid",
          url: "https://pictory.ai",
          pricingUrl: "https://pictory.ai/pricing"
        },
        {
          id: "synthesia",
          name: "Synthesia",
          description: "Create AI videos from text in minutes with avatars and voiceovers.",
          pricing: "Paid",
          url: "https://synthesia.io",
          pricingUrl: "https://www.synthesia.io/pricing"
        },
        {
          id: "lumen5",
          name: "Lumen5",
          description: "AI-powered video creation platform for turning text into video content.",
          pricing: "Freemium",
          url: "https://lumen5.com",
          pricingUrl: "https://lumen5.com/pricing/"
        }
      ],
      "ai coding assistants": [
        {
          id: "github-copilot",
          name: "GitHub Copilot",
          description: "AI pair programmer that helps you write code faster and with fewer errors.",
          pricing: "Paid",
          url: "https://github.com/features/copilot",
          pricingUrl: "https://github.com/features/copilot#pricing"
        },
        {
          id: "replit-ghostwriter",
          name: "Replit Ghostwriter",
          description: "AI-powered code completion and chat for Replit users.",
          pricing: "Paid",
          url: "https://replit.com/site/ghostwriter",
          pricingUrl: "https://replit.com/site/ghostwriter"
        },
        {
          id: "codeium",
          name: "Codeium",
          description: "AI code completion and search for developers, free for individuals.",
          pricing: "Freemium",
          url: "https://codeium.com",
          pricingUrl: "https://codeium.com/pricing"
        }
      ],
      "ai logo generators": [
        {
          id: "looka",
          name: "Looka",
          description: "AI-powered logo maker for creating professional logos in minutes.",
          pricing: "Paid",
          url: "https://looka.com",
          pricingUrl: "https://looka.com/pricing"
        },
        {
          id: "logoai",
          name: "LogoAI",
          description: "AI logo generator for unique and creative logo designs.",
          pricing: "Paid",
          url: "https://logoai.com",
          pricingUrl: "https://logoai.com/pricing"
        },
        {
          id: "brandmark-io",
          name: "Brandmark.io",
          description: "AI logo design tool for creating memorable brand identities.",
          pricing: "Paid",
          url: "https://brandmark.io",
          pricingUrl: "https://brandmark.io/pricing"
        }
      ],
      "document summarization": [
        {
          id: "chatpdf",
          name: "ChatPDF",
          description: "AI tool for chatting with and summarizing PDF documents.",
          pricing: "Freemium",
          url: "https://chatpdf.com",
          pricingUrl: "https://www.chatpdf.com/pricing"
        },
        {
          id: "humata",
          name: "Humata",
          description: "AI-powered document Q&A and summarization assistant.",
          pricing: "Freemium",
          url: "https://humata.ai",
          pricingUrl: "https://humata.ai/pricing"
        },
        {
          id: "scisummary",
          name: "SciSummary",
          description: "AI tool for summarizing scientific papers and research articles.",
          pricing: "Freemium",
          url: "https://scisummary.com",
          pricingUrl: "https://scisummary.com/pricing"
        }
      ],
      "customer support chatbots": [
        {
          id: "intercom-fin",
          name: "Intercom Fin",
          description: "AI-powered customer support chatbot for instant answers and automation.",
          pricing: "Paid",
          url: "https://www.intercom.com/fin",
          pricingUrl: "https://www.intercom.com/pricing"
        },
        {
          id: "tidio",
          name: "Tidio",
          description: "AI chatbot and live chat for customer support and sales automation.",
          pricing: "Freemium",
          url: "https://www.tidio.com",
          pricingUrl: "https://www.tidio.com/pricing/"
        },
        {
          id: "drift-ai",
          name: "Drift AI",
          description: "AI-powered chatbot for B2B customer engagement and support.",
          pricing: "Paid",
          url: "https://drift.com",
          pricingUrl: "https://drift.com/pricing/"
        }
      ]
    };
    const normalizedQuery = query.trim().toLowerCase();
    if (demoQueries[normalizedQuery]) {
      return demoQueries[normalizedQuery];
    }

    // Check cache first for faster responses
    const cacheKey = normalizedQuery;
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

    // Enhanced search query for better AI tool discovery
    const enhancedQuery = `List exactly 6 specific, currently available AI software tools (not articles, not blogs, not listicles) for the following need: "${query}". For each tool, provide:
1. Exact tool name (no extra text).
2. One-sentence description of its main function.
3. Pricing model (Free, Freemium, Paid, Subscription, Enterprise).
4. Direct homepage URL (not a blog, not a review, not a listicle).
5. Pricing page URL if available.
Return ONLY actual software tools, not articles, not reviews, not listicles, not blog posts. Format as a clear, structured list.`;

    // Use direct fetch to Tavily API instead of SDK
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
        include_raw_content: "markdown",
        max_results: 10,
        chunks_per_source: 3,
        topic: "general",
        include_domains: [],
        exclude_domains: ["medium.com", "dev.to", "hashnode.dev"]
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    const tools: TavilyTool[] = [];

    // Parse the answer for structured tool information
    if (data.answer) {
      const lines: string[] = data.answer.split('\n').filter((line: string) => line.trim() !== '');
      let currentTool: Partial<TavilyTool> = {};

      for (const lineStr of lines as string[]) {
        const trimmedLine = lineStr.trim();
        
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
    if (tools.length < 6 && data.results && Array.isArray(data.results)) {
      for (const result of data.results) {
        if (tools.length >= 6) break;

        const title = result.title || "";
        const url = result.url || "";
        const content = result.content || "";

        // Stricter filter: skip if title or url looks like a listicle, review, or article
        if (
          /\b(blog|article|news|review|guide|tutorial|how to|what is|why use|list|lists|top \d+|best \d+|\d+ best|\d+ tools|\d+ ai|\d+ apps|\d+ software)\b/i.test(title) ||
          /\b(blog|article|news|review|guide|tutorial|how to|what is|why use|list|lists|top \d+|best \d+|\d+ best|\d+ tools|\d+ ai|\d+ apps|\d+ software)\b/i.test(content) ||
          /\b(blog|article|news|review|guide|tutorial|how to|what is|why use|list|lists|top\d+|best\d+|\d+best|\d+tools|\d+ai|\d+apps|\d+software)\b/i.test(url) ||
          /\/(\d{4}|\d{2})\//.test(url) || // skip URLs with years (likely articles)
          /\/(post|review|article|blog|news|guide|tutorial|how-to|list|lists)\//i.test(url) ||
          /\b(list|lists|top|best|review|article|blog|news|guide|tutorial)\b/i.test(title)
        ) {
          continue;
        }

        // Only include if title and url look like a real tool
        if (!title || !url || !/^https?:\/\/[\w.-]+\.[a-z]{2,}(\/)?$/i.test(url.split('?')[0].replace(/\/$/, ''))) {
          continue;
        }
        // Must have a description
        if (!content || content.length < 10) {
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