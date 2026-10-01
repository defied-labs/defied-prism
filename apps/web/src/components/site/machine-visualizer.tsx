"use client";

import { useEffect, useRef, useState } from "react";
import { buttonMachineDefinition } from "@defied-prism/core/components/button";

import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

import { VueIsland } from "./vue-island";

type Framework = "react" | "vue";

const STATES = ["idle", "focused", "pressed", "loading", "disabled"] as const;
const transitions = buttonMachineDefinition.transitions;

/**
 * Follows the `data-state` a component renders. Both adapters write the
 * machine's status there, so this reads the real state, not a copy.
 */
function useRenderedState(host: React.RefObject<HTMLElement | null>, enabled = true) {
  const [state, setState] = useState<string | null>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || !enabled) return;
    const read = () => setState(el.querySelector("[data-slot='button']")?.getAttribute("data-state") ?? null);
    read();
    const observer = new MutationObserver(read);
    observer.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state"] });
    return () => observer.disconnect();
  }, [host, enabled]);
  return state;
}

export function MachineVisualizer() {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const reactHost = useRef<HTMLDivElement>(null);
  const vueHost = useRef<HTMLDivElement>(null);
  const live: Record<Framework, string | null> = {
    react: useRenderedState(reactHost),
    vue: useRenderedState(vueHost),
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5 rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Focus, press or toggle either button. Each one runs its own instance of the same machine definition.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {(["react", "vue"] as const).map((framework) => (
            <div key={framework} className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-background p-5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {framework === "react" ? "React" : "Vue"}
              </span>
              <div ref={framework === "react" ? reactHost : vueHost} className="grid min-h-10 place-items-center">
                {framework === "react" ? (
                  <Button loading={loading} disabled={disabled}>
                    Ship it
                  </Button>
                ) : (
                  <VueIsland demo="button" props={{ loading, disabled, variant: "primary", size: "md" }} />
                )}
              </div>
              <code className="font-mono text-xs" aria-live="polite">
                data-state=&quot;{live[framework] ?? "…"}&quot;
              </code>
            </div>
          ))}
        </div>
        <div className="flex gap-6 border-t pt-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={loading} onCheckedChange={setLoading} /> Loading
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={disabled} onCheckedChange={setDisabled} /> Disabled
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border bg-card p-5">
        <ul className="flex flex-wrap gap-2" aria-label="States">
          {STATES.map((state) => {
            const here = (["react", "vue"] as const).filter((f) => live[f] === state);
            return (
              <li
                key={state}
                data-active={here.length > 0 || undefined}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-sm transition-colors data-[active]:border-primary data-[active]:bg-primary/10"
              >
                {state}
                {here.map((f) => (
                  <span
                    key={f}
                    title={`${f === "react" ? "React" : "Vue"} is here`}
                    className="rounded-full bg-primary px-1.5 text-[10px] font-semibold uppercase text-primary-foreground"
                  >
                    {f === "react" ? "R" : "V"}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <caption className="sr-only">Button machine transitions</caption>
            <thead className="text-muted-foreground">
              <tr>
                <th scope="col" className="py-1.5 pr-4 font-normal">from</th>
                <th scope="col" className="py-1.5 pr-4 font-normal">event</th>
                <th scope="col" className="py-1.5 font-normal">to</th>
              </tr>
            </thead>
            <tbody>
              {transitions.map((t) => {
                const armed = t.from.some((s) => s === live.react || s === live.vue);
                return (
                  <tr key={`${t.event}-${t.from.join()}`} data-armed={armed || undefined} className="border-t text-muted-foreground data-[armed]:text-foreground">
                    <td className="py-1.5 pr-4">{t.from.join(" | ")}</td>
                    <td className="py-1.5 pr-4 font-semibold">{t.event}</td>
                    <td className="py-1.5">{t.to}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Highlighted rows are the transitions available from where the buttons are now. The table is rendered
          from the shipped <code>buttonMachineDefinition</code>, not written by hand.
        </p>
      </div>
    </div>
  );
}
