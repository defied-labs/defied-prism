import { describe, expect, it } from "vitest";

import {
  filterCommands,
  firstEnabled,
  groupCommands,
  isApplePlatform,
  matchesCommand,
  isTypingShortcut,
  matchesShortcut,
  parseShortcut,
} from "../components/command-palette";

const items = [
  { value: "new", textValue: "New file", group: "File" },
  { value: "theme", textValue: "Toggle theme", group: "View", keywords: ["dark mode"] },
  { value: "open", textValue: "Open file", group: "File" },
  { value: "help", textValue: "Help" },
];

type Mods = Partial<Record<"ctrlKey" | "metaKey" | "shiftKey" | "altKey", boolean>>;
const ev = (key: string, mods: Mods = {}) => ({
  key,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...mods,
});

describe("command palette logic", () => {
  it("matches text and keywords, ignoring case and accents", () => {
    expect(matchesCommand(items[1]!, "DARK")).toBe(true);
    expect(matchesCommand({ value: "c", textValue: "Café" }, "cafe")).toBe(true);
    expect(matchesCommand(items[0]!, "theme")).toBe(false);
  });

  it("filters, keeping order; blank query returns all", () => {
    expect(filterCommands(items, "  ")).toHaveLength(4);
    expect(filterCommands(items, "file").map((i) => i.value)).toEqual(["new", "open"]);
    expect(filterCommands(items, "x", (i) => i.value === "help").map((i) => i.value)).toEqual(["help"]);
  });

  it("groups by first appearance", () => {
    expect(groupCommands(items).map((g) => [g.heading, g.items.map((i) => i.value)])).toEqual([
      ["File", ["new", "open"]],
      ["View", ["theme"]],
      [undefined, ["help"]],
    ]);
  });

  it("finds the first and last enabled item", () => {
    const list = [{ disabled: true }, {}, {}, { disabled: true }];
    expect(firstEnabled(list)).toBe(1);
    expect(firstEnabled(list, true)).toBe(2);
    expect(firstEnabled([{ disabled: true }])).toBe(-1);
  });
});

describe("shortcuts", () => {
  it("parses modifiers and keys", () => {
    expect(parseShortcut("Mod+K")).toEqual({ key: "k", mod: true, ctrl: false, meta: false, shift: false, alt: false });
    expect(parseShortcut("ctrl+shift+alt+meta+p")).toMatchObject({ ctrl: true, shift: true, alt: true, meta: true, key: "p" });
    expect(parseShortcut("mod++").key).toBe("+");
    expect(() => parseShortcut("hyper+k")).toThrow(/hyper/);
  });

  it("detects Apple platforms", () => {
    expect(isApplePlatform("MacIntel")).toBe(true);
    expect(isApplePlatform("iPhone")).toBe(true);
    expect(isApplePlatform("Win32")).toBe(false);
  });

  it("maps mod to Meta on Apple and Ctrl elsewhere", () => {
    expect(matchesShortcut(ev("k", { metaKey: true }), "mod+k", true)).toBe(true);
    expect(matchesShortcut(ev("k", { ctrlKey: true }), "mod+k", true)).toBe(false);
    expect(matchesShortcut(ev("K", { ctrlKey: true }), "mod+k", false)).toBe(true);
    expect(matchesShortcut(ev("k", { metaKey: true }), "mod+k", false)).toBe(false);
  });

  it("plain-key shortcuts don't fire while typing; chords do", () => {
    const input = { tagName: "INPUT" };
    expect(isTypingShortcut("/", input)).toBe(true);
    expect(isTypingShortcut("/", { tagName: "DIV", isContentEditable: true })).toBe(true);
    expect(isTypingShortcut("/", { tagName: "BUTTON" })).toBe(false);
    expect(isTypingShortcut("mod+k", input)).toBe(false);
    expect(isTypingShortcut("alt+k", { tagName: "TEXTAREA" })).toBe(false);
  });

  it("requires modifiers to match exactly", () => {
    expect(matchesShortcut(ev("k", { ctrlKey: true, shiftKey: true }), "mod+k", false)).toBe(false);
    expect(matchesShortcut(ev("k"), "mod+k", false)).toBe(false);
    expect(matchesShortcut(ev("j", { ctrlKey: true }), "mod+k", false)).toBe(false);
    expect(matchesShortcut(ev("p", { ctrlKey: true, shiftKey: true }), "ctrl+shift+p", true)).toBe(true);
  });
});
