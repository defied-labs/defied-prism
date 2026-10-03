import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { ApiReference } from "./api-reference";
import { Demo } from "./demo";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ApiReference,
    Demo,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;
