#!/usr/bin/env node

/**
 * Content Curator CLI
 * AI-Powered Real-Time Content Curator using GitHub Copilot + Exa AI
 *
 * Chat-style interface with slash commands for generating short-form video content ideas.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { Command } from "commander";
import { CopilotService, type ModelId } from "./services/copilot.js";
import type { ContentType, Platform } from "./types.js";
import {
    clearScreen,
    printContent,
    printError,
    printExaStatus,
    printGoodbye,
    printHeader,
    printHelp,
    printInlineStatus,
    printStatusBar,
    printSuccess,
    printTopicPanel,
    printWarning
} from "./ui/display.js";
import {
    AVAILABLE_MODELS,
    parseCommand,
    promptCommand,
    promptModel,
    promptPlatform,
    promptTopic,
} from "./ui/prompts.js";
import { copyToClipboard } from "./utils/clipboard.js";

const program = new Command();

// ════════════════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════════════════

interface AppState {
  topic: string;
  platform: Platform;
  model: ModelId;
  service: CopilotService | null;
  lastContent: string;
  lastContentType: ContentType | null;
}

const state: AppState = {
  topic: "",
  platform: "all",
  model: "gpt-4o",
  service: null,
  lastContent: "",
  lastContentType: null,
};

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

function isPremium(model: string): boolean {
  const info = AVAILABLE_MODELS.find((m) => m.name === model);
  return info?.premium ?? false;
}

function getQuota() {
  const q = state.service?.getQuotaInfo();
  if (!q) return undefined;
  return {
    used: q.usedRequests,
    total: q.totalRequests,
    isUnlimited: q.isUnlimited,
  };
}

function refreshScreen(): void {
  clearScreen();
  printHeader();
  printTopicPanel(state.topic, state.platform);

  const modelInfo = state.service?.getModelInfo();
  printStatusBar(
    modelInfo?.name || state.model,
    modelInfo?.premium || isPremium(state.model),
    state.platform,
    getQuota()
  );
}

function showPromptStatus(): void {
  const modelInfo = state.service?.getModelInfo();
  printInlineStatus(
    modelInfo?.name || state.model,
    modelInfo?.premium || isPremium(state.model),
    state.topic,
    state.platform
  );
}

function displayLastContent(): void {
  if (state.lastContent && state.lastContentType) {
    printContent(state.lastContent, state.lastContentType);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONTENT GENERATION
// ════════════════════════════════════════════════════════════════════════════

async function handleContent(contentType: ContentType): Promise<void> {
  if (!state.service) {
    printError("Service not initialized");
    return;
  }

  console.log();
  const result = await state.service.generate(contentType, { regenerate: true });

  if (result.success && result.content) {
    state.lastContent = result.content;
    state.lastContentType = contentType;
    printContent(result.content, contentType);
  } else {
    printError(result.error || "Failed to generate content");
  }
}

async function handleChat(message: string): Promise<void> {
  if (!message.trim()) return;

  if (!state.service) {
    printError("Service not initialized");
    return;
  }

  // If we have last content, refine it
  if (state.lastContentType && state.lastContent) {
    console.log();
    const result = await state.service.refine(state.lastContentType, message);

    if (result.success && result.content) {
      state.lastContent = result.content;
      printContent(result.content, state.lastContentType);
    } else {
      printError(result.error || "Failed to refine content");
    }
  } else {
    // No previous content - treat as a topic update and search
    state.topic = message;
    state.service.setTopic(message);
    await handleContent("search");
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN FLOW
// ════════════════════════════════════════════════════════════════════════════

async function run(initialTopic?: string): Promise<void> {
  // Show header
  clearScreen();
  printHeader();

  // Check for Exa API key
  const hasExaKey = !!process.env.EXA_API_KEY;
  printExaStatus(hasExaKey);

  if (!hasExaKey) {
    printWarning("Set EXA_API_KEY in .env file for web search capabilities");
    console.log();
  }

  // Get topic
  console.log();
  state.topic = initialTopic || (await promptTopic());

  // Select platform
  console.log();
  state.platform = await promptPlatform();

  // Use gpt-4o (more stable)
  state.model = "gpt-4o";

  // Initialize Copilot
  state.service = new CopilotService(state.topic, state.platform, state.model);

  try {
    await state.service.initialize();
  } catch (error) {
    printError(error instanceof Error ? error.message : "Failed to connect");
    process.exit(1);
  }

  // Immediately generate script
  console.log();
  printSuccess(`🎬 Generating ${state.platform === "all" ? "multi-platform" : state.platform.toUpperCase()} reel for: "${state.topic}"`);
  console.log();

  const result = await state.service.generate("script", { regenerate: true });

  if (result.success && result.content) {
    state.lastContent = result.content;
    state.lastContentType = "script";
    printContent(result.content, "script");

    console.log();
    printSuccess("✨ Done! You can refine or generate more content.");
  } else {
    printError(result.error || "Failed to generate content");
  }

  // Show initial screen with help
  refreshScreen();
  printHelp();

  // Chat loop
  while (true) {
    showPromptStatus();
    const input = await promptCommand();
    const command = parseCommand(input);

    switch (command.type) {
      case "quit":
        printGoodbye();
        await state.service?.cleanup();
        process.exit(0);
        break;

      case "help":
        console.log();
        printHelp();
        break;

      case "clear":
        refreshScreen();
        break;

      case "last":
        if (state.lastContent && state.lastContentType) {
          console.log();
          displayLastContent();
        } else {
          printError("No content generated yet.");
        }
        break;

      case "platform":
        const newPlatform = await promptPlatform(state.platform);
        if (newPlatform !== state.platform) {
          state.platform = newPlatform;
          state.service.setPlatform(newPlatform);
          printSuccess(`Switched to ${newPlatform}`);
        }
        break;

      case "topic":
        const newTopic = await promptTopic(state.topic);
        if (newTopic !== state.topic) {
          state.topic = newTopic;
          state.service.setTopic(newTopic);
          printSuccess(`Topic changed to: ${newTopic}`);
        }
        break;

      case "model":
        const newModel = (await promptModel(state.model)) as ModelId;
        if (newModel !== state.model) {
          await state.service.switchModel(newModel);
          state.model = newModel;
          printSuccess(`Switched to ${newModel}`);
        }
        break;

      case "copy":
        if (state.lastContent) {
          const copied = await copyToClipboard(state.lastContent);
          if (copied) {
            printSuccess("Copied to clipboard!");
          } else {
            printError("Failed to copy to clipboard");
          }
        } else {
          printError("Nothing to copy yet. Generate some content first.");
        }
        break;

      case "content":
        await handleContent(command.contentType);
        break;

      case "chat":
        await handleChat(command.message);
        break;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CLI SETUP
// ════════════════════════════════════════════════════════════════════════════

program
  .name("content-curator")
  .description("AI-powered real-time content curator for short-form video ideas")
  .version("1.0.0")
  .argument("[topic]", "Initial topic to research")
  .action(async (topic?: string) => {
    try {
      await run(topic);
    } catch (error) {
      if (error instanceof Error && error.message.includes("force closed")) {
        // User pressed Ctrl+C
        printGoodbye();
        process.exit(0);
      }
      throw error;
    }
  });

program.parse();
