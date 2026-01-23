/**
 * Copilot client service - manages the AI session lifecycle
 * Uses Exa AI directly for web search (not MCP)
 */

import { CopilotClient, type SessionEvent } from "@github/copilot-sdk";
import { execSync } from "child_process";
import { existsSync } from "fs";
import ora, { type Ora } from "ora";
import { join } from "path";
import {
    SYSTEM_PROMPT_BASE,
    getContentPrompt,
    getMoreVariationsPrompt,
    getRefinementPrompt,
} from "../prompts/templates.js";
import type {
    ContentType,
    GenerationResult,
    Platform,
    QuotaInfo,
    SessionContext,
} from "../types.js";
import { c } from "../ui/themes.js";
import { ExaService, getExaService } from "./exa.js";

/**
 * Resolve the full path to the copilot CLI on Windows.
 */
function resolveWindowsCopilotPath(): string | undefined {
  const possiblePaths: string[] = [];

  if (process.env.APPDATA) {
    possiblePaths.push(join(process.env.APPDATA, "npm", "copilot.cmd"));
    possiblePaths.push(join(process.env.APPDATA, "npm", "copilot"));
  }

  if (process.env.NVM_SYMLINK) {
    possiblePaths.push(join(process.env.NVM_SYMLINK, "copilot.cmd"));
    possiblePaths.push(join(process.env.NVM_SYMLINK, "copilot"));
  }

  const programFiles = process.env.ProgramFiles || "C:\\Program Files";
  const programFilesX86 =
    process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
  possiblePaths.push(join(programFiles, "GitHub", "copilot.exe"));
  possiblePaths.push(join(programFilesX86, "GitHub", "copilot.exe"));

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p;
    }
  }

  try {
    const result = execSync("where copilot", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const lines = result.split(/\r?\n/).filter((line) => line.trim());
    for (const line of lines) {
      const path = line.trim();
      if (path && existsSync(path)) {
        return path;
      }
    }
  } catch {
    // 'where' failed
  }

  return undefined;
}

/**
 * Resolve the full path to the copilot CLI on Linux/macOS.
 */
function resolvePosixCopilotPath(): string | undefined {
  const possiblePaths = [
    "/usr/local/bin/copilot",
    "/usr/bin/copilot",
    join(process.env.HOME || "", ".local/bin/copilot"),
    join(process.env.HOME || "", ".npm/bin/copilot"),
  ];

  try {
    const npmPrefix = execSync("npm config get prefix", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (npmPrefix) {
      possiblePaths.unshift(join(npmPrefix, "bin", "copilot"));
    }
  } catch {
    // npm not found
  }

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p;
    }
  }

  try {
    const result = execSync("command -v copilot", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      shell: "/bin/sh",
    });
    const path = result.trim();
    if (path && existsSync(path)) {
      return path;
    }
  } catch {
    // command -v failed
  }

  return undefined;
}

/**
 * Resolve copilot CLI path for the current platform
 */
function resolveCopilotPath(): string | undefined {
  return process.platform === "win32"
    ? resolveWindowsCopilotPath()
    : resolvePosixCopilotPath();
}

/** Available models in GitHub Copilot */
export const AVAILABLE_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", premium: false },
  { id: "gpt-4.1", name: "GPT-4.1", premium: false },
  { id: "gpt-5", name: "GPT-5 (Preview)", premium: true },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", premium: true },
  { id: "o3", name: "o3 (Reasoning)", premium: true },
  { id: "o4-mini", name: "o4-mini (Fast)", premium: true },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];

/**
 * CopilotService manages the AI client with Exa direct API integration
 */
export class CopilotService {
  private client: CopilotClient | null = null;
  private session: Awaited<ReturnType<CopilotClient["createSession"]>> | null =
    null;
  private spinner: Ora;
  private context: SessionContext;
  private currentModel: ModelId;
  private quotaInfo: QuotaInfo | null = null;
  private exaService: ExaService;

  constructor(topic: string, platform: Platform, model: ModelId = "gpt-4o") {
    this.spinner = ora();
    this.currentModel = model;
    this.exaService = getExaService();
    this.context = {
      topic,
      platform,
      generatedContent: new Map(),
    };
  }

  /**
   * Check if Exa API key is configured
   */
  hasExaKey(): boolean {
    return this.exaService.isConfigured();
  }

