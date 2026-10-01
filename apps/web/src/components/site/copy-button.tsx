"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="xs"
      variant="ghost"
      aria-label={copied ? "Copied" : `${label}: ${text.split("\n")[0]}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked (insecure context): leave the text selectable
        }
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

/** A shell command with a copy button. */
export function Command({ children }: { children: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-muted/60 py-1.5 pl-4 pr-1.5 font-mono text-sm">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
        <span className="select-none text-muted-foreground">$ </span>
        {children}
      </code>
      <CopyButton text={children} />
    </div>
  );
}
