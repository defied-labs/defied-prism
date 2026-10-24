"use client";

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

import { reactDemos } from "@/generated/docs-demos";

import { type Framework, FrameworkSwitch, useFramework } from "./framework";

function VueDemo({ id }: { id: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unmount: (() => void) | undefined;
    import("@defied/prism-vue-demos")
      .then(({ mountDoc }) => {
        if (!cancelled && host.current) unmount = mountDoc(host.current, id).unmount;
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [id]);

  if (failed) {
    return <p className="text-sm text-muted-foreground">The Vue preview failed to load.</p>;
  }
  // display: contents makes the mounted demo a flex item of the preview, as a React demo is
  return <div ref={host} className="contents" data-framework="vue" />;
}

/** A live demo in the chosen framework, with that framework's source below it. */
export function DemoPreview({ id, code }: { id: string; code: Record<Framework, React.ReactNode> }) {
  const framework = useFramework();
  const ReactDemo = useMemo(() => {
    const load = reactDemos[id];
    if (!load) throw new Error(`Unknown docs demo: ${id}`);
    return lazy(load);
  }, [id]);

  return (
    // No overflow-hidden here: it would clip popups (menus, popovers) that leave the preview
    <div className="not-prose my-6 rounded-xl border">
      <div className="flex justify-end rounded-t-xl border-b bg-muted/40 p-1.5">
        <FrameworkSwitch />
      </div>
      {/* Above the code below, so popups overlap it instead of sliding under it */}
      <div className="relative z-10 flex min-h-40 items-center justify-center gap-3 p-8">
        {framework === "react" ? (
          <Suspense fallback={null}>
            <ReactDemo />
          </Suspense>
        ) : (
          <VueDemo key={id} id={id} />
        )}
      </div>
      <div className="overflow-hidden rounded-b-xl border-t [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0">
        {code[framework]}
      </div>
    </div>
  );
}
