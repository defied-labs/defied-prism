"use client";

import { useTheme } from "next-themes";
import { type ComponentProps, useSyncExternalStore } from "react";
import Prism from "./prism-background";

function useMediaQuery(query: string) {
  const supported = typeof window !== "undefined" &&
    typeof window.matchMedia === "function";
  return useSyncExternalStore(
    (onChange) => {
      if (!supported) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => supported && window.matchMedia(query).matches,
    () => false,
  );
}

// Only mounts the WebGL prism where it is seen and wanted: desktop, dark
// theme, no reduced-motion preference. Hiding it with CSS would still run
// the render loop.
export function HeroPrism(props: ComponentProps<typeof Prism>) {
  const { resolvedTheme } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  if (resolvedTheme !== "dark" || !isDesktop || reducedMotion) return null;
  // data-prism switches the hero from centered to split (see page.tsx).
  return (
    <div data-prism className="h-full self-stretch">
      <Prism suspendWhenOffscreen {...props} />
    </div>
  );
}
