export type Position =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

/** Where focus came from when it entered the region; shared by the Toaster and its items. */
export interface ReturnFocus {
  current: HTMLElement | null;
}