  /**
   * Get the current model being used
   */
  getModel(): ModelId {
    return this.currentModel;
  }

  /**
   * Get the current platform
   */
  getPlatform(): Platform {
    return this.context.platform;
  }

  /**
   * Set the current platform
   */
  setPlatform(platform: Platform): void {
    this.context.platform = platform;
  }

  /**
   * Get the current topic
   */
  getTopic(): string {
    return this.context.topic;
  }

  /**
   * Set the current topic
   */
  setTopic(topic: string): void {
    this.context.topic = topic;
    // Clear cached content when topic changes
    this.context.generatedContent.clear();
    this.context.searchResults = undefined;
  }

  /**
   * Get the last known quota info
   */
  getQuotaInfo(): QuotaInfo | null {
    return this.quotaInfo;
  }

  /**
   * Get the model info for the current model
   */
  getModelInfo(): (typeof AVAILABLE_MODELS)[number] | undefined {
    return AVAILABLE_MODELS.find((m) => m.id === this.currentModel);
  }

  /**
   * Switch to a different model
   */
  async switchModel(newModel: ModelId): Promise<void> {
    if (newModel === this.currentModel) {
      return;
    }

    this.spinner.start(
      `Switching to ${AVAILABLE_MODELS.find((m) => m.id === newModel)?.name || newModel}...`
    );

    try {
      if (this.session) {
        try {
          await this.session.destroy();
        } catch {
          // Ignore destroy errors
        }
      }

      this.currentModel = newModel;
      await this.createSession();

      const modelInfo = AVAILABLE_MODELS.find(
        (m) => m.id === this.currentModel
      );
      const modelDisplay = modelInfo ? modelInfo.name : this.currentModel;
      this.spinner.succeed(c.success(`Switched to ${modelDisplay}`));
    } catch (error) {
      this.spinner.fail(c.error("Failed to switch model"));
      throw error;
    }
  }

  /**
   * Create a new session (no MCP, just basic session)
   */
  private async createSession(): Promise<void> {
    this.session = await this.client!.createSession({
      model: this.currentModel,
      streaming: true,
      systemMessage: {
        mode: "append",
        content: SYSTEM_PROMPT_BASE,
      },
    });
  }

  /**
   * Initialize the Copilot client and create a session
   */
  async initialize(): Promise<void> {
    this.spinner.start("Connecting to GitHub Copilot...");

    try {
      const clientOptions: { cliPath?: string } = {};
      const copilotPath = resolveCopilotPath();
      if (copilotPath) {
        clientOptions.cliPath = copilotPath;
      }

      this.client = new CopilotClient(clientOptions);
      await this.client.start();
      this.spinner.text = "Creating AI session...";

      await this.createSession();

      const modelInfo = AVAILABLE_MODELS.find(
        (m) => m.id === this.currentModel
      );
      const modelDisplay = modelInfo ? modelInfo.name : this.currentModel;
      const exaStatus = this.exaService.isConfigured() ? " + Exa AI" : "";
      this.spinner.succeed(
        c.success(`Connected to GitHub Copilot (${modelDisplay}${exaStatus})`)
      );
    } catch (error) {
      this.spinner.fail(c.error("Failed to connect"));
      throw error;
    }
  }

  /**
   * Perform Exa search and store results
   */
  private async performSearch(
    type: "general" | "trending" | "ideas"
  ): Promise<string> {
    if (!this.exaService.isConfigured()) {
      return "Note: Using general knowledge. For better results, set EXA_API_KEY in .env file.";
    }

    this.spinner.text = "🔍 Searching the web...";

    try {
      let searchResult;

      switch (type) {
        case "trending":
          searchResult = await this.exaService.searchTrending(
            this.context.topic
          );
          break;
        case "ideas":
          searchResult = await this.exaService.searchContentIdeas(
            this.context.topic
          );
          break;
        default:
          searchResult = await this.exaService.searchAndContents(
            this.context.topic,
            { numResults: 5 }  // Reduced from 10 to 5
          );
      }

      this.context.searchResults = searchResult.results;

      // Simplified formatting
      return this.exaService.formatResultsForLLM(searchResult.results);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      console.log(`\n⚠️  Search warning: ${message}`);
      return `Using general knowledge about "${this.context.topic}".`;
    }
  }

