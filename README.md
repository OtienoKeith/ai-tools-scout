# AI Tools Scout 🔍

A modern web application that helps you discover the best AI tools for any task. Simply describe what you need help with, and AI Tools Scout will search the web to find the most relevant AI tools, complete with descriptions, pricing information, and direct links.

## ✨ Features

- **🔍 Smart Search**: Search for AI tools using natural language queries
- **💾 Memory Storage**: Automatically saves your searches using Mem0 for quick access
- **📱 Recent Searches**: View and reuse your previous searches
- **🎯 Tool Discovery**: Find tools with detailed information including pricing and descriptions
- **⚡ Fast Results**: Get results quickly with optimized search algorithms
- **🎨 Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **🛡️ Error Handling**: Robust error handling with user-friendly messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Tavily API key
- Mem0 API key (optional, for memory features)

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
   TAVILY_API_KEY=your_tavily_api_key_here
   
   # Mem0 API Key for memory storage (optional)
   NEXT_PUBLIC_MEM0_API_KEY=your_mem0_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Setup

### Tavily API
1. Visit [https://tavily.com/](https://tavily.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

### Mem0 API (Optional)
1. Visit [https://mem0.ai/](https://mem0.ai/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

## 📖 Usage

### Basic Search
1. Enter your query in the search box (e.g., "AI writing assistant", "image generation tools")
2. Click the "Search" button or press Enter
3. View the results with tool information, pricing, and links

### Recent Searches
- Your searches are automatically saved (if Mem0 is configured)
- Click on any recent search to quickly retrieve those results
- Recent searches appear below the search input

### Tool Information
Each tool result includes:
- **Name**: Tool name and brand
- **Description**: Brief overview of functionality
- **Pricing**: Free, Freemium, or Paid
- **Link**: Direct link to the tool's website

## 🏗️ Project Structure

```
ai-tools-scout/
├── app/
│   ├── api/search/          # Tavily API integration
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
├── components/
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── mem0-api.ts          # Mem0 API integration
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
└── styles/                  # Additional styles
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **APIs**: Tavily Search API, Mem0 Memory API

## 🚀 Simple Deployment

### Deploy to Vercel (1-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OtienoKeith/ai-tools-scout)

### Manual Deployment Steps

1. **Fork this repository** to your GitHub account
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Vercel will auto-detect it's a Next.js project

3. **Add Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add these two variables:
     ```
     TAVILY_API_KEY=your_tavily_api_key_here
     NEXT_PUBLIC_MEM0_API_KEY=your_mem0_api_key_here
     ```

4. **Deploy** - Vercel will automatically deploy!

### Get API Keys

- **Tavily API**: [https://tavily.com/](https://tavily.com/) (Required)
- **Mem0 API**: [https://mem0.ai/](https://mem0.ai/) (Optional - for memory features)

That's it! Your app will be live in minutes. 🎉

## 🔍 How It Works

1. **User Input**: User enters a search query
2. **API Search**: Query is sent to Tavily API to search the web
3. **Result Processing**: Search results are processed to extract tool information
4. **Memory Storage**: Successful searches are stored in Mem0 (if configured)
5. **Display**: Results are displayed in a clean, card-based layout
6. **Recent Access**: Users can access previous searches from memory

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
- [Mem0](https://mem0.ai/) for memory storage capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the amazing framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment and steps to reproduce

---

**Made with ❤️ for the AI community** 