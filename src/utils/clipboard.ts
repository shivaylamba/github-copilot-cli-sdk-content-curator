/**
 * Clipboard utilities
 */

import clipboard from "clipboardy";

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await clipboard.write(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read from clipboard
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    return await clipboard.read();
  } catch {
    return null;
  }
}

/**
 * Strip markdown formatting for clean copy
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "") // Headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/`(.*?)`/g, "$1") // Inline code
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
    .replace(/^\s*[-*+]\s/gm, "• ") // List items
    .replace(/^\s*\d+\.\s/gm, "") // Numbered lists
    .trim();
}

/**
 * Extract numbered items from content (for copying specific items)
 */
export function extractNumberedItems(content: string): string[] {
  const lines = content.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*(\d+)\.\s+(.+)/);
    if (match) {
      items.push(match[2].trim());
    }
  }

  return items;
}
