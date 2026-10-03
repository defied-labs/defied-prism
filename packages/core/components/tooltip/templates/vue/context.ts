import { inject, type ComputedRef, type InjectionKey } from "vue";
import type { TooltipEvent } from "@defied-prism/core/components/tooltip";

export interface TooltipContext {
  open: ComputedRef<boolean>;
  contentId: string;
  send: (event: TooltipEvent) => void;
}

export const TooltipKey: InjectionKey<TooltipContext> = Symbol("Tooltip");

export function useTooltip(part: string): TooltipContext {
  const context = inject(TooltipKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <Tooltip>.`);
  return context;
}

type Handler = ((event: Event) => void) | Array<(event: Event) => void> | undefined;

/** Calls the consumer's listener(s) from attrs, then ours. */
export function compose(theirs: unknown, ours: (event: Event) => void) {
  return (event: Event) => {
    const handler = theirs as Handler;
    if (Array.isArray(handler)) handler.forEach((fn) => fn(event));
    else handler?.(event);
    ours(event);
  };
}
