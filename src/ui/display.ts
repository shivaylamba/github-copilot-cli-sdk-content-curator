/**
 * Display module for Content Curator TUI
 * Renders the beautiful terminal interface
 */

import ora, { type Ora } from "ora";
import type { Platform } from "../types.js";
import {
    BOX,
    box,
    c,
    ICON,
    modelBadge,
    platformBadge,
    progressBar,
    renderLogo,
    stripAnsi
} from "./themes.js";

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const WIDTH = 84;
let currentSpinner: Ora | null = null;

// ════════════════════════════════════════════════════════════════════════════
// SCREEN MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Clear screen and reset cursor
 */
export function clearScreen(): void {
  console.clear();
}

/**
 * Print the gorgeous header with ASCII art and tagline
 */
export function printHeader(): void {
  console.log();

  // Render gradient logo
  const logo = renderLogo();
  for (const logoLine of logo) {
    console.log("  " + logoLine);
  }

  // Tagline
  console.log();
  console.log(c.dim("  " + "─".repeat(WIDTH - 4)));
  console.log(
    c.dim("  ") +
      c.text("AI-Powered Real-Time Content Curator") +
      c.dim(" │ ") +
      c.brand("Powered by Exa AI")
  );
  console.log(c.dim("  " + "─".repeat(WIDTH - 4)));
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// PANELS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print topic panel
 */
export function printTopicPanel(topic: string, platform: Platform): void {
  const content = [
    c.dim("Topic: ") + c.whiteBold(topic),
    c.dim("Platform: ") + platformBadge(platform),
  ];

  const panel = box(content, {
    width: WIDTH,
    title: `${ICON.target} Current Session`,
    padding: 1,
  });

  for (const panelLine of panel) {
    console.log("  " + panelLine);
  }
  console.log();
}

/**
 * Print simple topic display
 */
export function printTopic(topic: string): void {
  const content = [c.dim("Topic: ") + c.text(topic)];

  const panel = box(content, {
    width: WIDTH,
    title: `${ICON.search} Research Topic`,
    padding: 1,
  });

  for (const panelLine of panel) {
    console.log("  " + panelLine);
  }
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// STATUS BAR
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print the persistent status bar (full width)
 */
export function printStatusBar(
  model: string,
  isPremium: boolean,
  platform: Platform,
  quota?: { used: number; total: number; isUnlimited: boolean }
): void {
  const innerWidth = WIDTH - 4;

  // Build status line components
  const badge = modelBadge(model, isPremium);
  const platformDisplay = platformBadge(platform);

  let quotaDisplay = "";
  if (quota && !quota.isUnlimited) {
    const remaining = quota.total - quota.used;
    const percent = (remaining / quota.total) * 100;
    const bar = progressBar(percent, 12);
    quotaDisplay =
      c.dim(" │ ") + bar + " " + c.text(String(remaining)) + c.muted("/" + quota.total);
  } else if (quota?.isUnlimited) {
    quotaDisplay = c.dim(" │ ") + c.success("∞ Unlimited");
  }

  const hint = c.dim(" │ ") + c.muted("/help for commands");

  // Build the line
  console.log("  " + c.border(BOX.tl + BOX.h.repeat(innerWidth) + BOX.tr));

  const statusContent = "  " + badge + c.dim(" │ ") + platformDisplay + quotaDisplay + hint;
  const contentLen = stripAnsi(statusContent).length;
  const padding = innerWidth - contentLen + 2;

  console.log(
    "  " + c.border(BOX.v) + statusContent + " ".repeat(Math.max(0, padding)) + c.border(BOX.v)
  );
  console.log("  " + c.border(BOX.bl + BOX.h.repeat(innerWidth) + BOX.br));
  console.log();
}

/**
 * Print compact inline status (shows before each prompt)
 */
export function printInlineStatus(
  model: string,
  isPremium: boolean,
  topic: string,
  platform: Platform
): void {
  const badge = modelBadge(model, isPremium);
  const topicInfo = c.dim("topic:") + c.muted(topic.substring(0, 30) + (topic.length > 30 ? "..." : ""));
  const platformDisplay = platformBadge(platform);
  const hint = c.muted("/help");

  console.log();
  console.log("  " + c.border("─".repeat(WIDTH - 4)));
  console.log("  " + badge + c.dim(" │ ") + platformDisplay + c.dim(" │ ") + topicInfo + c.dim(" │ ") + hint);
}

// ════════════════════════════════════════════════════════════════════════════
// HELP DISPLAY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print available commands
 */
export function printHelp(): void {
  console.log();
  console.log("  " + c.whiteBold(ICON.sparkle + " Commands"));
  console.log("  " + c.border("─".repeat(WIDTH - 4)));
  console.log();

  const commands = [
    { cmd: "/search", desc: "Research topic with web search" },
    { cmd: "/ideas", desc: "Generate content ideas" },
    { cmd: "/script", desc: "Create a full video script" },
    { cmd: "/trending", desc: "Find trending angles" },
    { cmd: "/hooks", desc: "Generate hook variations" },
    { cmd: "/full", desc: "Complete content package" },
  ];

  const utilCommands = [
    { cmd: "/platform", desc: "Switch target platform" },
    { cmd: "/topic", desc: "Change research topic" },
    { cmd: "/copy", desc: "Copy last content" },
    { cmd: "/last", desc: "Show last content" },
    { cmd: "/model", desc: "Switch AI model" },
    { cmd: "/clear", desc: "Clear screen" },
    { cmd: "/help", desc: "Show this help" },
    { cmd: "/quit", desc: "Exit" },
  ];

  // Content commands
  console.log("  " + c.dim("Content Generation"));
  for (const { cmd, desc } of commands) {
    console.log("  " + c.brand(cmd.padEnd(14)) + c.text(desc));
  }

  console.log();
  console.log("  " + c.dim("Utilities"));
  for (const { cmd, desc } of utilCommands) {
    console.log("  " + c.muted(cmd.padEnd(14)) + c.dim(desc));
  }

  console.log();
  console.log("  " + c.dim("─".repeat(WIDTH - 4)));
  console.log("  " + c.muted("💡 Tip: Type any message to refine the last generated content"));
  console.log();
}

// ════════════════════════════════════════════════════════════════════════════
// CONTENT DISPLAY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Content type icons and labels
 */
export const CONTENT_ICONS: Record<string, string> = {
  search: ICON.search,
  ideas: ICON.idea,
  script: ICON.script,
  trending: ICON.trending,
  hooks: ICON.hook,
  full: ICON.sparkle,
};

export const CONTENT_LABELS: Record<string, string> = {
  search: "Research Results",
  ideas: "Content Ideas",
  script: "Video Script",
  trending: "Trending Report",
  hooks: "Hook Collection",
  full: "Content Package",
};

/**
 * Print content with proper formatting
 */
export function printContent(content: string, contentType?: string): void {
  console.log();

  if (contentType) {
    const icon = CONTENT_ICONS[contentType] || ICON.sparkle;
    const label = CONTENT_LABELS[contentType] || "Generated Content";
    console.log("  " + c.whiteBold(icon + " " + label));
    console.log("  " + c.border("─".repeat(WIDTH - 4)));
  }

  // Process and print content
  const lines = content.split("\n");
  for (const contentLine of lines) {
    const formattedLine = formatMarkdownLine(contentLine);
    console.log("  " + formattedLine);
  }

  console.log();
}

/**
 * Format a single markdown line for terminal display
 */
function formatMarkdownLine(lineText: string): string {
  // Headers
  if (lineText.startsWith("### ")) {
    return c.infoBold(lineText.substring(4));
  }
  if (lineText.startsWith("## ")) {
    return c.brandBold(lineText.substring(3));
  }
  if (lineText.startsWith("# ")) {
    return c.whiteBold(lineText.substring(2));
  }

  // Bold text
  lineText = lineText.replace(/\*\*(.*?)\*\*/g, (_, text) => c.whiteBold(text));

  // Italic text
  lineText = lineText.replace(/\*(.*?)\*/g, (_, text) => c.dim(text));

  // Inline code
  lineText = lineText.replace(/`(.*?)`/g, (_, text) => c.info(text));

  // List items
  if (lineText.match(/^\s*[-*]\s/)) {
    lineText = lineText.replace(/^(\s*)[-*]\s/, "$1" + c.brand("•") + " ");
  }

  // Numbered items
  if (lineText.match(/^\s*\d+\.\s/)) {
    lineText = lineText.replace(/^(\s*)(\d+)\.\s/, (_, space, num) => space + c.number(num + ".") + " ");
  }

  // Horizontal rules
  if (lineText.match(/^---+$/)) {
    return c.border("─".repeat(WIDTH - 6));
  }

  // Table formatting
  if (lineText.includes("|")) {
    return lineText
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean)
      .map((cell) => c.text(cell.padEnd(20)))
      .join(c.border(" │ "));
  }

  return c.text(lineText);
}

// ════════════════════════════════════════════════════════════════════════════
// SPINNERS & STATUS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create and return a spinner
 */
export function createSpinner(text: string): Ora {
  if (currentSpinner) {
    currentSpinner.stop();
  }
  currentSpinner = ora({
    text: c.dim(text),
    spinner: "dots",
    prefixText: "  ",
  }).start();
  return currentSpinner;
}

/**
 * Stop the current spinner with success
 */
export function spinnerSuccess(text: string): void {
  if (currentSpinner) {
    currentSpinner.succeed(c.success(text));
    currentSpinner = null;
  }
}

/**
 * Stop the current spinner with failure
 */
export function spinnerFail(text: string): void {
  if (currentSpinner) {
    currentSpinner.fail(c.error(text));
    currentSpinner = null;
  }
}

/**
 * Update spinner text
 */
export function spinnerUpdate(text: string): void {
  if (currentSpinner) {
    currentSpinner.text = c.dim(text);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Print success message
 */
export function printSuccess(message: string): void {
  console.log("  " + c.success(ICON.check + " " + message));
}

/**
 * Print error message
 */
export function printError(message: string): void {
  console.log("  " + c.error(ICON.cross + " " + message));
}

/**
 * Print warning message
 */
export function printWarning(message: string): void {
  console.log("  " + c.warning("⚠ " + message));
}

/**
 * Print info message
 */
export function printInfo(message: string): void {
  console.log("  " + c.info("ℹ " + message));
}

/**
 * Print goodbye message
 */
export function printGoodbye(): void {
  console.log();
  console.log("  " + c.brand("👋 Thanks for using Content Curator!"));
  console.log("  " + c.muted("Go create something viral ✨"));
  console.log();
}

/**
 * Print authentication status
 */
export function printAuth(status: "checking" | "success" | "error", message?: string): void {
  switch (status) {
    case "checking":
      console.log("  " + c.dim("🔐 Checking authentication..."));
      break;
    case "success":
      console.log("  " + c.success("🔐 Authenticated with GitHub Copilot"));
      break;
    case "error":
      console.log("  " + c.error("🔐 " + (message || "Authentication failed")));
      break;
  }
}

/**
 * Print Exa API status
 */
export function printExaStatus(hasKey: boolean): void {
  if (hasKey) {
    console.log("  " + c.success("🔍 Exa AI connected"));
  } else {
    console.log("  " + c.warning("🔍 EXA_API_KEY not set - web search disabled"));
  }
}
