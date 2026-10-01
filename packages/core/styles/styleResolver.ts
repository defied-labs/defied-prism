import type { StyleContext } from "./types";

export interface StyleResolver {
  resolve(context: StyleContext): unknown;
}
