import { inject, type InjectionKey, type Ref, type WritableComputedRef } from "vue";
import type { Collection, CollectionRecord } from "@defied-prism/vue";

export type FocusTarget = "first" | "last";

export type MenuItemEntry = CollectionRecord<{
  id: string;
  value: string;
  textValue?: string;
  disabled?: boolean;
}>;

export interface MenuContext {
  open: WritableComputedRef<boolean>;
  contentId: string;
  triggerId: string;
  triggerRef: Ref<HTMLElement | null>;
  /** Which item to focus when the menu opens. */
  focusTarget: { current: FocusTarget };
  /** Set while Space toggles a checkable item, which keeps the menu open. */
  keepOpen: { current: boolean };
  close: (focusTrigger: boolean) => void;
  /** Items register here, in DOM order. */
  collection: Collection<MenuItemEntry>;
}

export const MenuKey: InjectionKey<MenuContext> = Symbol("PrismDropdownMenu");

export function useMenu(part: string): MenuContext {
  const context = inject(MenuKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <DropdownMenu>.`);
  return context;
}

export interface GroupContextValue {
  labelId: string;
  setHasLabel: (value: boolean) => void;
}

export const GroupKey: InjectionKey<GroupContextValue> = Symbol("PrismDropdownMenuGroup");

export interface RadioGroupContextValue {
  value: Readonly<Ref<string | null>>;
  setValue: (value: string) => void;
}

export const RadioGroupKey: InjectionKey<RadioGroupContextValue> = Symbol(
  "PrismDropdownMenuRadioGroup",
);

/** DropdownMenuTrigger props: Button's, plus asChild. */
export interface DropdownMenuTriggerProps {
  /** Render your own element (a link, an icon, a menu item) instead of a Prism Button. */
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

/**
 * Props shared by every item. Listen to `@select` (called on click, Enter,
 * Space): the menu then closes and focus returns to the trigger, unless the
 * listener calls `event.preventDefault()`.
 */
export interface DropdownMenuItemProps {
  disabled?: boolean;
  /** Text for typeahead when the item's content isn't plain text. */
  textValue?: string;
}
