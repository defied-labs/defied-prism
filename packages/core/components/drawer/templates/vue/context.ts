import { inject, type InjectionKey, type Ref, type WritableComputedRef } from "vue";

export interface DrawerContext {
  open: WritableComputedRef<boolean>;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: Ref<boolean>;
  hasDescription: Ref<boolean>;
}

export const DrawerKey: InjectionKey<DrawerContext> = Symbol("Drawer");

export function useDrawer(part: string): DrawerContext {
  const context = inject(DrawerKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <Drawer>.`);
  return context;
}

/** DrawerTrigger / DrawerClose props: Button's, plus asChild. */
export interface DrawerButtonProps {
  /** Render your own element (a link, an icon, a menu item) instead of a Prism Button. */
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
