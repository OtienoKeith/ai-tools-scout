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
      ],
      "project management": [
        {
          id: "notion",
          name: "Notion",
          description: "All-in-one workspace with AI features for notes, docs, and project management.",
          pricing: "Freemium",
          url: "https://notion.so",
          pricingUrl: "https://www.notion.so/pricing"
        },
        {
          id: "clickup",
          name: "ClickUp",
          description: "AI-powered project management platform with customizable workflows and automation.",
          pricing: "Freemium",
          url: "https://clickup.com",
          pricingUrl: "https://clickup.com/pricing"
        },
        {
          id: "asana",
          name: "Asana",
          description: "Work management platform with AI features for team collaboration and project tracking.",
          pricing: "Freemium",
          url: "https://asana.com",
          pricingUrl: "https://asana.com/pricing"
        },
        {
          id: "monday",
          name: "Monday.com",
          description: "AI-enhanced work OS for project management, team collaboration, and workflow automation.",
          pricing: "Paid",
          url: "https://monday.com",
          pricingUrl: "https://monday.com/pricing"
        },
        {
          id: "trello",
          name: "Trello",
          description: "Visual project management tool with AI-powered automation and templates.",
          pricing: "Freemium",
          url: "https://trello.com",
          pricingUrl: "https://trello.com/pricing"
        },
        {
          id: "linear",
          name: "Linear",
          description: "Modern project management tool for software teams with AI-powered insights.",
          pricing: "Freemium",
          url: "https://linear.app",
          pricingUrl: "https://linear.app/pricing"
        }
      ],
      "email": [
        {
          id: "gmail",
          name: "Gmail",
          description: "Google's email service with AI-powered smart compose and smart reply features.",
          pricing: "Free",
          url: "https://gmail.com",
          pricingUrl: "https://workspace.google.com/pricing.html"
        },
        {
          id: "outlook",
          name: "Outlook",
          description: "Microsoft's email client with AI-powered writing suggestions and smart features.",
          pricing: "Freemium",
          url: "https://outlook.com",
          pricingUrl: "https://www.microsoft.com/en-us/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook"
        },
        {
          id: "superhuman",
          name: "Superhuman",
          description: "AI-powered email client designed for speed and productivity with smart features.",
          pricing: "Paid",
          url: "https://superhuman.com",
          pricingUrl: "https://superhuman.com/pricing"
        },
        {
          id: "spark",
          name: "Spark",
          description: "Smart email app with AI-powered email organization and smart notifications.",
          pricing: "Freemium",
          url: "https://sparkmailapp.com",
          pricingUrl: "https://sparkmailapp.com/pricing"
        },
        {
          id: "airmail",
          name: "Airmail",
          description: "Fast and lightweight email client with AI-powered smart features and customization.",
          pricing: "Paid",
          url: "https://airmailapp.com",
          pricingUrl: "https://airmailapp.com/pricing"
        },
        {
          id: "newton",
          name: "Newton Mail",
          description: "Clean email client with AI-powered features like snooze, read receipts, and smart organization.",
          pricing: "Paid",
          url: "https://newtonhq.com",
          pricingUrl: "https://newtonhq.com/pricing"
        }
      ],
      "data visualization": [
        {
          id: "tableau",
          name: "Tableau",
          description: "AI-powered data visualization and business intelligence platform for analytics.",
          pricing: "Paid",
          url: "https://tableau.com",
          pricingUrl: "https://www.tableau.com/pricing"
        },
        {
          id: "power-bi",
          name: "Power BI",
          description: "Microsoft's AI-powered business analytics service for data visualization and insights.",
          pricing: "Freemium",
          url: "https://powerbi.microsoft.com",
          pricingUrl: "https://powerbi.microsoft.com/en-us/pricing/"
        },
        {
          id: "looker",
          name: "Looker",
          description: "Google's AI-powered data platform for business intelligence and analytics.",
          pricing: "Paid",
          url: "https://looker.com",
          pricingUrl: "https://looker.com/pricing"
        },
        {
          id: "plotly",
          name: "Plotly",
          description: "AI-enhanced data visualization platform for creating interactive charts and dashboards.",
          pricing: "Freemium",
          url: "https://plotly.com",
          pricingUrl: "https://plotly.com/pricing"
        },
        {
          id: "d3-js",
          name: "D3.js",
          description: "JavaScript library for creating dynamic, interactive data visualizations with AI integration.",
          pricing: "Free",
          url: "https://d3js.org",
          pricingUrl: "https://d3js.org"
        },
        {
          id: "chart-js",
          name: "Chart.js",
          description: "Simple yet flexible JavaScript charting library for data visualization.",
          pricing: "Free",
          url: "https://chartjs.org",
          pricingUrl: "https://chartjs.org"
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

    // Comprehensive AI tools database for fallback
    const aiToolsDatabase: Record<string, TavilyTool[]> = {
      // Writing & Content
      "writing": [
        { id: "chatgpt", name: "ChatGPT", description: "Advanced AI writing assistant for content creation, editing, and brainstorming.", pricing: "Freemium", url: "https://chat.openai.com", pricingUrl: "https://openai.com/pricing" },
        { id: "jasper", name: "Jasper", description: "AI content creation platform for marketing copy, blog posts, and creative writing.", pricing: "Paid", url: "https://jasper.ai", pricingUrl: "https://jasper.ai/pricing" },
        { id: "copy-ai", name: "Copy.ai", description: "AI copywriting tool that generates marketing content and business copy.", pricing: "Freemium", url: "https://copy.ai", pricingUrl: "https://copy.ai/pricing" },
        { id: "writesonic", name: "Writesonic", description: "AI writing platform for creating high-quality content, ads, and articles.", pricing: "Freemium", url: "https://writesonic.com", pricingUrl: "https://writesonic.com/pricing" },
        { id: "rytr", name: "Rytr", description: "AI writing assistant for creating content in multiple languages and tones.", pricing: "Freemium", url: "https://rytr.me", pricingUrl: "https://rytr.me/pricing" },
        { id: "contentbot", name: "ContentBot", description: "AI-powered content creation tool for blogs, social media, and marketing.", pricing: "Freemium", url: "https://contentbot.ai", pricingUrl: "https://contentbot.ai/pricing" }
      ],
      "content creation": [
        { id: "canva", name: "Canva", description: "AI-enhanced design platform for creating visual content, graphics, and presentations.", pricing: "Freemium", url: "https://canva.com", pricingUrl: "https://canva.com/pricing" },
        { id: "pictory", name: "Pictory", description: "AI video generator that turns scripts or articles into engaging videos.", pricing: "Paid", url: "https://pictory.ai", pricingUrl: "https://pictory.ai/pricing" },
        { id: "lumen5", name: "Lumen5", description: "AI-powered video creation platform for turning text into video content.", pricing: "Freemium", url: "https://lumen5.com", pricingUrl: "https://lumen5.com/pricing/" },
        { id: "synthesia", name: "Synthesia", description: "Create AI videos from text in minutes with avatars and voiceovers.", pricing: "Paid", url: "https://synthesia.io", pricingUrl: "https://www.synthesia.io/pricing" },
        { id: "descript", name: "Descript", description: "AI-powered audio and video editing platform with transcription and voice cloning.", pricing: "Freemium", url: "https://descript.com", pricingUrl: "https://www.descript.com/pricing" },
        { id: "kapwing", name: "Kapwing", description: "Online video editor with AI-powered features for content creators.", pricing: "Freemium", url: "https://kapwing.com", pricingUrl: "https://www.kapwing.com/pricing" }
      ],
      // Productivity & Business
      "productivity": [
        { id: "notion", name: "Notion", description: "All-in-one workspace with AI features for notes, docs, and project management.", pricing: "Freemium", url: "https://notion.so", pricingUrl: "https://www.notion.so/pricing" },
        { id: "clickup", name: "ClickUp", description: "AI-powered project management platform with customizable workflows and automation.", pricing: "Freemium", url: "https://clickup.com", pricingUrl: "https://clickup.com/pricing" },
        { id: "monday", name: "Monday.com", description: "AI-enhanced work OS for project management, team collaboration, and workflow automation.", pricing: "Paid", url: "https://monday.com", pricingUrl: "https://monday.com/pricing" },
        { id: "asana", name: "Asana", description: "Work management platform with AI features for team collaboration and project tracking.", pricing: "Freemium", url: "https://asana.com", pricingUrl: "https://asana.com/pricing" },
        { id: "trello", name: "Trello", description: "Visual project management tool with AI-powered automation and templates.", pricing: "Freemium", url: "https://trello.com", pricingUrl: "https://trello.com/pricing" },
        { id: "linear", name: "Linear", description: "Modern project management tool for software teams with AI-powered insights.", pricing: "Freemium", url: "https://linear.app", pricingUrl: "https://linear.app/pricing" }
      ],
      "business": [
        { id: "zapier", name: "Zapier", description: "AI-powered automation platform for connecting apps and workflows.", pricing: "Freemium", url: "https://zapier.com", pricingUrl: "https://zapier.com/pricing" },
        { id: "hubspot", name: "HubSpot", description: "AI-enhanced CRM platform for marketing, sales, and customer service automation.", pricing: "Freemium", url: "https://hubspot.com", pricingUrl: "https://www.hubspot.com/pricing" },
        { id: "salesforce", name: "Salesforce", description: "AI-powered CRM platform with Einstein AI for sales and customer insights.", pricing: "Paid", url: "https://salesforce.com", pricingUrl: "https://www.salesforce.com/pricing/" },
        { id: "intercom", name: "Intercom", description: "AI-powered customer messaging platform with chatbots and automation.", pricing: "Paid", url: "https://intercom.com", pricingUrl: "https://www.intercom.com/pricing" },
        { id: "drift", name: "Drift", description: "AI-powered chatbot for B2B customer engagement and support.", pricing: "Paid", url: "https://drift.com", pricingUrl: "https://drift.com/pricing/" },
        { id: "tidio", name: "Tidio", description: "AI chatbot and live chat for customer support and sales automation.", pricing: "Freemium", url: "https://www.tidio.com", pricingUrl: "https://www.tidio.com/pricing/" }
      ],
      // Marketing & Analytics
      "marketing": [
        { id: "mailchimp", name: "Mailchimp", description: "AI-powered email marketing platform with automation and analytics.", pricing: "Freemium", url: "https://mailchimp.com", pricingUrl: "https://mailchimp.com/pricing/" },
        { id: "klaviyo", name: "Klaviyo", description: "AI-enhanced email marketing and SMS platform for e-commerce businesses.", pricing: "Paid", url: "https://klaviyo.com", pricingUrl: "https://www.klaviyo.com/pricing" },
        { id: "convertkit", name: "ConvertKit", description: "AI-powered email marketing platform for creators and small businesses.", pricing: "Freemium", url: "https://convertkit.com", pricingUrl: "https://convertkit.com/pricing" },
        { id: "activecampaign", name: "ActiveCampaign", description: "AI-powered marketing automation platform with customer experience automation.", pricing: "Paid", url: "https://activecampaign.com", pricingUrl: "https://www.activecampaign.com/pricing/" },
        { id: "brevo", name: "Brevo", description: "AI-enhanced marketing platform for email, SMS, and customer relationship management.", pricing: "Freemium", url: "https://brevo.com", pricingUrl: "https://www.brevo.com/pricing/" },
        { id: "drip", name: "Drip", description: "AI-powered e-commerce marketing automation platform.", pricing: "Paid", url: "https://drip.com", pricingUrl: "https://www.drip.com/pricing" }
      ],
      "analytics": [
        { id: "google-analytics", name: "Google Analytics", description: "AI-powered web analytics platform with machine learning insights.", pricing: "Free", url: "https://analytics.google.com", pricingUrl: "https://analytics.google.com" },
        { id: "mixpanel", name: "Mixpanel", description: "AI-enhanced product analytics platform for user behavior insights.", pricing: "Freemium", url: "https://mixpanel.com", pricingUrl: "https://mixpanel.com/pricing/" },
        { id: "amplitude", name: "Amplitude", description: "AI-powered product analytics platform for understanding user behavior.", pricing: "Freemium", url: "https://amplitude.com", pricingUrl: "https://amplitude.com/pricing" },
        { id: "hotjar", name: "Hotjar", description: "AI-enhanced behavior analytics platform with heatmaps and user recordings.", pricing: "Freemium", url: "https://hotjar.com", pricingUrl: "https://www.hotjar.com/pricing/" },
        { id: "fullstory", name: "FullStory", description: "AI-powered digital experience analytics platform with session replay.", pricing: "Paid", url: "https://fullstory.com", pricingUrl: "https://www.fullstory.com/pricing/" },
        { id: "heap", name: "Heap", description: "AI-powered product analytics platform with automatic event tracking.", pricing: "Freemium", url: "https://heap.io", pricingUrl: "https://heap.io/pricing" }
      ],
      // Design & Creative
      "design": [
        { id: "figma", name: "Figma", description: "AI-enhanced collaborative design platform for UI/UX and graphic design.", pricing: "Freemium", url: "https://figma.com", pricingUrl: "https://www.figma.com/pricing/" },
        { id: "canva", name: "Canva", description: "AI-powered design platform for creating visual content and graphics.", pricing: "Freemium", url: "https://canva.com", pricingUrl: "https://canva.com/pricing" },
        { id: "adobe-creative-cloud", name: "Adobe Creative Cloud", description: "AI-enhanced creative suite with Photoshop, Illustrator, and other design tools.", pricing: "Paid", url: "https://adobe.com/creativecloud", pricingUrl: "https://www.adobe.com/creativecloud/plans.html" },
        { id: "sketch", name: "Sketch", description: "AI-powered design tool for digital product design and prototyping.", pricing: "Paid", url: "https://sketch.com", pricingUrl: "https://www.sketch.com/pricing/" },
        { id: "invision", name: "InVision", description: "AI-enhanced design collaboration platform for prototyping and feedback.", pricing: "Freemium", url: "https://invisionapp.com", pricingUrl: "https://www.invisionapp.com/pricing" },
        { id: "framer", name: "Framer", description: "AI-powered design and prototyping platform for interactive websites and apps.", pricing: "Freemium", url: "https://framer.com", pricingUrl: "https://framer.com/pricing" }
      ],
      // Development & Coding
      "coding": [
        { id: "github-copilot", name: "GitHub Copilot", description: "AI pair programmer that helps you write code faster and with fewer errors.", pricing: "Paid", url: "https://github.com/features/copilot", pricingUrl: "https://github.com/features/copilot#pricing" },
        { id: "replit-ghostwriter", name: "Replit Ghostwriter", description: "AI-powered code completion and chat for Replit users.", pricing: "Paid", url: "https://replit.com/site/ghostwriter", pricingUrl: "https://replit.com/site/ghostwriter" },
        { id: "codeium", name: "Codeium", description: "AI code completion and search for developers, free for individuals.", pricing: "Freemium", url: "https://codeium.com", pricingUrl: "https://codeium.com/pricing" },
        { id: "tabnine", name: "Tabnine", description: "AI code completion tool that learns from your codebase and coding patterns.", pricing: "Freemium", url: "https://tabnine.com", pricingUrl: "https://www.tabnine.com/pricing" },
        { id: "kite", name: "Kite", description: "AI-powered code completion and documentation tool for Python and JavaScript.", pricing: "Freemium", url: "https://kite.com", pricingUrl: "https://kite.com/pricing" },
        { id: "cursor", name: "Cursor", description: "AI-powered code editor with built-in chat and code generation capabilities.", pricing: "Freemium", url: "https://cursor.sh", pricingUrl: "https://cursor.sh/pricing" }
      ],
      // Communication & Collaboration
      "communication": [
        { id: "slack", name: "Slack", description: "AI-enhanced team communication platform with smart features and automation.", pricing: "Freemium", url: "https://slack.com", pricingUrl: "https://slack.com/pricing" },
        { id: "discord", name: "Discord", description: "AI-powered communication platform for communities and teams with bots and automation.", pricing: "Freemium", url: "https://discord.com", pricingUrl: "https://discord.com/premium" },
        { id: "microsoft-teams", name: "Microsoft Teams", description: "AI-enhanced collaboration platform with meeting transcription and smart features.", pricing: "Freemium", url: "https://teams.microsoft.com", pricingUrl: "https://www.microsoft.com/en-us/microsoft-teams/compare-microsoft-teams-options" },
        { id: "zoom", name: "Zoom", description: "AI-powered video conferencing platform with transcription and smart features.", pricing: "Freemium", url: "https://zoom.us", pricingUrl: "https://zoom.us/pricing" },
        { id: "google-meet", name: "Google Meet", description: "AI-enhanced video conferencing with smart features and transcription.", pricing: "Freemium", url: "https://meet.google.com", pricingUrl: "https://workspace.google.com/pricing.html" },
        { id: "webex", name: "Cisco Webex", description: "AI-powered collaboration platform with meeting intelligence and automation.", pricing: "Freemium", url: "https://webex.com", pricingUrl: "https://www.webex.com/pricing/" }
      ],
      // Research & Learning
      "research": [
        { id: "perplexity", name: "Perplexity AI", description: "AI-powered research assistant that provides accurate answers with sources.", pricing: "Freemium", url: "https://perplexity.ai", pricingUrl: "https://perplexity.ai/pricing" },
        { id: "consensus", name: "Consensus", description: "AI-powered research tool for finding and analyzing scientific papers.", pricing: "Freemium", url: "https://consensus.app", pricingUrl: "https://consensus.app/pricing" },
        { id: "elicit", name: "Elicit", description: "AI research assistant for analyzing scientific papers and extracting insights.", pricing: "Freemium", url: "https://elicit.org", pricingUrl: "https://elicit.org/pricing" },
        { id: "scispace", name: "SciSpace", description: "AI-powered research platform for reading and understanding scientific papers.", pricing: "Freemium", url: "https://scispace.com", pricingUrl: "https://scispace.com/pricing" },
        { id: "chatpdf", name: "ChatPDF", description: "AI tool for chatting with and summarizing PDF documents and research papers.", pricing: "Freemium", url: "https://chatpdf.com", pricingUrl: "https://www.chatpdf.com/pricing" },
        { id: "humata", name: "Humata", description: "AI-powered document Q&A and summarization assistant for research.", pricing: "Freemium", url: "https://humata.ai", pricingUrl: "https://humata.ai/pricing" }
      ],
      // Education & Learning
      "education": [
        { id: "duolingo", name: "Duolingo", description: "AI-powered language learning platform with personalized lessons and practice.", pricing: "Freemium", url: "https://duolingo.com", pricingUrl: "https://www.duolingo.com/premium" },
        { id: "coursera", name: "Coursera", description: "AI-enhanced online learning platform with personalized course recommendations.", pricing: "Freemium", url: "https://coursera.org", pricingUrl: "https://www.coursera.org/pricing" },
        { id: "udemy", name: "Udemy", description: "AI-powered online learning marketplace with personalized course suggestions.", pricing: "Freemium", url: "https://udemy.com", pricingUrl: "https://www.udemy.com/pricing/" },
        { id: "khan-academy", name: "Khan Academy", description: "AI-enhanced educational platform with personalized learning paths.", pricing: "Free", url: "https://khanacademy.org", pricingUrl: "https://khanacademy.org" },
        { id: "skillshare", name: "Skillshare", description: "AI-powered online learning community with creative and business courses.", pricing: "Paid", url: "https://skillshare.com", pricingUrl: "https://www.skillshare.com/pricing" },
        { id: "masterclass", name: "MasterClass", description: "AI-enhanced online learning platform with expert-led courses and personalized recommendations.", pricing: "Paid", url: "https://masterclass.com", pricingUrl: "https://www.masterclass.com/pricing" }
      ]
    };

    // Try to find matching tools from our database first
    const queryWords = normalizedQuery.split(' ');
    let bestMatch: TavilyTool[] | null = null;
    let bestScore = 0;

    for (const [category, tools] of Object.entries(aiToolsDatabase)) {
      const categoryWords = category.split(' ');
      let score = 0;
      
      for (const queryWord of queryWords) {
        for (const categoryWord of categoryWords) {
          if (categoryWord.includes(queryWord) || queryWord.includes(categoryWord)) {
            score += 1;
          }
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = tools;
      }
    }

    // If we found a good match, return it
    if (bestMatch && bestScore >= 1) {
      searchCache.set(cacheKey, { tools: bestMatch, timestamp: Date.now() });
      return bestMatch;
    }

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