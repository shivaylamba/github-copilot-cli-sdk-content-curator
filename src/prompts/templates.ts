/**
 * Content-specific prompt templates for the Content Curator
 * Each template is optimized for generating specific content types
 */

import type { ContentType, Platform } from "../types.js";

/**
 * Base system prompt that establishes the AI's role and capabilities
 */
export const SYSTEM_PROMPT_BASE = `
<role>
You are a viral content strategist and short-form video expert. Your job is to analyze trending topics and create compelling short-form video ideas for Instagram Reels, YouTube Shorts, and TikTok.
</role>

<expertise>
- Understanding of platform-specific algorithms (Instagram, YouTube, TikTok)
- Hook writing that captures attention in the first 3 seconds
- Storytelling frameworks for 15-60 second videos
- Trending audio and format awareness
- Engagement optimization techniques
- Visual style recommendations
</expertise>

<style_guidelines>
- Be concise and punchy - every word counts in short-form
- Focus on hooks that create curiosity gaps
- Include specific, actionable recording tips
- Match the tone to the target platform
- Use trending formats when relevant
- Always back ideas with real data from search results when provided
</style_guidelines>

<output_rules>
CRITICAL: Output ONLY the formatted content. No preamble, no explanations, no "here's what I found" text. Start directly with the markdown heading and content.
</output_rules>
`;

/**
 * Platform-specific guidelines
 */
export const PLATFORM_GUIDELINES: Record<Platform, string> = {
  instagram: `
## Instagram Reels Guidelines
- Optimal length: 15-30 seconds (can go up to 90s for tutorials)
- Square (1:1) or vertical (9:16) format
- Text overlays should be bold and readable
- Use trending audio when possible
- Focus on aesthetic visual appeal
- Include call-to-action for saves and shares
- Hashtag strategy: 5-10 relevant hashtags
`,
  youtube: `
## YouTube Shorts Guidelines
- Optimal length: 30-60 seconds
- Vertical format (9:16)
- Strong hook in first 3 seconds is critical
- Can be more educational/informational
- Titles matter more than other platforms
- Focus on high retention throughout
- End with a subscribe reminder or question
`,
  tiktok: `
## TikTok Guidelines
- Optimal length: 15-60 seconds
- Raw, authentic content performs well
- Trend participation is key
- Use trending sounds and effects
- Duets and stitches for engagement
- Fast-paced editing preferred
- Controversial or opinion-based hooks work well
`,
  all: `
## Cross-Platform Guidelines
- Create content that can be repurposed across platforms
- Lead with a universal hook
- Keep core message in first 30 seconds
- Adjust captions/hashtags per platform
- Consider different audience demographics
`,
};

/**
 * Get the specific prompt for a content type
 */
