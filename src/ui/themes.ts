/**
 * Theme system for Content Curator TUI
 * Beautiful terminal styling with gradients and box drawing
 */

import chalk from "chalk";

// ════════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ════════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // Brand gradient (purple to blue - content/creative theme)
  brand1: "#8b5cf6",
  brand2: "#6366f1",
  brand3: "#3b82f6",

  // UI colors
  bg: "#0d1117",
  bgLight: "#161b22",
  bgPanel: "#21262d",

  // Text hierarchy
  text: "#e6edf3",
  textDim: "#8b949e",
  textMuted: "#484f58",

  // Semantic
  success: "#3fb950",
  warning: "#d29922",
  error: "#f85149",
  info: "#58a6ff",
  premium: "#a371f7",

  // Platform colors
  instagram: "#E1306C",
  youtube: "#FF0000",
  tiktok: "#00f2ea",

  // Borders
  border: "#30363d",
  borderFocus: "#58a6ff",
};

// ════════════════════════════════════════════════════════════════════════════
// CHALK SHORTCUTS
// ════════════════════════════════════════════════════════════════════════════

export const c = {
  // Brand
  brand: chalk.hex(COLORS.brand1),
  brandBold: chalk.hex(COLORS.brand1).bold,

  // Text
  text: chalk.hex(COLORS.text),
  dim: chalk.hex(COLORS.textDim),
  muted: chalk.hex(COLORS.textMuted),
  white: chalk.white,
  whiteBold: chalk.white.bold,

  // Semantic
  success: chalk.hex(COLORS.success),
  successBold: chalk.hex(COLORS.success).bold,
  warning: chalk.hex(COLORS.warning),
  warningBold: chalk.hex(COLORS.warning).bold,
  error: chalk.hex(COLORS.error),
  errorBold: chalk.hex(COLORS.error).bold,
  info: chalk.hex(COLORS.info),
  infoBold: chalk.hex(COLORS.info).bold,
  premium: chalk.hex(COLORS.premium),
  premiumBold: chalk.hex(COLORS.premium).bold,

  // Platforms
  instagram: chalk.hex(COLORS.instagram),
  youtube: chalk.hex(COLORS.youtube),
  tiktok: chalk.hex(COLORS.tiktok),

  // Special
  border: chalk.hex(COLORS.border),
  number: chalk.yellow,
  key: chalk.cyan,

  // Backgrounds
  bgSuccess: chalk.bgHex(COLORS.success).hex(COLORS.bg).bold,
  bgError: chalk.bgHex(COLORS.error).hex(COLORS.bg).bold,
  bgInfo: chalk.bgHex(COLORS.info).hex(COLORS.bg).bold,
  bgPremium: chalk.bgHex(COLORS.premium).hex(COLORS.bg).bold,
  bgBrand: chalk.bgHex(COLORS.brand1).hex(COLORS.bg).bold,
  bgInstagram: chalk.bgHex(COLORS.instagram).white.bold,
  bgYoutube: chalk.bgHex(COLORS.youtube).white.bold,
  bgTiktok: chalk.bgHex(COLORS.tiktok).hex(COLORS.bg).bold,
};

// ════════════════════════════════════════════════════════════════════════════
// BOX DRAWING CHARACTERS
// ════════════════════════════════════════════════════════════════════════════

export const BOX = {
  // Rounded corners
  tl: "╭",
  tr: "╮",
  bl: "╰",
  br: "╯",
  // Lines
  h: "─",
  v: "│",
  // T-junctions
  lt: "├",
  rt: "┤",
  tt: "┬",
  bt: "┴",
  // Cross
  x: "┼",
  // Double lines
  dh: "═",
  dv: "║",
  dtl: "╔",
  dtr: "╗",
  dbl: "╚",
  dbr: "╝",
  // Heavy
  hh: "━",
  hv: "┃",
};

// ════════════════════════════════════════════════════════════════════════════
// ICONS
// ════════════════════════════════════════════════════════════════════════════

