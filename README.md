# AI Tools Scout 🔍

A modern web application that helps you discover the best AI tools for any task. Simply describe what you need help with, and AI Tools Scout will search the web to find the most relevant AI tools, complete with descriptions, pricing information, and direct links to pricing pages.

## ✨ Features

- **🔍 Smart Search**: Search for AI tools using natural language queries
- **🎯 Tool Discovery**: Find tools with detailed information including pricing and descriptions
- **💰 Pricing Information**: Direct links to pricing pages for each tool
- **⚡ Fast Results**: Get results quickly with optimized search algorithms and caching
- **🎨 Modern UI**: Beautiful, responsive interface built with Vite and Tailwind CSS
- **🛡️ Error Handling**: Robust error handling with user-friendly messages
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Tavily API key

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
   # Tavily API Key for AI tools search
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

## 🔧 API Setup

### Tavily API
1. Visit [https://tavily.com/](https://tavily.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file as `VITE_TAVILY_API_KEY`

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

## 🏗️ Project Structure

```
ai-tools-scout/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type definitions
├── lib/
│   ├── tavily-api.ts        # Tavily API integration
│   └── utils.ts             # Utility functions
├── components/
│   └── ui/                  # Reusable UI components
├── public/                  # Static assets
├── app/                     # Next.js app directory (legacy)
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
- **APIs**: Tavily Search API
- **Build Tool**: Vite

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

## 🔍 Search Features

### Enhanced Search Algorithm
- **Minimum 3 Results**: Always returns at least 3 relevant AI tools
- **Smart Filtering**: Filters out blog posts, articles, and non-tool content
- **Pricing Detection**: Automatically detects and categorizes pricing models
- **Fallback Tools**: Includes popular AI tools as fallbacks when needed
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

- [Tavily](https://tavily.com/) for providing the search API
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