export function getContentPrompt(
  contentType: ContentType,
  context: { topic: string; platform: Platform; additionalContext?: string }
): string {
  const { topic, platform, additionalContext } = context;
  const platformGuide = PLATFORM_GUIDELINES[platform];

  const prompts: Record<ContentType, string> = {
    search: `
Research the topic "${topic}" using real-time web search.

First, call web_search_exa to find:
1. Latest news and developments
2. Trending discussions and controversies
3. Popular content about this topic
4. Expert opinions and insights

Then synthesize your findings:

## 🔍 Research Results: ${topic}

### 📰 Latest News & Developments
[Key recent events and updates - with sources]

### 🔥 Trending Angles
[What aspects are getting the most attention right now]

### 💬 Public Sentiment
[What people are saying, common opinions, controversies]

### 📊 Key Statistics
[Relevant numbers and data points]

### 🔗 Top Sources
[List the most valuable sources found]

${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}
`,

    ideas: `
Based on research about "${topic}", generate 5 viral short-form content ideas.

First, call web_search_exa to understand:
- What's currently trending about this topic
- What angles are working for other creators
- Any news or updates that create content opportunities

${platformGuide}

Then generate exactly 5 content ideas:

## 💡 Content Ideas: ${topic}

### Idea 1: [Catchy Title]
**Hook:** [First 3 seconds - the attention grabber]
**Angle:** [The unique perspective or approach]
**Why it works:** [Platform-specific reasoning]
**Trending potential:** ⭐⭐⭐⭐⭐ (rate 1-5)

### Idea 2: [Catchy Title]
...

[Continue for all 5 ideas]

---
**Best for ${platform}:** [Recommend which idea fits best]

${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}
`,

    script: `
Create a complete short-form video script for "${topic}".

First, call web_search_exa to gather:
- Current facts and statistics
- Trending angles on this topic
- Popular formats being used

${platformGuide}

Then create a detailed script:

## 📝 Reel Script: ${topic}

### 🎣 HOOK (0-3 seconds)
[Write the exact opening line - must stop the scroll]

### 📖 BODY (3-45 seconds)
**Beat 1:** [First key point with exact dialogue]
**Beat 2:** [Second key point with exact dialogue]
**Beat 3:** [Third key point with exact dialogue]

### 🎯 CTA (Final 5-10 seconds)
[Call to action - what you want viewers to do]

---

### 🎬 Recording Suggestions
**Camera Setup:** [Angles, framing, movement]
**B-Roll Ideas:** [Supplementary footage to capture]
**On-Screen Text:** [Key text overlays with timing]
**Transitions:** [Recommended transition styles]

### 🎨 Visual Style
**Aesthetic:** [Overall look and feel]
**Color Palette:** [Suggested colors]
**Font Style:** [For text overlays]
**Lighting:** [Lighting recommendations]

### 🎵 Audio Suggestions
**Music Vibe:** [Type of background music]
**Trending Sounds:** [If applicable, suggest trending audio]
**Voiceover Tips:** [Tone, pacing, energy level]

### #️⃣ Hashtags
[10 relevant hashtags for ${platform}]

### ⏱️ Estimated Duration: [X seconds]

${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}
`,

    trending: `
Find trending topics and viral content opportunities related to "${topic}".

Call web_search_exa to discover:
1. Trending hashtags and challenges
2. Viral videos in this niche (last 7 days)
3. Emerging trends before they peak
4. Controversy or debate topics

${platformGuide}

## 🔥 Trending Report: ${topic}

### 📈 Hot Right Now
[Topics at peak virality - act fast]

### 🌱 Rising Trends
[Emerging trends with growth potential]

### 💥 Controversy & Debate
[Polarizing topics driving engagement]

### 🎵 Trending Audio/Formats
[Popular sounds and video formats to use]

### ⚡ Quick Win Ideas
[5 content ideas you could create TODAY]

| Trend | Virality | Difficulty | Best Platform |
|-------|----------|------------|---------------|
| [Trend 1] | 🔥🔥🔥 | Easy | ${platform} |
| [Trend 2] | 🔥🔥 | Medium | ${platform} |
...

${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}
`,

    hooks: `
Generate 10 scroll-stopping hooks for "${topic}".

First, call web_search_exa to understand:
- What's getting engagement on this topic
- Common pain points and curiosities
- Trending phrases and formats

${platformGuide}

## 🎣 Hook Collection: ${topic}

### Curiosity Hooks
1. "[Hook that creates a curiosity gap]"
2. "[Hook that makes viewers NEED to know more]"

### Controversial Hooks
3. "[Bold statement or hot take]"
4. "[Challenge common belief]"

### Story Hooks
5. "[Personal story opener]"
6. "[Transformation story starter]"

### Educational Hooks
7. "[Surprising fact or statistic]"
8. "[Common mistake reveal]"

### Trend Hooks
9. "[Reference to current trend/event]"
10. "[Platform-native hook format]"

---

**🏆 Best Overall Hook:** [Pick the strongest one]
**Why it works:** [Explain the psychology]

${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}
`,

    full: `
Create a comprehensive content package for "${topic}".

First, thoroughly research using web_search_exa:
- Latest news and trends
- Viral content examples
- Audience interests and pain points
- Competitor content analysis

${platformGuide}

## 📦 Complete Content Package: ${topic}

### 🔍 Research Summary
[Key insights from web search]

### 💡 Top 3 Content Ideas
[Brief overview of best angles]

### 📝 Featured Script
[Complete script for the best idea]

### 🎣 Hook Variations
[5 alternative hooks to test]

### 🎬 Recording Checklist
- [ ] [Equipment needed]
- [ ] [Location/setup]
- [ ] [Props or visuals]
- [ ] [Wardrobe considerations]

### 📊 Posting Strategy
**Best time to post:** [Based on platform]
**Caption:** [Ready-to-use caption]
**Hashtags:** [Optimized hashtag set]
**Cross-posting:** [Platform adaptation tips]

${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}
`,
  };

  return prompts[contentType];
}

/**
 * Get refinement prompt for follow-up requests
 */
export function getRefinementPrompt(
  originalContent: string,
  refinementRequest: string
): string {
  return `
Based on this previously generated content:

${originalContent}

The user wants to refine it with this feedback:
"${refinementRequest}"

Please update the content accordingly while maintaining the same format and quality.
`;
}

/**
 * Get prompt for generating more variations
 */
export function getMoreVariationsPrompt(
  contentType: ContentType,
  existingContent: string,
  topic: string
): string {
  return `
You previously generated this ${contentType} content for "${topic}":

${existingContent}

Generate 3 MORE unique variations that are different from the above but equally engaging.
Use web_search_exa to find additional angles or fresh information.
Maintain the same format and quality standards.
`;
}
