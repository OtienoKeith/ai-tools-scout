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
        query: `Find 3-5 actual AI software tools or applications for "${query}". For each tool, provide: 1. Name. 2. Short description (1-2 lines). 3. Pricing model (e.g., Freemium, Paid, Subscription). 4. A direct URL, prioritizing the tool's PRICING PAGE if available, otherwise the homepage. CRITICALLY IMPORTANT: URLs must be for the tool itself, NOT blogs, articles, reviews, or listicles. Focus on specific, usable software. Return results in a clean, parseable format.`,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: true, // Requesting raw content as well to have more data for finding pricing pages
        max_results: 7, // Ask for more results to increase chances of finding relevant ones
        topic: "ai software tools"
      })
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json();
    console.log("Tavily API Full Response:", JSON.stringify(data, null, 2));

    let collectedTools: TavilyTool[] = [];
    const minToolsRequired = 3;

    const blogLikeKeywords = /\b(blog|article|news|updates|tutorial|guide|review|vs|compare|alternatives|insight|story|case stud(y|ies)|how to|learn|discover|understand|become|master|roundup|collection|listicle|top\s*\d*|best\s*\d*|\d+\s+(tools|ways|apps|sites|platforms|resources|examples|services|trends|future of|report|study|analysis|commentary|opinion|editorial|interview|webinar|podcast|event|conference|summit|course|workshop|training|certification|degree|program|university|college|school|institute|template)\b/i;
    const urlKeywordsToAvoid = /\/(blog|article|news|doc(s|umentation)?|guide(s)?|tutorial(s)?|support|community|forum|showcase|example(s)?|category|tag|author|about|contact|career(s)?|job(s)?|press|media|investor(s)?|term(s)?|privacy|security|legal|sitemap|faq|help|contribute|developer|api(-docs)?|research|paper|study|report|event(s)?|webinar(s)?|podcast(s)?|course(s)?|training|certification|template(s)?)\/|\b(medium\.com|wordpress\.com|blogspot\.com|substack\.com|dev\.to|youtube\.com(\/watch|\/channel|\/c\/)|reddit\.com\/r\/|linkedin\.com\/(pulse|company|in\/|school\/)|facebook\.com(\/pg\/|\/groups\/)|twitter\.com|instagram\.com|pinterest\.com|slideshare\.net|sourceforge\.net|github\.com\/(?!marketplace)|gitlab\.com\/(?!explore)|producthunt\.com\/posts\/|wikipedia\.org|wikihow\.com|quora\.com|stackoverflow\.com|researchgate\.net|academia\.edu|archive\.org|g2\.com|capterra\.com|trustradius\.com|softwarereviews\.com|alternativeto\.net)\b/i;
    const nonToolTitleKeywords = /\b(what is|how does|why use|future of|impact of|introduction to|beginner's guide to|exploring|understanding|deep dive|analysis of|benefits of|advantages of|disadvantages of|comparison of|alternative to|history of|evolution of|state of|trend in|expert view on|top \d+ ways|ultimate guide|complete list|essential tips|best practices|common mistakes|my experience with|how i use|explainer|overview|insights|perspectives|commentary|editorial|interview|webinar|podcast|event|conference|summit|course|workshop|training|certification|degree|program|university|college|school|institute|template)\b/i;
    const pricingUrlKeywords = /\/(pricing|plans|buy|subscribe|get-started|try|demo|purchase|store|shop|billing|checkout|order|cart|pay|upgrade|edition|tier|compare-plans|license|subscription|credit|token|cost|rate|fee|sale|offer|deal)\b/i;

    const isPricingUrl = (url: string): boolean => pricingUrlKeywords.test(url);

    const addToolToList = (tool: TavilyTool, toolList: TavilyTool[], isStrict: boolean): boolean => {
      if (!tool.url || !tool.name || tool.name.trim().length < 2 || tool.url.trim().length < 10) return false;

      const lowerUrl = tool.url.toLowerCase();
      const lowerName = tool.name.toLowerCase();
      const lowerDesc = tool.description.substring(0,100).toLowerCase();

      if (isStrict) {
        if (urlKeywordsToAvoid.test(lowerUrl) || blogLikeKeywords.test(lowerName) || nonToolTitleKeywords.test(lowerName) || blogLikeKeywords.test(lowerDesc)) {
          console.log(`[Strict Skip] Keyword/URL filter: ${tool.name} (${tool.url})`);
          return false;
        }
      } else {
         if (urlKeywordsToAvoid.test(lowerUrl) && !isPricingUrl(lowerUrl) ) {
            console.log(`[Relaxed Skip] URL filter (non-pricing): ${tool.name} (${tool.url})`);
            return false;
         }
         if ((blogLikeKeywords.test(lowerName) || nonToolTitleKeywords.test(lowerName)) && lowerName.split(" ").length > 3) { // More lenient for names in relaxed
            console.log(`[Relaxed Skip] Name filter: ${tool.name}`);
            return false;
         }
      }

      if (!toolList.some(t => t.url === tool.url || t.name.toLowerCase() === lowerName)) {
        toolList.push(tool);
        console.log(`Added tool: "${tool.name}" (${tool.url}) PricingPage: ${isPricingUrl(tool.url)} (Strict: ${isStrict})`);
        return true;
      }
      return false;
    };

    // Phase 1: Parse data.answer (Tavily's synthesized answer) - Stricter pass
    if (data.answer) {
      console.log("Phase 1: Parsing data.answer (Strict)");
      const lines = data.answer.split('\n').filter(line => line.trim() !== '');
      let currentTool: Partial<TavilyTool> = {};

      for (const line of lines) {
        const nameMatch = line.match(/^(?:1\.|-\s*)?Name:\s*(.+)/i) || line.match(/^(?:Tool(?: Name)?|Name):\s*(.+)/i) || line.match(/^([^-:]+?)\s*-\s*(?:AI Tool|Software|Platform)/i);
        const descMatch = line.match(/^(?:2\.|-\s*)?Description:\s*(.+)/i);
        const pricingMatch = line.match(/^(?:3\.|-\s*)?Pricing:\s*(.+)/i);
        const urlMatch = line.match(/^(?:4\.|-\s*)?Link:\s*(https?:\/\/[^\s]+)/i) || line.match(/URL:\s*(https?:\/\/[^\s]+)/i);

        if (nameMatch && nameMatch[1]) {
          if (currentTool.name && currentTool.url) addToolToList(currentTool as TavilyTool, collectedTools, true);
          currentTool = { name: nameMatch[1].trim(), description: "", pricing: "Unknown" };
        } else if (descMatch && descMatch[1] && currentTool.name) {
          currentTool.description = (currentTool.description + " " + descMatch[1].trim()).trim().substring(0,300);
        } else if (pricingMatch && pricingMatch[1] && currentTool.name) {
          currentTool.pricing = pricingMatch[1].trim();
        } else if (urlMatch && urlMatch[1] && currentTool.name) {
          currentTool.url = urlMatch[1].trim();
          if (addToolToList(currentTool as TavilyTool, collectedTools, true)) {
            currentTool = {};
          }
        }
      }
      if (currentTool.name && currentTool.url) addToolToList(currentTool as TavilyTool, collectedTools, true);
    }

    // Phase 2: Parse data.results (raw search results) - Stricter pass, also try to update existing tools with pricing URLs
    if (data.results && Array.isArray(data.results)) {
      console.log("Phase 2: Parsing data.results (Strict)");
      for (const result of data.results) {
        const toolName = (result.title || "").split(/[\-|\|]/)[0].trim();
        const url = result.url || "";
        const description = (result.content || "").substring(0, 250) + "...";
        let pricing = "Unknown"; // Basic pricing detection
        const lowerContent = (result.content || "").toLowerCase();
        if (/\b(free|freemium)\b/.test(lowerContent)) pricing = "Freemium";
        else if (/\b(paid|premium|enterprise|subscription|\$)\b/.test(lowerContent)) pricing = "Paid";

        // Try to update existing tool if this is a better (pricing) URL
        const existingTool = collectedTools.find(t => t.name.toLowerCase() === toolName.toLowerCase());
        if (existingTool && !isPricingUrl(existingTool.url) && isPricingUrl(url)) {
            if (!urlKeywordsToAvoid.test(url)) { // Ensure new URL is not bad
                 console.log(`Updating URL for "${existingTool.name}" to pricing page: ${url}`);
                 existingTool.url = url;
                 existingTool.description = description; // Update description too
                 existingTool.pricing = pricing; // Update pricing
            }
        } else {
            addToolToList({ name: toolName, description, pricing, url }, collectedTools, true);
        }
      }
    }

    // Deduplicate and sort by preference (pricing URLs first)
    // Deduplicate and sort by preference (pricing URLs first)
    let uniqueTools = Array.from(new Map(collectedTools.map(tool => [tool.url, tool])).values());
    uniqueTools.sort((a, b) => {
        const aIsPricing = isPricingUrl(a.url);
        const bIsPricing = isPricingUrl(b.url);
        if (aIsPricing && !bIsPricing) return -1;
        if (!aIsPricing && bIsPricing) return 1;
        // Fallback sort: tools with descriptions first
        if (a.description && a.description !== "N/A" && (!b.description || b.description === "N/A")) return -1;
        if ((!a.description || a.description === "N/A") && b.description && b.description !== "N/A") return 1;
        return 0;
    });

    collectedTools = uniqueTools; // Update tools with sorted unique ones

    // Phase 3: If not enough tools, re-parse data.results with less strict filtering
    if (collectedTools.length < minToolsRequired && data.results && Array.isArray(data.results)) {
        console.log(`Phase 3: Not enough tools (${collectedTools.length}), re-parsing data.results (Relaxed)`);
        for (const result of data.results) {
            if (collectedTools.length >= minToolsRequired +1) break; // Get one extra for buffer

            const toolName = (result.title || "").split(/[\-|\|]/)[0].trim();
            const url = result.url || "";
            const description = (result.content || "").substring(0, 250) + "...";
            let pricing = "Unknown";
            const lowerContent = (result.content || "").toLowerCase();
            if (/\b(free|freemium)\b/.test(lowerContent)) pricing = "Freemium";
            else if (/\b(paid|premium|enterprise|subscription|\$)\b/.test(lowerContent)) pricing = "Paid";

            addToolToList({ name: toolName, description, pricing, url }, collectedTools, false); // Use relaxed filtering
        }
        // Re-deduplicate and sort after relaxed pass
        uniqueTools = Array.from(new Map(collectedTools.map(tool => [tool.url, tool])).values());
        uniqueTools.sort((a, b) => {
            const aIsPricing = isPricingUrl(a.url);
            const bIsPricing = isPricingUrl(b.url);
            if (aIsPricing && !bIsPricing) return -1;
            if (!aIsPricing && bIsPricing) return 1;
            if (a.description && a.description !== "N/A" && (!b.description || b.description === "N/A")) return -1;
            if ((!a.description || a.description === "N/A") && b.description && b.description !== "N/A") return 1;
            return 0;
        });
        collectedTools = uniqueTools;
    }

    let finalTools = collectedTools.slice(0, minToolsRequired);

    // If still less than minToolsRequired and mock data is enabled (no API key), fill with mock data.
    // Note: apiKey check was at the top. If we are here, apiKey is present.
    // So, this mock data part is more for a scenario where Tavily returns nothing useful despite having an API key.
    // However, the original mock data was only if !apiKey. Let's stick to that for now.
    // The primary goal is to return what Tavily gave, up to minToolsRequired.
    // If the user wants a strict minimum of 3 even if quality is poor, that's a different requirement.
    // For now, we return the best 0 to 3 tools found.

    // The original mock data was if !apiKey. If apiKey is present, we return what we found.
    // If finalTools.length is still < minToolsRequired and !apiKey (already handled at top), this won't be hit.
    // This block is effectively for a case where we want to force mock data if results are too few,
    // but the top-level check for !apiKey already handles the primary mock scenario.
    // Let's ensure it's consistent: mock data is only if TAVILY_API_KEY is missing.
    // The top-level `if (!apiKey)` handles this.

    console.log(`Returning ${finalTools.length} tools to client.`);
    return NextResponse.json({ tools: finalTools });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Search API error in POST:", errorMessage);
    return NextResponse.json({ error: `Failed to search for tools. ${errorMessage}` }, { status: 500 });
  }
}