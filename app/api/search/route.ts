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
        query: `List 3 actual AI software tools or applications for "${query}". For each tool, provide ONLY: 1. Name of the tool. 2. A brief (1-2 sentence) description of its primary function. 3. Pricing model (e.g., Freemium, Paid, Subscription). 4. A direct URL to the tool's homepage. CRITICALLY IMPORTANT: Do NOT include blogs, articles, news, listicles, or any URLs that are not the direct homepage of an AI tool. Focus on specific, usable software. Return results in a clean, parseable format.`,
        search_depth: "advanced", // Using advanced for better answer synthesis
        include_answer: true, // Request Tavily's synthesized answer
        include_raw_content: false, // We don't need raw search results snippets if answer is good
        max_results: 5, // Ask for slightly more to have a buffer for filtering
        topic: "ai tools" // Specify the topic
      })
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()
    // console.log("Tavily API Response:", JSON.stringify(data, null, 2)); // For debugging Tavily's output

    const tools: TavilyTool[] = [];
    // Enhanced keywords to filter out non-tool content more aggressively
    const blogLikeKeywords = /\b(blog|article|news|updates|tutorial|guide|review|vs|compare|alternatives|insight|story|case stud(y|ies)|how to|learn|discover|understand|become|master|roundup|collection|listicle|top\s*\d*|best\s*\d*|\d+\s+(tools|ways|apps|sites|platforms|resources|examples|services))\b/i;
    const urlKeywordsToAvoid = /\/(blog|article|news|docs|guides|tutorials|support|community|forum|showcase|examples|category|tag|author)\/|\b(medium\.com|wordpress\.com|blogspot\.com|substack\.com|dev\.to|youtube\.com\/watch|reddit\.com\/r\/)\b/i;
    const nonToolTitleKeywords = /\b(what is|how does|why use|future of|impact of|introduction to|beginner's guide to)\b/i; // Keywords often found in informational titles

    if (data.answer) {
      // Attempt to parse structured information if Tavily provides it in a consistent way.
      // This part requires knowing the exact structure of `data.answer` when it's well-formatted.
      // For now, we'll assume `data.answer` is a block of text that needs line-by-line parsing.
      // A more robust solution would be to adapt if Tavily has a structured answer format.
      console.log("Attempting to parse data.answer:\n", data.answer);
      const lines = data.answer.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines

      let currentTool: Partial<TavilyTool> = {};

      for (const line of lines) {
        if (tools.length >= 3) break;

        // Skip lines that look like blog titles or common non-tool phrases
        if (blogLikeKeywords.test(line) || nonToolTitleKeywords.test(line)) {
          console.log(`Skipping line due to blog/non-tool keywords: ${line}`);
          currentTool = {}; // Reset current tool if a problematic line is encountered
          continue;
        }

        const nameMatch = line.match(/^(?:1\.|-\s*)?Name:\s*(.+)/i) || line.match(/^(?:Tool(?: Name)?|Name):\s*(.+)/i) || line.match(/^([^-:]+?)\s*-\s*(?:AI Tool|Software)/i);
        const descMatch = line.match(/^(?:2\.|-\s*)?Description:\s*(.+)/i);
        const pricingMatch = line.match(/^(?:3\.|-\s*)?Pricing:\s*(.+)/i);
        const urlMatch = line.match(/^(?:4\.|-\s*)?Link:\s*(https?:\/\/[^\s]+)/i) || line.match(/URL:\s*(https?:\/\/[^\s]+)/i);

        if (nameMatch && nameMatch[1]) {
            if (currentTool.name && currentTool.url) { // If we have a complete previous tool, push it
                 if (!blogLikeKeywords.test(currentTool.name) && currentTool.url && !urlKeywordsToAvoid.test(currentTool.url)) {
                    tools.push(currentTool as TavilyTool);
                    if (tools.length >= 3) break;
                 }
            }
            currentTool = { name: nameMatch[1].trim(), description: "N/A", pricing: "Unknown" };
            console.log(`Parsed Name: ${currentTool.name}`);
        } else if (descMatch && descMatch[1] && currentTool.name) {
            currentTool.description = descMatch[1].trim();
            console.log(`Parsed Description: ${currentTool.description}`);
        } else if (pricingMatch && pricingMatch[1] && currentTool.name) {
            currentTool.pricing = pricingMatch[1].trim();
            console.log(`Parsed Pricing: ${currentTool.pricing}`);
        } else if (urlMatch && urlMatch[1] && currentTool.name) {
            currentTool.url = urlMatch[1].trim();
            console.log(`Parsed URL: ${currentTool.url}`);
            // This is often the last piece of info, try to push the tool
            if (!blogLikeKeywords.test(currentTool.name) && !urlKeywordsToAvoid.test(currentTool.url)) {
                tools.push(currentTool as TavilyTool);
                console.log("Added tool from answer:", currentTool);
                currentTool = {}; // Reset for next tool
            } else {
                console.log(`Skipping tool due to URL/Name keywords: ${currentTool.name} - ${currentTool.url}`);
                currentTool = {}; // Reset
            }
        }
      }
      // Add the last processed tool if it's complete and hasn't been added
      if (tools.length < 3 && currentTool.name && currentTool.url && !tools.some(t => t.url === currentTool.url)) {
         if (!blogLikeKeywords.test(currentTool.name) && !urlKeywordsToAvoid.test(currentTool.url)) {
            tools.push(currentTool as TavilyTool);
            console.log("Added last processed tool from answer:", currentTool);
         }
      }
    }

    // Fallback to data.results if answer parsing yields too few tools (less than 3) or is not present
    if (tools.length < 3 && data.results && Array.isArray(data.results)) {
      console.log("Falling back to data.results for additional tools.");
      for (const result of data.results) {
        if (tools.length >= 3) break;

        const title = result.title || "";
        const url = result.url || "";
        const contentSnippet = (result.content || "").substring(0, 200); // Limit snippet length

        // Stricter filtering for results
        if (blogLikeKeywords.test(title) || nonToolTitleKeywords.test(title) || urlKeywordsToAvoid.test(url) || blogLikeKeywords.test(contentSnippet)) {
          console.log(`Skipping result from data.results due to keywords: ${title} (${url})`);
          continue;
        }

        // Additional check: if the URL was already added from 'answer' parsing, skip it.
        if (tools.some(t => t.url === url)) {
            console.log(`Skipping result (already added from answer): ${title} (${url})`);
            continue;
        }

        const toolName = title.split(/[\-|\|]/)[0].trim(); // Get text before first pipe or hyphen
        if (!toolName || blogLikeKeywords.test(toolName) || nonToolTitleKeywords.test(toolName)) {
            console.log(`Skipping result due to problematic tool name: ${toolName}`);
            continue;
        }

        let pricing = "Unknown";
        const lowerContent = contentSnippet.toLowerCase();
        if (/\b(free|freemium)\b/.test(lowerContent)) pricing = "Freemium";
        else if (/\b(paid|premium|enterprise|subscription|\$)\b/.test(lowerContent)) pricing = "Paid";

        // Avoid adding if it's just a domain without a clear tool name or if name is too generic
        if (toolName.toLowerCase() === "home" || toolName.split(' ').length > 5) { // Example: filter out generic names or very long titles
            console.log(`Skipping result due to generic/long name: ${toolName}`);
            continue;
        }

        tools.push({
            name: toolName,
            description: contentSnippet + (contentSnippet.length === 200 ? "..." : ""),
            pricing,
            url
        });
        console.log("Added tool from data.results:", { name: toolName, url, pricing });
      }
    }

    // Deduplicate tools based on URL, preferring those parsed from `data.answer` if structure is similar
    const uniqueTools = Array.from(new Map(tools.map(tool => [tool.url, tool])).values());

    return NextResponse.json({ tools: uniqueTools.slice(0, 3) }) // Ensure we only return max 3 unique tools
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: 'Failed to search for tools' }, { status: 500 })
  }
} 