  /**
   * Generate specific content type
   */
  async generate(
    contentType: ContentType,
    options: { regenerate?: boolean; additionalContext?: string } = {}
  ): Promise<GenerationResult> {
    const { regenerate = false, additionalContext } = options;

    if (regenerate) {
      this.context.generatedContent.delete(contentType);
    }

    const cached = this.context.generatedContent.get(contentType);
    if (cached && !regenerate) {
      return { content: cached, success: true };
    }

    // Perform appropriate search based on content type
    let searchType: "general" | "trending" | "ideas" = "general";
    if (contentType === "trending") {
      searchType = "trending";
    } else if (contentType === "ideas") {
      searchType = "ideas";
    }

    const searchResults = await this.performSearch(searchType);

    // Build the prompt with search results
    const basePrompt = getContentPrompt(contentType, {
      topic: this.context.topic,
      platform: this.context.platform,
      additionalContext,
    });

    // Simplified prompt structure
    const promptWithSearch = `${searchResults}

---

${basePrompt}`;

    return await this.sendPrompt(promptWithSearch, contentType);
  }

  /**
   * Refine the last generated content
   */
  async refine(
    contentType: ContentType,
    refinementRequest: string
  ): Promise<GenerationResult> {
    const lastContent = this.context.generatedContent.get(contentType);
    if (!lastContent) {
      return {
        content: "",
        success: false,
        error: "No content to refine. Generate content first.",
      };
    }

    const prompt = getRefinementPrompt(lastContent, refinementRequest);
    return await this.sendPrompt(prompt, contentType);
  }

  /**
   * Get more variations of content
   */
  async getMoreVariations(contentType: ContentType): Promise<GenerationResult> {
    const existingContent = this.context.generatedContent.get(contentType);
    if (!existingContent) {
      return {
        content: "",
        success: false,
        error: "No existing content. Generate content first.",
      };
    }

    const prompt = getMoreVariationsPrompt(
      contentType,
      existingContent,
      this.context.topic
    );
    return await this.sendPrompt(prompt, contentType);
  }

  /**
   * Send a prompt and collect the response
   */
  private async sendPrompt(
    prompt: string,
    contentType?: ContentType
  ): Promise<GenerationResult> {
    if (!this.session) {
      return {
        content: "",
        success: false,
        error: "Session not initialized",
      };
    }

    this.spinner.start("Generating content...");

    try {
      let content = "";
      let eventCount = 0;

      // Set up event listener
      const unsubscribe = this.session.on((event) => {
        eventCount++;
        this.handleEvent(event as unknown as SessionEvent, (text) => {
          content += text;
        });
      });

      // Send the message and wait for completion
      await this.session.sendAndWait({ prompt });

      // Unsubscribe from events
      unsubscribe();

      // Clean up the content
      content = this.cleanContent(content);

      // Cache if content type specified
      if (contentType && content) {
        this.context.generatedContent.set(contentType, content);
      }

      this.spinner.succeed(c.success("Content generated"));

      return { content, success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Generation failed";
      this.spinner.fail(c.error(errorMessage));
      return { content: "", success: false, error: errorMessage };
    }
  }

  /**
   * Handle streaming events
   */
  private handleEvent(
    event: SessionEvent,
    onText: (text: string) => void
  ): void {
    // Type-safe access to event data
    const eventAny = event as any;

    switch (event.type) {
      case "assistant.message_delta":
        const deltaContent = eventAny.data?.deltaContent;
        if (deltaContent && typeof deltaContent === "string") {
          onText(deltaContent);
        }
        break;

      case "assistant.usage":
        // Handle quota/usage info if available
        if (eventAny.data) {
          // Usage info structure may vary
        }
        break;
    }
  }

  /**
   * Clean up generated content
   */
  private cleanContent(content: string): string {
    return content
      .replace(/^[\s\S]*?(?=##|#\s)/m, "") // Remove preamble before first header
      .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
      .trim();
  }

  /**
   * Get the last generated content
   */
  getLastContent(contentType: ContentType): string | undefined {
    return this.context.generatedContent.get(contentType);
  }

  /**
   * Get all generated content
   */
  getAllContent(): Map<ContentType, string> {
    return this.context.generatedContent;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.session) {
        await this.session.destroy();
      }
      if (this.client) {
        await this.client.stop();
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}
