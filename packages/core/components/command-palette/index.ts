/**
 * Command palette filtering, ordering and shortcut matching, framework-agnostic.
 */
import { matchesQuery } from "../combobox";

/** What a registered command item tells the palette about itself. */
export interface CommandItem {
  value: string;
  /** Searchable text (the item's visible text unless given explicitly). */
  textValue: string;
  /** Group key; items with the same group render together. */
  group?: string;
  /** Extra search terms (aliases, descriptions). */
  keywords?: readonly string[];
  disabled?: boolean;
}

export interface CommandGroup<T extends CommandItem = CommandItem> {
  /** Group key, or undefined for ungrouped items. */
  heading: string | undefined;
  items: T[];
}

/** Default match: accent/case-insensitive "contains" on the text or any keyword. */
export function matchesCommand(item: CommandItem, query: string): boolean {
  if (matchesQuery({ value: item.value, label: item.textValue }, query)) return true;
  return (item.keywords ?? []).some((keyword) =>
    matchesQuery({ value: item.value, label: keyword }, query),
  );
}

/** Items matching `query` (all of them for a blank query), in their original order. */
export function filterCommands<T extends CommandItem>(
  items: readonly T[],
  query: string,
  matches: (item: T, query: string) => boolean = matchesCommand,
): T[] {
  if (!query.trim()) return [...items];
  return items.filter((item) => matches(item, query));
}

/** Groups in order of first appearance; each keeps its items' order. */
export function groupCommands<T extends CommandItem>(items: readonly T[]): CommandGroup<T>[] {
  const groups: CommandGroup<T>[] = [];
  for (const item of items) {
    let group = groups.find((g) => g.heading === item.group);
    if (!group) groups.push((group = { heading: item.group, items: [] }));
    group.items.push(item);
  }
  return groups;
}

/** Index of the first (or last) enabled item, or -1. */
export function firstEnabled(items: readonly { disabled?: boolean }[], fromEnd = false): number {
  const flags = items.map((item) => !item.disabled);
  return fromEnd ? flags.lastIndexOf(true) : flags.indexOf(true);
}

// Global shortcut

export interface Shortcut {
  key: string;
  /** Meta on Apple platforms, Ctrl elsewhere. */
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}

export interface ShortcutEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** Parse "mod+k", "ctrl+shift+p", "meta+/" (case-insensitive; "mod++" means the "+" key). */
export function parseShortcut(shortcut: string): Shortcut {
  const parts = shortcut.toLowerCase().split("+");
  let key = parts.pop() ?? "";
  if (key === "" && parts[parts.length - 1] === "") {
    parts.pop();
    key = "+";
  }
  const result: Shortcut = { key, mod: false, ctrl: false, meta: false, shift: false, alt: false };
  for (const part of parts) {
    switch (part.trim()) {
      case "mod":
        result.mod = true;
        break;
      case "ctrl":
      case "control":
        result.ctrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
        result.meta = true;
        break;
      case "shift":
        result.shift = true;
        break;
      case "alt":
      case "option":
        result.alt = true;
        break;
      default:
        throw new Error(`Unknown shortcut modifier "${part}" in "${shortcut}"`);
    }
  }
  return result;
}

/** True for macOS / iOS platform or user-agent strings. */
export function isApplePlatform(platform: string): boolean {
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** Does `event` press exactly `shortcut`? Modifiers must match exactly. */
export function matchesShortcut(event: ShortcutEvent, shortcut: string | Shortcut, apple: boolean): boolean {
  const s = typeof shortcut === "string" ? parseShortcut(shortcut) : shortcut;
  const ctrl = s.ctrl || (s.mod && !apple);
  const meta = s.meta || (s.mod && apple);
  return (
    event.key.toLowerCase() === s.key &&
    event.ctrlKey === ctrl &&
    event.metaKey === meta &&
    event.shiftKey === s.shift &&
    event.altKey === s.alt
  );
}

/** Minimal shape of an event target, so this stays DOM-free to test. */
export interface ShortcutTarget {
  tagName?: string;
  isContentEditable?: boolean;
}

/**
 * Whether a shortcut should be skipped because the user is typing. A plain
 * key ("/", "k") in a text field is text, not a command; a chord with
 * Ctrl/Meta/Alt ("mod+k") works everywhere, as users expect.
 */
export function isTypingShortcut(shortcut: string | Shortcut, target: ShortcutTarget | null): boolean {
  const s = typeof shortcut === "string" ? parseShortcut(shortcut) : shortcut;
  if (s.mod || s.ctrl || s.meta || s.alt) return false;
  const tag = target?.tagName?.toLowerCase();
  return !!target?.isContentEditable || tag === "input" || tag === "textarea" || tag === "select";
}
