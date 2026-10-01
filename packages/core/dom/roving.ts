export type Orientation = "horizontal" | "vertical";

export interface NavigationOptions {
  orientation?: Orientation | "both";
  /** Wrap from last to first and vice versa (default true). */
  loop?: boolean;
  /** Reading direction; flips ArrowLeft/ArrowRight in rtl. */
  dir?: "ltr" | "rtl";
  isDisabled?: (index: number) => boolean;
}

/**
 * Where arrow/Home/End navigation moves from `current` in a list of `count`
 * items, skipping disabled ones. Returns null for keys it does not handle.
 * Shared by tabs, listboxes, menus and toolbars in every framework adapter.
 */
export function nextIndex(
  key: string,
  current: number,
  count: number,
  {
    orientation = "horizontal",
    loop = true,
    dir = "ltr",
    isDisabled = () => false,
  }: NavigationOptions = {},
): number | null {
  if (count === 0) return null;
  const horizontal = orientation !== "vertical";
  const vertical = orientation !== "horizontal";
  const forwardKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const backwardKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";

  let step: 1 | -1;
  let index: number;
  if ((horizontal && key === forwardKey) || (vertical && key === "ArrowDown")) {
    step = 1;
    index = current;
  } else if ((horizontal && key === backwardKey) || (vertical && key === "ArrowUp")) {
    step = -1;
    index = current;
  } else if (key === "Home") {
    step = 1;
    index = -1;
  } else if (key === "End") {
    step = -1;
    index = count;
  } else {
    return null;
  }

  const edgeKey = key === "Home" || key === "End";
  for (let i = 0; i < count; i++) {
    index += step;
    if (index >= count || index < 0) {
      if (!loop || edgeKey) return current;
      index = (index + count) % count;
    }
    if (!isDisabled(index)) return index;
  }
  return current;
}
