"use client";

import { Badge } from "@/components/ui/Badge";

import { Command } from "./copy-button";
import { reactDemos } from "./react-demos";
import type { DemoName } from "./vue-island";

const ITEMS: { demo: DemoName; title: string; blurb: string; add: string }[] = [
  { demo: "button", title: "Button", blurb: "Loading stays focusable; activation is ignored, not swallowed.", add: "button" },
  { demo: "field", title: "Field + Input", blurb: "Label, description and error wired to any control inside it.", add: "field input" },
  { demo: "select", title: "Select", blurb: "Typeahead, groups, disabled items, and form submission.", add: "select" },
  { demo: "dialog", title: "Dialog", blurb: "Focus trap, scroll lock, Escape, and the page hidden from screen readers.", add: "dialog" },
  { demo: "toast", title: "Toast", blurb: "Queued, pausable on hover and focus, announced politely.", add: "toast" },
  { demo: "calendar", title: "Calendar", blurb: "Roving focus over the grid, PageUp/PageDown by month, min and max.", add: "calendar" },
  { demo: "data-table", title: "Data table", blurb: "Sortable with aria-sort, selectable rows, scrolls when it overflows.", add: "data-table" },
];

export function Gallery({ vueReady }: { vueReady: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map(({ demo, title, blurb, add }) => {
        const Demo = reactDemos[demo];
        const names = add.split(" ");
        const vue = names.every((name) => vueReady.includes(name));
        return (
          <li key={demo} className={`flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5 ${demo === "data-table" ? "sm:col-span-2" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                <Badge size="sm" variant="outline">React</Badge>
                {vue && <Badge size="sm" variant="outline">Vue</Badge>}
              </div>
            </div>
            <div className="grid min-h-32 flex-1 place-items-center overflow-x-auto rounded-lg bg-background p-4">
              <Demo />
            </div>
            <Command>{`npx prism add ${names.join(" && npx prism add ")}`}</Command>
          </li>
        );
      })}
    </ul>
  );
}
