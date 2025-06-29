# AI Tools Scout 🔍

A modern web application that helps you discover the best AI tools for any task. Simply describe what you need help with, and AI Tools Scout will search a curated database to find the most relevant AI tools, complete with descriptions, pricing information, and direct links to pricing pages.

## ✨ Features

- **🔍 Smart Search**: Search for AI tools using natural language queries
- **🎯 Tool Discovery**: Find tools with detailed information including pricing and descriptions
- **💰 Pricing Information**: Direct links to pricing pages for each tool
- **⚡ Fast Results**: Get results quickly with optimized search algorithms and caching
- **🎨 Modern UI**: Beautiful, responsive interface built with Vite and Tailwind CSS
- **🛡️ Error Handling**: Robust error handling with user-friendly, emoji-rich messages
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🧠 Curated Results**: Hardcoded demo queries and a comprehensive AI tool database for accuracy
- **❌ No Inaccurate Fallbacks**: If no relevant tools are found, a friendly message is shown—never misleading results

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm

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

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Tavily API Key for AI tools search (optional, for future expansion)
   VITE_TAVILY_API_KEY=your_tavily_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📖 Usage

### Basic Search
1. Enter your query in the search box (e.g., "AI writing assistant", "image generation tools")
2. Click the "Search" button or press Enter
3. View the results with tool information, pricing, and links

### Tool Information
Each tool result includes:
- **Name**: Tool name and brand
- **Description**: Brief overview of functionality
- **Pricing**: Free, Freemium, or Paid with direct pricing page link
- **Visit Site**: Direct link to the tool's website
- **Pricing Button**: Direct link to the tool's pricing page (when available)

## 🧠 How Results Work

- **Popular Demo Queries**: 10+ popular queries (like "image generation", "project management", "email") always return a handpicked, accurate list of real AI tools.
- **Curated Database**: For all other queries, a large, categorized AI tool database is used for smart matching.
- **No Inaccurate Fallbacks**: If no relevant tools are found, you get a friendly, emoji-rich message (not a card) encouraging you to try another search or explore popular categories.
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
│   ├── tavily-api.ts        # Curated AI tool database and search logic
│   └── utils.ts             # Utility functions
├── components/
│   └── ui/                  # Reusable UI components
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## 🛠️ Tech Stack

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
   - `VITE_TAVILY_API_KEY=your_tavily_api_key_here` (optional)
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

## 🔍 Search Features

### Enhanced Search Algorithm
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

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Vite](https://vitejs.dev/) for the fast build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment and steps to reproduce

---

**Made with ❤️ for the AI community** 