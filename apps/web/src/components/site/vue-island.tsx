"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoName, MountedDemo } from "@defied-labs/prism-vue-demos";

export type { DemoName };

/**
 * Mounts a real Vue app (generated Prism Vue components, CSS Modules) into
 * this React page. Vue is loaded on the client only, on first use.
 */
export function VueIsland({
  demo,
  props = {},
  className,
}: {
  demo: DemoName;
  props?: Record<string, unknown>;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mounted = useRef<MountedDemo | null>(null);
  const [failed, setFailed] = useState(false);
  const propsKey = JSON.stringify(props);

  useEffect(() => {
    let cancelled = false;
    import("@defied-labs/prism-vue-demos")
      .then(({ mount }) => {
        if (cancelled || !host.current) return;
        mounted.current = mount(host.current, demo, JSON.parse(propsKey));
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      mounted.current?.unmount();
      mounted.current = null;
    };
    // Remount only when the demo changes; props flow through update()
  }, [demo]);

  useEffect(() => {
    mounted.current?.update(JSON.parse(propsKey));
  }, [propsKey]);

  if (failed) {
    return <p className="text-sm text-muted-foreground">The Vue preview failed to load.</p>;
  }
  return <div ref={host} className={className} data-framework="vue" />;
}
