import { inject, type InjectionKey, type Ref, type WritableComputedRef } from "vue";

export interface PopoverContext {
  open: WritableComputedRef<boolean>;
  contentId: string;
  /** The trigger's element, for returning focus. */
  triggerEl: Ref<HTMLElement | null>;
}

export const PopoverKey: InjectionKey<PopoverContext> = Symbol("Popover");

export function usePopover(part: string): PopoverContext {
  const context = inject(PopoverKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <Popover>.`);
  return context;
}

/** A template ref on a component (Button, Slot) or element, resolved to its element. */
export function elementOf(target: unknown): HTMLElement | null {
  const el = (target as { $el?: unknown } | null)?.$el ?? target;
  return el instanceof HTMLElement ? el : null;
}

/** PopoverTrigger / PopoverClose props: Button's, plus asChild. */
export interface PopoverButtonProps {
  /** Render your own element (a link, an icon, a menu item) instead of a Prism Button. */
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
