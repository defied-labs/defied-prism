import { inject, type InjectionKey, type Ref, type WritableComputedRef } from "vue";

export interface DialogContext {
  open: WritableComputedRef<boolean>;
  /** The DialogTrigger that last opened the dialog; the content grows out of it. */
  trigger: { current: HTMLElement | null };
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: Ref<boolean>;
  hasDescription: Ref<boolean>;
}

export const DialogKey: InjectionKey<DialogContext> = Symbol("Dialog");

export function useDialog(part: string): DialogContext {
  const context = inject(DialogKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <Dialog>.`);
  return context;
}

/** DialogTrigger / DialogClose props: Button's, plus asChild. */
export interface DialogButtonProps {
  /** Render your own element (a link, an icon, a menu item) instead of a Prism Button. */
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
