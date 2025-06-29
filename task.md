# AI Tools Scout - Task Checklist & Rules

## TASK CHECKLIST (IN ORDER)

### 1. 🔧 App State Setup
- [x] Define 5 main state variables:
  - [x] `userInput`
  - [x] `results`
  - [x] `loading`
  - [x] `error`
  - [x] `recentSearches`

### 2. 🔍 Tavily API Logic
- [x] On clicking "Search" button:
  - [x] Show loading state
  - [x] Call Tavily API using user's input
  - [x] Extract 3 tools: Name, Description, Price, Link
  - [x] Save to results state
  - [x] Turn off loading state
  - [x] Handle errors (set error if failed)

### 3. 💾 Mem0 Integration
- [x] After every successful search:
  - [x] Send the query + results to Mem0 (store memory)
- [x] On app load:
  - [x] Fetch memories from Mem0
  - [x] Keep only the 3 most recent
  - [x] Save them to recentSearches state
- [x] When a recent search is clicked:
  - [x] Set userInput to that past query
  - [x] Set results to its saved tools
  - [x] Skip Tavily fetch

### 4. 🎯 Display Logic
- [x] When loading: show a spinner (already in UI)
- [x] When error is set: show a visible error message
- [x] If no results: show "No tools found" placeholder
- [x] When results exist: display tool cards (already in UI)
- [x] When recentSearches exist: display them below input (clickable)

### 5. 🌐 Deployment Readiness
- [x] Create `.env` file with `VITE_TAVILY_API_KEY` and `VITE_MEM0_API_KEY`
- [x] Set the same environment variables in Vercel
- [x] Confirm app works end-to-end: input → search → result → store → reload → recall

---

## ⚠️ HARD RULES (Cursor Must Follow)

### ❌ Do NOT
- ❌ Do NOT modify the HTML structure
- ❌ Do NOT change TailwindCSS classes
- ❌ Do NOT rename or rearrange UI components
- ❌ Do NOT add new pages or routing
- ❌ Do NOT create unused components

### ✅ DO
- ✅ Only wire logic into the existing Superdev UI
- ✅ Keep code clean, minimal, and readable
- ✅ Use React state and effect hooks responsibly
- ✅ Always check for and handle API errors
- ✅ Refer to this checklist if confused or stuck

---

## Implementation Notes
- Follow the checklist in exact order
- Each step builds upon the previous
- Test each step before moving to the next
- Keep the existing UI structure intact
- Focus on functionality over aesthetics 