# AI Tools Scout 🔍

AI Tools Scout is a modern web application that helps you discover the best AI tools for any task—powered by the incredible **Tavily API**. Just describe what you need, and Tavily's advanced search delivers the most relevant AI tools, complete with descriptions, pricing, and direct links.

## ✨ Features (Powered by Tavily)

- **🌟 Tavily-Powered Search**: All tool discovery is driven by the Tavily API for the most accurate, up-to-date results
- **🔍 Natural Language Search**: Find AI tools using plain English queries—Tavily understands your intent
- **🎯 Tool Discovery**: Get detailed info, pricing, and direct links for every tool
- **💰 Pricing Information**: See pricing models and go straight to pricing pages
- **⚡ Fast Results**: Lightning-fast search, thanks to Tavily's optimized API and local caching
- **🎨 Modern UI**: Beautiful, responsive interface built with Vite and Tailwind CSS
- **🛡️ Friendly Error Handling**: Emoji-rich, user-friendly messages if no tools are found
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- **Tavily API key** (required)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-tools-scout
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Set up your Tavily API key**
   Create a `.env.local` file in the root directory:
   ```bash
   VITE_TAVILY_API_KEY=your_tavily_api_key_here
   ```
4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
5. **Open your browser**
   Go to [http://localhost:5173](http://localhost:5173)

## 📖 Usage

### Search with Tavily
1. Enter your query (e.g., "AI writing assistant", "image generation tools")
2. Click "Search" or press Enter
3. Instantly see Tavily-powered results: tool info, pricing, and links

### Tool Information
Each result includes:
- **Name**: Tool name and brand
- **Description**: Brief overview
- **Pricing**: Free, Freemium, or Paid (with direct pricing page link)
- **Visit Site**: Direct link to the tool's homepage
- **Pricing Button**: Direct link to the tool's pricing page (when available)

## 🧠 How Tavily Results Work

- **Popular Demo Queries**: 10+ popular queries (like "image generation", "project management", "email") always return a handpicked, accurate list of real AI tools—thanks to Tavily's advanced search and our prompt engineering.
- **Tavily-Powered Discovery**: For all other queries, Tavily's API finds the best matches from across the web, filtered and structured for clarity.
- **No Inaccurate Fallbacks**: If Tavily can't find relevant tools, you get a friendly, emoji-rich message (not a card) encouraging you to try another search or explore popular categories.
- **No More Misleading Results**: The app never shows unrelated or generic fallback tools for obscure searches—credibility is maintained.

### Example No Results Experience
If you search for something unrelated (like "carrot chopper"), you'll see:

😕 Oops! We couldn't find any AI tools for "carrot chopper".

🔍 You can try a different keyword like:
✏️ writing | 🎨 design | 📊 data analysis | 🤖 automation

Or do a manual search — sometimes the best tools are just one click away! 🧭

## 🏗️ Project Structure

```
ai-tools-scout/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type definitions
├── lib/
│   ├── tavily-api.ts        # Tavily API integration and search logic
│   └── utils.ts             # Utility functions
├── components/
│   └── ui/                  # Reusable UI components
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## 🛠️ Tech Stack

- **Search Engine**: 🌟 **Tavily API** (core of all tool discovery)
- **Framework**: Vite + React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 🚀 Deployment Instructions

### Deploy to Vercel
1. **Framework Preset:** Vite
2. **Root Directory:** `./` (the root of your repo)
3. **Build Command:** `vite build` (or leave blank for auto-detect)
4. **Output Directory:** `dist`
5. **Environment Variables:**
   - `VITE_TAVILY_API_KEY=your_tavily_api_key_here`
6. **Deploy!**

### Deploy to Netlify
1. **Build Command:** `vite build`
2. **Publish Directory:** `dist`
3. **Environment Variables:** Same as above

### Local Development
```bash
npm install
npm run dev
```
App will be at [http://localhost:5173](http://localhost:5173)

## 🔍 Search Features (All Powered by Tavily)

- **Handpicked Demo Results**: Always returns accurate, real AI tools for popular queries
- **Smart Filtering**: Filters out blog posts, articles, and non-tool content
- **Pricing Detection**: Automatically detects and categorizes pricing models
- **No Fallback Tools**: Never shows generic or misleading fallback tools
- **Caching**: 5-minute cache for faster repeated searches

### Result Quality
- **Direct Links**: Links go directly to tool homepages, not review sites
- **Pricing Pages**: Direct links to pricing pages when available
- **Accurate Descriptions**: Brief, accurate descriptions of tool functionality
- **Pricing Categories**: Clear pricing classification (Free, Freemium, Paid)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tavily](https://tavily.com/) for powering all search and discovery
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Vite](https://vitejs.dev/) for the fast build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment and steps to reproduce

---

**Made with ❤️ and powered by Tavily for the AI community** 