"use client";

import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";

import { CopyButton } from "./copy-button";

export interface Snippet {
  path: string;
  code: string;
}

/** Generated files, one tab per file, exactly as `prism add` writes them. */
export function CodeViewer({ files, root }: { files: Snippet[]; root: string }) {
  const first = files[0];
  if (!first) return null;

  return (
    <Tabs
      // Reset the selected file when the file set changes
      key={files.map((f) => f.path).join("|")}
      defaultValue={first.path}
      size="sm"
      // Always dark: scoping the class re-themes the Prism tabs and buttons inside
      className="dark code-viewer flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.17_0.012_250)] text-[oklch(0.92_0.01_250)]"
    >
      <TabList aria-label="Generated files" className="overflow-x-auto px-2">
        {files.map((f) => (
          <Tab key={f.path} value={f.path} className="font-mono text-xs">
            {f.path.split("/").pop()}
          </Tab>
        ))}
      </TabList>
      {files.map((f) => (
        <TabPanel key={f.path} value={f.path} className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2 font-mono text-[11px] text-white/50">
            <span className="truncate">
              {root}/{f.path}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {f.code.split("\n").length} lines
              <CopyButton text={f.code} />
            </span>
          </div>
          <pre
            className="max-h-[30rem] overflow-auto px-4 pb-4 font-mono text-[12.5px] leading-relaxed"
            tabIndex={0}
            aria-label={`${f.path} source`}
          >
            <code>{f.code}</code>
          </pre>
        </TabPanel>
      ))}
    </Tabs>
  );
}
