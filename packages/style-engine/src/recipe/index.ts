import type { TokenPath, TokenRef } from "@defied-prism/tokens";

import type { Recipe } from "./types";

export * from "./types";
export * from "./compile";

/** Identity helper that gives recipe files type checking. */
export function defineRecipe<const R extends Recipe>(recipe: R): R {
  return recipe;
}

/** Typed token reference for use inside recipe values: token("color.primary"). */
export function token(path: TokenPath): TokenRef {
  return `{${path}}`;
}
