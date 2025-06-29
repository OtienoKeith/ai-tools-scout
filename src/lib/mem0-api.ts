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
  const apiKey = import.meta.env.VITE_MEM0_API_KEY
  
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

    const response = await fetch("https://api.mem0.ai/memories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        content: JSON.stringify(memory),
        tags: ["ai-tools-search", query.toLowerCase().replace(/\s+/g, "-")]
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
  const apiKey = import.meta.env.VITE_MEM0_API_KEY
  
  if (!apiKey) {
    console.warn("Mem0 API key not found, using empty recent searches")
    return []
  }

  try {
    const response = await fetch("https://api.mem0.ai/memories?tags=ai-tools-search&limit=3", {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Mem0 API error: ${response.status}`)
    }

    const data = await response.json()
    const memories: string[] = []
    
    for (const memory of data.memories || []) {
      try {
        const parsedMemory: SearchMemory = JSON.parse(memory.content)
        memories.push(parsedMemory.query)
      } catch (e) {
        console.warn("Failed to parse memory:", e)
      }
    }

    return memories
  } catch (error) {
    console.error("Mem0 API error:", error)
    return []
  }
}

export async function getMemoryByQuery(query: string): Promise<any[] | null> {
  const apiKey = import.meta.env.VITE_MEM0_API_KEY
  
  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(`https://api.mem0.ai/memories?tags=ai-tools-search&search=${encodeURIComponent(query)}&limit=1`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Mem0 API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.memories && data.memories.length > 0) {
      try {
        const parsedMemory: SearchMemory = JSON.parse(data.memories[0].content)
        return parsedMemory.results
      } catch (e) {
        console.warn("Failed to parse memory:", e)
      }
    }

    return null
  } catch (error) {
    console.error("Mem0 API error:", error)
    return null
  }
} 