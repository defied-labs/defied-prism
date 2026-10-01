"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { IconButton } from "./ui/IconButton";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <IconButton
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      // The theme is unknown until hydration; the label is only read after it
      suppressHydrationWarning
    >
      {/* Both icons render; CSS shows the right one, so there's no hydration flash */}
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="block dark:hidden" />
    </IconButton>
  );
}
