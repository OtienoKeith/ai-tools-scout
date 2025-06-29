interface SearchMemory {
  query: string
  results: Array<{
    name: string
    description: string
    pricing: string
    url: string
  }>
  timestamp: string
}

export async function storeMemory(query: string, results: any[]): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_MEM0_API_KEY
  
  if (!apiKey) {
    console.warn("Mem0 API key not found, skipping memory storage")
    return
  }

  try {
    const memory: SearchMemory = {
      query,
      results,
      timestamp: new Date().toISOString()
    }

    const response = await fetch("https://api.mem0.ai/v1/memories/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`
      },
      body: JSON.stringify({
        data: JSON.stringify(memory), // Assuming 'data' field for the main content
        categories: ["ai-tools-search", `query-${query.toLowerCase().replace(/\s+/g, "-")}`]
      })
    })

    if (!response.ok) {
      throw new Error(`Mem0 API error: ${response.status}`)
    }

    console.log("Memory stored successfully")
  } catch (error) {
    console.error("Mem0 API error:", error)
    // Don't throw error to avoid breaking the search flow
  }
}

export async function getRecentMemories(): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_MEM0_API_KEY
  console.log("Mem0 API Key in getRecentMemories:", apiKey ? "Found" : "Not Found");
  
  if (!apiKey) {
    console.warn("Mem0 API key not found, using empty recent searches")
    return []
  }

  try {
    // Uses POST /v2/memories/search/
    const response = await fetch("https://api.mem0.ai/v2/memories/search/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`
      },
      body: JSON.stringify({
        filters: { categories: { "in": ["ai-tools-search"] } },
        // Assuming the API might return them sorted by relevance or creation date by default.
        // Limit will be handled client-side after fetching.
      })
    })

    if (!response.ok) {
      // Log more details from the response if possible
      const errorBody = await response.text();
      console.error("Mem0 API error details for getRecentMemories:", errorBody);
      throw new Error(`Mem0 API error: ${response.status} - ${response.statusText}. Details: ${errorBody}`)
    }

    const searchResults = await response.json() // This will be an array of memory objects
    
    const memoriesWithTimestamp: Array<SearchMemory & { rawTimestamp: string }> = [];

    for (const item of searchResults) {
      try {
        // The search response example shows "memory": "<string>" which should be our JSON string
        // It also has "data" sometimes in other contexts. Let's prioritize "memory".
        let contentToParse: string | null = null;
        if (typeof item.memory === 'string') {
            contentToParse = item.memory;
        } else if (typeof item.data === 'string') { // Fallback, though search result shows 'memory'
            contentToParse = item.data;
        } else if (item.data && typeof item.data.memory === 'string') { // If nested under data.memory
            contentToParse = item.data.memory;
        }


        if (contentToParse) {
          const parsedMemory: SearchMemory = JSON.parse(contentToParse);
          memoriesWithTimestamp.push({ ...parsedMemory, rawTimestamp: parsedMemory.timestamp });
        } else {
          console.warn("No parsable content found in memory item for recent searches:", item);
        }
      } catch (e) {
        console.warn("Failed to parse memory item for recent searches:", e, "Item:", item);
      }
    }

    // Sort by timestamp descending to get the most recent ones
    memoriesWithTimestamp.sort((a, b) => new Date(b.rawTimestamp).getTime() - new Date(a.rawTimestamp).getTime());

    // Take top 3 unique queries
    const uniqueQueries = new Set<string>();
    for (const mem of memoriesWithTimestamp) {
      if (mem.query) { // Ensure query is not undefined
          uniqueQueries.add(mem.query);
      }
      if (uniqueQueries.size >= 3) {
        break;
      }
    }
    return Array.from(uniqueQueries);
  } catch (error) {
    console.error("Mem0 API error:", error)
    return []
  }
}

export async function getMemoryByQuery(query: string): Promise<any[] | null> {
  const apiKey = process.env.NEXT_PUBLIC_MEM0_API_KEY
  console.log("Mem0 API Key in getMemoryByQuery:", apiKey ? "Found" : "Not Found");
  
  if (!apiKey) {
    console.warn("Mem0 API key for getMemoryByQuery not found. Cannot fetch from memory.");
    return null
  }

  try {
    // Uses POST /v2/memories/search/
    const response = await fetch("https://api.mem0.ai/v2/memories/search/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`
      },
      body: JSON.stringify({
        query: query, // The user's search query string
        filters: {
          categories: { "in": ["ai-tools-search", `query-${query.toLowerCase().replace(/\s+/g, "-")}`] }
        },
        // limit: 1 // API docs don't explicitly show limit in POST body. Fetching default and taking first.
      })
    })

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Mem0 API error details for getMemoryByQuery:", errorBody);
      throw new Error(`Mem0 API error: ${response.status} - ${response.statusText}. Details: ${errorBody}`)
    }

    const searchResults = await response.json() // Array of memory objects
    
    if (searchResults && searchResults.length > 0) {
      // Assuming the most relevant result is first, or we don't have specific sorting from API here
      const item = searchResults[0];
      try {
        let contentToParse: string | null = null;
        if (typeof item.memory === 'string') {
            contentToParse = item.memory;
        } else if (typeof item.data === 'string') {
            contentToParse = item.data;
        } else if (item.data && typeof item.data.memory === 'string') {
            contentToParse = item.data.memory;
        }

        if (contentToParse) {
          const parsedMemory: SearchMemory = JSON.parse(contentToParse);
          // Check if the query stored in memory matches the requested query for higher relevance,
                          // though the API search with query text should ideally handle this.
          if (parsedMemory.query.toLowerCase() === query.toLowerCase()) {
            return parsedMemory.results;
          } else {
            console.warn(`Retrieved memory query '${parsedMemory.query}' does not exactly match requested query '${query}'. Discarding.`);
          }
        } else {
          console.warn("No parsable content found in memory item for getMemoryByQuery:", item);
        }
      } catch (e) {
        console.warn("Failed to parse memory for getMemoryByQuery:", e, "Item:", item);
      }
    }

    return null
  } catch (error) {
    console.error("Mem0 API error:", error)
    return null
  }
} 