export const ICON = {
  search: "🔍",
  idea: "💡",
  script: "📝",
  trending: "🔥",
  hook: "🎣",
  video: "🎬",
  sparkle: "✨",
  rocket: "🚀",
  target: "🎯",
  clipboard: "📋",
  check: "✓",
  cross: "✗",
  arrow: "→",
  model: "🤖",
  platform: "📱",
  instagram: "📸",
  youtube: "▶️",
  tiktok: "🎵",
  time: "⏱️",
  hashtag: "#",
  music: "🎵",
  camera: "📷",
  style: "🎨",
};

// ════════════════════════════════════════════════════════════════════════════
// LOGO ASCII ART
// ════════════════════════════════════════════════════════════════════════════

const LOGO_LINES = [
  "   ___            _             _      ___                 _            ",
  "  / __|___ _ _   | |_ ___ _ __ | |_   / __|  _ _ _ __ _ __| |_ ___ _ _  ",
  " | (__/ _ \\ ' \\  |  _/ -_) '  \\|  _| | (_| || | '_/ _` |  _/ _ \\ '_| ",
  "  \\___\\___/_||_|  \\__\\___|_|_|_|\\__|  \\___|_,_|_| \\__,_|\\__\\___/_|   ",
];

/**
 * Render the logo with gradient colors
 */
export function renderLogo(): string[] {
  const colors = [COLORS.brand1, COLORS.brand2, COLORS.brand3, COLORS.brand2];

  return LOGO_LINES.map((line, i) => chalk.hex(colors[i % colors.length])(line));
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Strip ANSI codes for length calculation
 */
export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Create a box with content
 */
export function box(
  content: string[],
  options: { width?: number; title?: string; padding?: number } = {}
): string[] {
  const { width = 60, title, padding = 0 } = options;
  const innerWidth = width - 2;

  const result: string[] = [];

  // Top border with optional title
  if (title) {
    const titleLen = stripAnsi(title).length;
    const leftPad = 2;
    const rightPad = innerWidth - leftPad - titleLen - 2;
    result.push(
      c.border(BOX.tl + BOX.h.repeat(leftPad)) +
        " " +
        c.whiteBold(title) +
        " " +
        c.border(BOX.h.repeat(Math.max(0, rightPad)) + BOX.tr)
    );
  } else {
    result.push(c.border(BOX.tl + BOX.h.repeat(innerWidth) + BOX.tr));
  }

  // Padding top
  for (let i = 0; i < padding; i++) {
    result.push(c.border(BOX.v) + " ".repeat(innerWidth) + c.border(BOX.v));
  }

  // Content
  for (const line of content) {
    const lineLen = stripAnsi(line).length;
    const pad = innerWidth - lineLen - 2;
    result.push(c.border(BOX.v) + " " + line + " ".repeat(Math.max(0, pad + 1)) + c.border(BOX.v));
  }

  // Padding bottom
  for (let i = 0; i < padding; i++) {
    result.push(c.border(BOX.v) + " ".repeat(innerWidth) + c.border(BOX.v));
  }

  // Bottom border
  result.push(c.border(BOX.bl + BOX.h.repeat(innerWidth) + BOX.br));

  return result;
}

/**
 * Create a horizontal line
 */
export function line(width: number = 60): string {
  return c.border(BOX.h.repeat(width));
}

/**
 * Create a progress bar
 */
export function progressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  let color = c.success;
  if (percent < 30) color = c.error;
  else if (percent < 60) color = c.warning;

  return color("█".repeat(filled)) + c.muted("░".repeat(empty));
}

/**
 * Create a model badge
 */
export function modelBadge(model: string, isPremium: boolean): string {
  const icon = isPremium ? c.premium("⚡") : c.info("○");
  const name = isPremium ? c.premium(model) : c.info(model);
  return icon + " " + name;
}

/**
 * Create a platform badge
 */
export function platformBadge(platform: string): string {
  switch (platform) {
    case "instagram":
      return c.bgInstagram(" IG ");
    case "youtube":
      return c.bgYoutube(" YT ");
    case "tiktok":
      return c.bgTiktok(" TT ");
    default:
      return c.bgBrand(" ALL ");
  }
}

/**
 * Key hint display
 */
export function keyHint(key: string, description: string): string {
  return c.key(key) + c.muted(" " + description);
}
