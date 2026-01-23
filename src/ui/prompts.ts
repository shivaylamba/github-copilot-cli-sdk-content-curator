/**
 * Interactive prompts for Content Curator TUI
 * Chat-style interface with slash commands
 */

import { input, select } from "@inquirer/prompts";
import type { ContentType, Platform } from "../types.js";
import { c, ICON } from "./themes.js";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export type Command =
  | { type: "content"; contentType: ContentType }
  | { type: "platform" }
  | { type: "topic" }
  | { type: "model" }
  | { type: "copy" }
  | { type: "last" }
  | { type: "clear" }
  | { type: "help" }
  | { type: "quit" }
  | { type: "chat"; message: string };

// ════════════════════════════════════════════════════════════════════════════
// MODELS
// ════════════════════════════════════════════════════════════════════════════

export const AVAILABLE_MODELS = [
  { name: "gpt-4.1", premium: false },
  { name: "gpt-4o", premium: false },
  { name: "gpt-5", premium: true },
  { name: "claude-sonnet-4", premium: true },
  { name: "o3", premium: true },
  { name: "o4-mini", premium: true },
] as const;

export type ModelName = (typeof AVAILABLE_MODELS)[number]["name"];

// ════════════════════════════════════════════════════════════════════════════
// PLATFORMS
// ════════════════════════════════════════════════════════════════════════════

export const AVAILABLE_PLATFORMS: { name: string; value: Platform; icon: string }[] = [
  { name: "Instagram Reels", value: "instagram", icon: "📸" },
  { name: "YouTube Shorts", value: "youtube", icon: "▶️" },
  { name: "TikTok", value: "tiktok", icon: "🎵" },
  { name: "All Platforms", value: "all", icon: "📱" },
];

// ════════════════════════════════════════════════════════════════════════════
// COMMAND PARSING
// ════════════════════════════════════════════════════════════════════════════

const COMMAND_MAP: Record<string, Command> = {
  "/search": { type: "content", contentType: "search" },
  "/research": { type: "content", contentType: "search" },
  "/ideas": { type: "content", contentType: "ideas" },
  "/idea": { type: "content", contentType: "ideas" },
  "/script": { type: "content", contentType: "script" },
  "/scripts": { type: "content", contentType: "script" },
  "/trending": { type: "content", contentType: "trending" },
  "/trends": { type: "content", contentType: "trending" },
  "/hooks": { type: "content", contentType: "hooks" },
  "/hook": { type: "content", contentType: "hooks" },
  "/full": { type: "content", contentType: "full" },
  "/all": { type: "content", contentType: "full" },
  "/package": { type: "content", contentType: "full" },
  "/platform": { type: "platform" },
  "/p": { type: "platform" },
  "/topic": { type: "topic" },
  "/t": { type: "topic" },
  "/model": { type: "model" },
  "/m": { type: "model" },
  "/copy": { type: "copy" },
  "/c": { type: "copy" },
  "/last": { type: "last" },
  "/back": { type: "last" },
  "/clear": { type: "clear" },
  "/cls": { type: "clear" },
  "/help": { type: "help" },
  "/h": { type: "help" },
  "/?": { type: "help" },
  "/quit": { type: "quit" },
  "/exit": { type: "quit" },
  "/q": { type: "quit" },
};

export function parseCommand(inputText: string): Command {
  const trimmed = inputText.trim();
  const lowered = trimmed.toLowerCase();

  // Check for slash commands
  if (COMMAND_MAP[lowered]) {
    return COMMAND_MAP[lowered];
  }

  // Empty input - do nothing
  if (!trimmed) {
    return { type: "chat", message: "" };
  }

  // Unknown slash command - treat as chat
  if (trimmed.startsWith("/")) {
    return { type: "chat", message: trimmed };
  }

  // Non-slash input is a chat message for refinement
  return { type: "chat", message: trimmed };
}

// ════════════════════════════════════════════════════════════════════════════
// PROMPTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Prompt for topic input
 */
export async function promptTopic(currentTopic?: string): Promise<string> {
  return await input({
    message: c.brand("Enter topic to research"),
    default: currentTopic,
    validate: (value) => {
      if (!value.trim()) return "Topic is required";
      return true;
    },
    theme: {
      prefix: "  " + c.brand(ICON.search),
    },
  });
}

/**
 * Prompt for platform selection
 */
export async function promptPlatform(currentPlatform?: Platform): Promise<Platform> {
  const choices = AVAILABLE_PLATFORMS.map((p) => {
    const isCurrent = p.value === currentPlatform;
    const currentBadge = isCurrent ? c.success(" (current)") : "";

    return {
      name: `${p.icon} ${p.name}${currentBadge}`,
      value: p.value,
    };
  });

  return await select({
    message: c.brand("Select target platform"),
    choices,
    loop: true,
    theme: {
      prefix: "  " + c.brand(ICON.platform),
    },
  });
}

/**
 * Prompt for model selection
 */
export async function promptModel(currentModel?: string): Promise<ModelName> {
  const choices = AVAILABLE_MODELS.map((m) => {
    const isCurrent = m.name === currentModel;
    const premiumBadge = m.premium ? c.premium(" ⚡") : "";
    const currentBadge = isCurrent ? c.success(" (current)") : "";

    return {
      name: `${m.name}${premiumBadge}${currentBadge}`,
      value: m.name,
    };
  });

  return await select({
    message: c.brand("Select AI Model"),
    choices,
    loop: true,
    theme: {
      prefix: "  " + c.brand(ICON.model),
    },
  });
}

/**
 * Main chat prompt - accepts slash commands
 */
export async function promptCommand(): Promise<string> {
  return await input({
    message: "",
    theme: {
      prefix: c.brand("  ❯"),
    },
  });
}

/**
 * Confirm prompt
 */
export async function promptConfirm(message: string): Promise<boolean> {
  const result = await select({
    message: c.text(message),
    choices: [
      { name: "Yes", value: true },
      { name: "No", value: false },
    ],
    theme: {
      prefix: "  " + c.brand("?"),
    },
  });
  return result;
}
