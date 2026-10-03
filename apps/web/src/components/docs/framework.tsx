"use client";

import { useSyncExternalStore } from "react";

export type Framework = "react" | "vue";

// One choice for every preview and API table on the site, remembered across visits
const KEY = "prism-docs-framework";
const listeners = new Set<() => void>();

function readFramework(): Framework {
  try {
    return localStorage.getItem(KEY) === "vue" ? "vue" : "react";
  } catch {
    return "react";
  }
}

export function setFramework(next: Framework) {
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Storage blocked: the choice still applies until the page reloads
  }
  listeners.forEach((notify) => notify());
}

export function useFramework() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    readFramework,
    () => "react" as const,
  );
}

export function FrameworkSwitch() {
  const framework = useFramework();
  return (
    <div role="group" aria-label="Framework" className="flex items-center gap-1">
      {(["react", "vue"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={framework === option}
          onClick={() => setFramework(option)}
          className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
        >
          {option === "react" ? "React" : "Vue"}
        </button>
      ))}
    </div>
  );
}

/** Shows the content for the framework chosen anywhere on the site. */
export function ByFramework(content: Record<Framework, React.ReactNode>) {
  return content[useFramework()];
}
