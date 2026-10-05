"use client";

import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";

import { Command } from "./copy-button";

const STEPS = {
  react: [
    ["Initialize", "npx @defied-labs/prism-cli init"],
    ["Install the runtime", "npm install @defied-labs/prism-core @defied-labs/prism-react @defied-labs/prism-tokens"],
    ["Add components", "npx @defied-labs/prism-cli add dialog"],
  ],
  vue: [
    ["Initialize", "npx @defied-labs/prism-cli init --framework vue"],
    ["Install the runtime", "npm install @defied-labs/prism-core @defied-labs/prism-vue @defied-labs/prism-tokens"],
    ["Add components", "npx @defied-labs/prism-cli add dialog"],
  ],
} as const;

export function Install() {
  return (
    <Tabs defaultValue="react" className="grid gap-5">
      <TabList aria-label="Framework">
        <Tab value="react">React</Tab>
        <Tab value="vue">Vue</Tab>
      </TabList>
      {(Object.keys(STEPS) as (keyof typeof STEPS)[]).map((framework) => (
        <TabPanel key={framework} value={framework} className="min-w-0">
          <ol className="grid gap-4">
            {STEPS[framework].map(([title, command], i) => (
              <li key={title} className="grid min-w-0 gap-2">
                <span className="text-sm font-medium">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {title}
                </span>
                <Command>{command}</Command>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-muted-foreground">
            Then switch every component to another styling engine at any time:{" "}
            <code className="font-mono">npx @defied-labs/prism-cli sync --style css-modules</code>
          </p>
        </TabPanel>
      ))}
    </Tabs>
  );
}
