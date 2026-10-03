import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        title: (
          <span className="font-lora text-lg">
            Defied <span className="text-primary">Prism</span>
          </span>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
