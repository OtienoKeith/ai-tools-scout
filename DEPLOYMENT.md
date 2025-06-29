# AI Tools Scout - Deployment Guide

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Tavily API Key for AI tools search
# Get your API key from: https://tavily.com/
TAVILY_API_KEY=your_tavily_api_key_here

# Mem0 API Key for memory storage
# Get your API key from: https://mem0.ai/
NEXT_PUBLIC_MEM0_API_KEY=your_mem0_api_key_here
```

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the same environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add `TAVILY_API_KEY` and `NEXT_PUBLIC_MEM0_API_KEY`

### API Keys Setup

#### Tavily API
1. Visit https://tavily.com/
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your environment variables

#### Mem0 API
1. Visit https://mem0.ai/
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your environment variables

## Testing the App

1. Start the development server: `npm run dev`
2. Test the search functionality
3. Verify that memories are stored and retrieved
4. Test the recent searches feature
5. Confirm end-to-end flow: input → search → result → store → reload → recall

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] API keys are valid and working
- [ ] App loads without errors
- [ ] Search functionality works
- [ ] Memory storage works
- [ ] Recent searches display correctly
- [ ] Error handling works properly 