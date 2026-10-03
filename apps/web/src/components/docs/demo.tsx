import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";

import sources from "@/generated/docs-sources.json";

import { DemoPreview } from "./demo-preview";

const all: Record<string, { react: string; vue: string }> = sources;

/** MDX: `<Demo id="dialog/basic" />`. Both twins must exist (checked at build). */
export function Demo({ id }: { id: string }) {
  const source = all[id];
  if (!source) throw new Error(`Unknown docs demo: ${id}`);
  return (
    <DemoPreview
      id={id}
      code={{
        react: <ServerCodeBlock lang="tsx" code={source.react.trim()} />,
        vue: <ServerCodeBlock lang="vue" code={source.vue.trim()} />,
      }}
    />
  );
}
