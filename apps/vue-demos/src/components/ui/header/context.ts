import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";

export type Orientation = "horizontal" | "vertical";

export interface HeaderContext {
  orientation: Ref<Orientation>;
  /** The collapsed navigation is shown (only ever true while vertical). */
  open: ComputedRef<boolean>;
  setOpen: (open: boolean) => void;
  navId: string;
  toggleEl: Ref<HTMLElement | null>;
  navEl: Ref<HTMLElement | null>;
}

export interface NavContext {
  value: ComputedRef<string | null>;
  select: (value: string | null) => void;
  /** Pointer over a menu: open it (switching from any other). */
  hoverOpen: (value: string) => void;
  /** Pointer over a plain item, or out of the nav: close a menu the pointer opened. */
  hoverClose: () => void;
  /** The open menu was opened by hovering, so a click keeps it open. */
  openedByHover: { current: boolean };
}

export interface MenuContext {
  value: string;
  open: ComputedRef<boolean>;
  contentId: string;
  triggerEl: Ref<HTMLElement | null>;
}

export const HeaderKey: InjectionKey<HeaderContext> = Symbol("Header");
export const NavKey: InjectionKey<NavContext> = Symbol("HeaderNav");
export const MenuKey: InjectionKey<MenuContext> = Symbol("HeaderMenu");

export function useHeader(part: string): HeaderContext {
  const context = inject(HeaderKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <Header>.`);
  return context;
}

export function useNav(part: string): NavContext {
  const context = inject(NavKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <HeaderNav>.`);
  return context;
}

export function useMenu(part: string): MenuContext {
  const context = inject(MenuKey, null);
  if (!context) throw new Error(`<${part}> must be used inside <HeaderMenu>.`);
  return context;
}

/** A template ref on a component (Button, Slot) or element, resolved to its element. */
export function elementOf(target: unknown): HTMLElement | null {
  const el = (target as { $el?: unknown } | null)?.$el ?? target;
  return el instanceof HTMLElement ? el : null;
}
