# Content Curator

AI-powered real-time content curator for short-form video ideas using GitHub Copilot and Exa AI.

Generate viral content ideas, scripts, and hooks for **Instagram Reels**, **YouTube Shorts**, and **TikTok** — all powered by real-time web search.

## Features

- 🔍 **Real-time Web Search** - Uses Exa AI direct API to search for current trends and topics
- 💡 **Content Ideas** - Generate viral-worthy content ideas based on research
- 📝 **Full Scripts** - Complete short-form video scripts with hooks, body, and CTA
- 🎣 **Hook Generator** - Multiple scroll-stopping hook variations
- 🔥 **Trending Analysis** - Discover trending topics and viral opportunities
- 📱 **Multi-Platform** - Optimized for Instagram, YouTube Shorts, and TikTok
- 🎨 **Recording Suggestions** - Camera angles, b-roll, styling, and audio tips

## Prerequisites

- Node.js 18+
- GitHub Copilot subscription
- Exa AI API key (for web search)

## Installation

```bash
# Clone and navigate to the project
cd cookbook/nodejs/recipe/content-curator

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Exa AI API Key

Get your API key from [Exa AI](https://exa.ai) and configure it using a `.env` file:

```bash
# Create .env file in the project root
echo "EXA_API_KEY=your-exa-api-key-here" > .env

# Or manually create .env file with:
# EXA_API_KEY=your-exa-api-key-here
```

**Note:** The `.env` file is automatically loaded when you run the app. Don't commit it to version control (it's already in `.gitignore`).

## Usage

```bash
# Run the CLI
npm start

# Or with an initial topic
npm start "AI productivity tools"
```

### Commands

| Command | Description |
|---------|-------------|
| `/search` | Research topic with real-time web search |
| `/ideas` | Generate content ideas |
| `/script` | Create a full video script |
| `/trending` | Find trending angles |
| `/hooks` | Generate hook variations |
| `/full` | Complete content package |
| `/platform` | Switch target platform (IG/YT/TT) |
| `/topic` | Change research topic |
| `/copy` | Copy last content to clipboard |
| `/last` | Show last generated content |
| `/model` | Switch AI model |
| `/help` | Show help |
| `/quit` | Exit |

### Workflow Example

1. **Start with a topic**: Enter your niche or content idea
2. **Select platform**: Choose Instagram, YouTube, TikTok, or all
3. **Research first**: Use `/search` to gather current information
4. **Generate ideas**: Use `/ideas` to get content angles
5. **Create script**: Use `/script` for a complete video script
6. **Refine**: Type any message to refine the last content
7. **Copy & Create**: Use `/copy` to copy and start filming!

## Output Structure

### Script Output Includes:
- **Hook** - The attention-grabbing first 3 seconds
- **Body** - Key content beats with dialogue
- **CTA** - Call to action
- **Recording Suggestions** - Camera setup, b-roll, transitions
- **Visual Style** - Aesthetic, colors, fonts, lighting
- **Audio Suggestions** - Music vibe, trending sounds
- **Hashtags** - Platform-optimized hashtag set

## Architecture

```
content-curator/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── types.ts           # TypeScript interfaces
│   ├── services/
│   │   ├── copilot.ts     # Copilot client service
│   │   └── exa.ts         # Exa AI direct API integration
│   ├── prompts/
│   │   └── templates.ts   # AI prompt templates
│   ├── ui/
│   │   ├── display.ts     # Terminal rendering
│   │   ├── prompts.ts     # Interactive prompts
│   │   └── themes.ts      # Colors and styling
│   └── utils/
│       └── clipboard.ts   # Clipboard utilities
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Topic Input**: You provide a topic or niche to research
2. **Exa API Search**: Direct API call to Exa AI for real-time web search
3. **AI Analysis**: GitHub Copilot analyzes results and generates content
4. **Platform Optimization**: Output is tailored to your selected platform

## Example Session

```
❯ npm start "productivity hacks"

🔍 Topic: productivity hacks
📱 Platform: YouTube Shorts

❯ /ideas

💡 Content Ideas: productivity hacks

### Idea 1: "The 2-Minute Rule Changed My Life"
**Hook:** "I was working 12 hours and getting nothing done..."
**Angle:** Personal transformation story + tactical advice
**Why it works:** Combines emotional story with actionable tip
**Trending potential:** ⭐⭐⭐⭐⭐

...

❯ /script

📝 Reel Script: productivity hacks

### 🎣 HOOK (0-3 seconds)
"Stop planning your day like this" [show calendar overwhelm]

### 📖 BODY
**Beat 1:** "The problem isn't your schedule—it's decision fatigue"
**Beat 2:** "Here's what I do instead: the 3-3-3 method"
**Beat 3:** "3 deep work blocks, 3 quick tasks, 3 maintenance items"

### 🎯 CTA
"Save this for tomorrow morning ☀️"

### 🎬 Recording Suggestions
**Camera Setup:** Talking head with screen recording B-roll
**B-Roll Ideas:** Messy desk → clean desk transition
...
```

## License

MIT
