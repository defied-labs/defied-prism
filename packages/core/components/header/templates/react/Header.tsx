import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type MouseEvent,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from "react";
import { Slot, useComposedRefs, useControllableState } from "@defied/prism-react";
import { lockScroll, onDismiss, slotClass, trapFocus, variantData, type StyleSlots } from "@defied/prism-core";
import { IconButton, type IconButtonProps } from "./IconButton";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

// Measuring before paint keeps the shared menu surface from flashing in the wrong place
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Orientation = "horizontal" | "vertical";

interface HeaderContextValue {
  orientation: Orientation;
  /** The collapsed navigation is shown (only ever true while vertical). */
  open: boolean;
  setOpen: (open: boolean) => void;
  navId: string;
  toggleRef: MutableRefObject<HTMLButtonElement | null>;
  navRef: MutableRefObject<HTMLElement | null>;
}

const HeaderContext = createContext<HeaderContextValue | null>(null);

function useHeader(part: string): HeaderContextValue {
  const context = useContext(HeaderContext);
  if (!context) throw new Error(`<${part}> must be used inside <Header>.`);
  return context;
}

interface NavContextValue {
  value: string | null;
  select: (value: string | null) => void;
  /** Pointer over a menu: open it (switching from any other). */
  hoverOpen: (value: string) => void;
  /** Pointer over a plain item, or out of the nav: close a menu the pointer opened. */
  hoverClose: () => void;
  /** The open menu was opened by hovering, so a click keeps it open. */
  openedByHover: MutableRefObject<boolean>;
}

const NavContext = createContext<NavContextValue | null>(null);

function useNav(part: string): NavContextValue {
  const context = useContext(NavContext);
  if (!context) throw new Error(`<${part}> must be used inside <HeaderNav>.`);
  return context;
}

interface MenuContextValue {
  value: string;
  open: boolean;
  contentId: string;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(part: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`<${part}> must be used inside <HeaderMenu>.`);
  return context;
}

/** True below `width` pixels. False during SSR and the first render, so markup matches. */
function useBelow(width: number): boolean {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    if (width <= 0 || typeof window.matchMedia !== "function") {
      setBelow(false);
      return;
    }
    const query = window.matchMedia(`(max-width: ${width - 0.02}px)`);
    const update = () => setBelow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [width]);
  return below;
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  variant?: "bar" | "floating";
  position?: "static" | "sticky" | "fixed";
  /** Viewport width (px) below which the navigation collapses behind `HeaderToggle`; 0 never collapses. */
  collapseBelow?: number;
  /** The collapsed navigation is shown. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** The page's banner: brand, navigation and actions. */
export const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      variant = "bar",
      position = "sticky",
      collapseBelow = 768,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = { variant, position };
    const [open, setOpen] = useControllableState({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const orientation: Orientation = useBelow(collapseBelow) ? "vertical" : "horizontal";
    const navId = `${useId()}-header-nav`;
    const toggleRef = useRef<HTMLButtonElement | null>(null);
    const navRef = useRef<HTMLElement | null>(null);

    const setOpenRef = useRef(setOpen);
    setOpenRef.current = setOpen;

    // Back to a full-width nav: there is no panel left to have open
    useEffect(() => {
      if (orientation === "horizontal") setOpenRef.current(false);
    }, [orientation]);

    // The collapsed nav covers the screen: modal while it's shown
    const panelOpen = orientation === "vertical" && open;
    useEffect(() => {
      const nav = navRef.current;
      if (!panelOpen || !nav) return;
      const unlock = lockScroll(nav.ownerDocument);
      const release = trapFocus(nav);
      const stop = onDismiss({
        inside: () => [nav, toggleRef.current],
        onDismiss: (reason) => {
          setOpenRef.current(false);
          if (reason === "escape") toggleRef.current?.focus();
        },
      });
      return () => {
        stop();
        release();
        unlock();
      };
    }, [panelOpen]);

    return (
      <HeaderContext.Provider value={{ orientation, open: panelOpen, setOpen, navId, toggleRef, navRef }}>
        <header
          {...props}
          ref={ref}
          data-slot="header"
          data-state={panelOpen ? "open" : "closed"}
          data-orientation={orientation}
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          {children}
        </header>
      </HeaderContext.Provider>
    );
  },
);
Header.displayName = "Header";

export interface HeaderBrandProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render your own link (e.g. Next.js `Link`) instead of an `<a>`. */
  asChild?: boolean;
}

/** The logo or product name, linking home. */
export const HeaderBrand = forwardRef<HTMLAnchorElement, HeaderBrandProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        {...props}
        ref={ref as never}
        data-slot="header-brand"
        className={slotClass(slots, "brand", {}, className)}
      >
        {children as ReactElement}
      </Comp>
    );
  },
);
HeaderBrand.displayName = "HeaderBrand";

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
);

export interface HeaderNavProps extends Omit<HTMLAttributes<HTMLElement>, "defaultValue"> {
  /** The open menu's `value`. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Names the close button of the collapsed nav. */
  closeLabel?: string;
}

/**
 * The navigation landmark and its list. One menu is open at a time, on a
 * single surface that moves from menu to menu; it stays open while the
 * pointer is anywhere over the nav. Collapsed, the nav is a full-screen
 * panel that `HeaderToggle` slides in.
 */
export const HeaderNav = forwardRef<HTMLElement, HeaderNavProps>(
  (
    { value: valueProp, defaultValue = null, onValueChange, closeLabel = "Close menu", className, children, onPointerLeave, ...props },
    ref,
  ) => {
    const header = useHeader("HeaderNav");
    const composedRef = useComposedRefs(ref, header.navRef);
    const [value, setValue] = useControllableState<string | null>({
      value: valueProp,
      defaultValue,
      onChange: onValueChange,
    });
    const openedByHover = useRef(false);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const orientation = header.orientation;
    const collapsed = orientation === "vertical";

    const setValueRef = useRef(setValue);
    setValueRef.current = setValue;
    const valueRef = useRef(value);
    valueRef.current = value;

    // Switching layouts, or closing the collapsed panel, closes its menus
    const layout = `${orientation}:${header.open}`;
    const previousLayout = useRef(layout);
    useEffect(() => {
      if (previousLayout.current === layout) return;
      previousLayout.current = layout;
      if (valueRef.current !== null) setValueRef.current(null);
    }, [layout]);

    // Hidden while sliding out, so it can't be tabbed into (set directly: React 18 and 19 disagree on `inert`)
    useEffect(() => {
      header.navRef.current?.toggleAttribute("inert", collapsed && !header.open);
    }, [collapsed, header.open, header.navRef]);

    // Fit the shared surface to the open menu's panel, following it as it resizes
    const wasOpen = useRef(false);
    useIsomorphicLayoutEffect(() => {
      const nav = header.navRef.current;
      const viewport = viewportRef.current;
      const panel = nav?.querySelector<HTMLElement>('[data-slot="header-panel"]');
      if (!nav || !viewport || !panel || collapsed) {
        wasOpen.current = false;
        return;
      }
      const place = () => {
        const outer = nav.getBoundingClientRect();
        const inner = panel.getBoundingClientRect();
        Object.assign(viewport.style, {
          left: `${inner.left - outer.left}px`,
          top: `${inner.top - outer.top}px`,
          width: `${inner.width}px`,
          height: `${inner.height}px`,
        });
      };
      // Opening from closed: appear in place; only moving between menus slides
      if (!wasOpen.current) viewport.style.transitionProperty = "opacity, scale, translate";
      place();
      wasOpen.current = true;
      const frame = requestAnimationFrame(() => {
        viewport.style.transitionProperty = "";
      });
      const observer = typeof ResizeObserver === "function" ? new ResizeObserver(place) : undefined;
      observer?.observe(panel);
      return () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
      };
    }, [value, collapsed]);

    const select = (next: string | null) => {
      openedByHover.current = false;
      setValue(next);
    };
    const nav: NavContextValue = {
      value,
      select,
      openedByHover,
      hoverOpen: (next) => {
        if (collapsed || valueRef.current === next) return;
        openedByHover.current = true;
        setValue(next);
      },
      hoverClose: () => {
        if (!collapsed && openedByHover.current && valueRef.current !== null) select(null);
      },
    };

    const label = props["aria-label"] ?? (props["aria-labelledby"] ? undefined : "Main");

    return (
      <NavContext.Provider value={nav}>
        <nav
          {...props}
          ref={composedRef}
          id={header.navId}
          aria-label={label}
          data-slot="header-nav"
          data-orientation={orientation}
          data-state={collapsed ? (header.open ? "open" : "closed") : undefined}
          className={slotClass(slots, "nav", {}, className)}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            if (!event.defaultPrevented && event.pointerType === "mouse") nav.hoverClose();
          }}
        >
          {/* Before the list, so the menus paint over it */}
          <div
            ref={viewportRef}
            aria-hidden="true"
            data-slot="header-viewport"
            data-state={value !== null && !collapsed ? "open" : "closed"}
            data-orientation={orientation}
            className={slotClass(slots, "viewport", {})}
          />
          <ul data-slot="header-list" data-orientation={orientation} className={slotClass(slots, "list", {})}>
            {children}
          </ul>
          {collapsed && (
            <IconButton
              data-slot="header-close"
              aria-label={closeLabel}
              variant="primary"
              size="lg"
              className={slotClass(slots, "close", {})}
              onClick={() => {
                header.setOpen(false);
                header.toggleRef.current?.focus();
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </nav>
      </NavContext.Provider>
    );
  },
);
HeaderNav.displayName = "HeaderNav";

export type HeaderItemProps = LiHTMLAttributes<HTMLLIElement>;

/** A top-level entry holding a single `HeaderLink`. */
export const HeaderItem = forwardRef<HTMLLIElement, HeaderItemProps>(({ className, onPointerEnter, ...props }, ref) => {
  const header = useHeader("HeaderItem");
  const nav = useNav("HeaderItem");
  return (
    <li
      {...props}
      ref={ref}
      data-slot="header-item"
      data-orientation={header.orientation}
      className={slotClass(slots, "item", {}, className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        // The surface would otherwise stay under the previous menu
        if (!event.defaultPrevented && event.pointerType === "mouse") nav.hoverClose();
      }}
    />
  );
});
HeaderItem.displayName = "HeaderItem";

export interface HeaderMenuProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Identifies the menu for `HeaderNav`'s `value`; generated when omitted. */
  value?: string;
}

/**
 * A top-level entry that discloses a group of links (the APG disclosure
 * navigation pattern: a button, not an ARIA menu). A mouse opens it by
 * hovering; a click, Enter or Space opens it too. Escape, an outside click
 * or tabbing past it closes it.
 */
export const HeaderMenu = forwardRef<HTMLLIElement, HeaderMenuProps>(
  ({ value: valueProp, className, children, onPointerEnter, onBlur, ...props }, ref) => {
    const header = useHeader("HeaderMenu");
    const nav = useNav("HeaderMenu");
    const generated = useId();
    const value = valueProp ?? generated;
    const open = nav.value === value;
    const itemRef = useRef<HTMLLIElement | null>(null);
    const composedRef = useComposedRefs(ref, itemRef);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const navRef = useRef(nav);
    navRef.current = nav;

    useEffect(() => {
      const item = itemRef.current;
      if (!open || !item) return;
      return onDismiss({
        inside: () => [item],
        onDismiss: (reason) => {
          navRef.current.select(null);
          if (reason === "escape") triggerRef.current?.focus();
        },
      });
    }, [open]);

    return (
      <MenuContext.Provider value={{ value, open, contentId: `${generated}-header-content`, triggerRef }}>
        <li
          {...props}
          ref={composedRef}
          data-slot="header-item"
          data-state={open ? "open" : "closed"}
          data-orientation={header.orientation}
          className={slotClass(slots, "item", {}, className)}
          onPointerEnter={(event) => {
            onPointerEnter?.(event);
            if (!event.defaultPrevented && event.pointerType === "mouse") nav.hoverOpen(value);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            // Tabbing past the menu closes it; focus leaving the page doesn't
            const next = event.relatedTarget as Node | null;
            if (!event.defaultPrevented && open && next && !event.currentTarget.contains(next)) nav.select(null);
          }}
        >
          {children}
        </li>
      </MenuContext.Provider>
    );
  },
);
HeaderMenu.displayName = "HeaderMenu";

export type HeaderMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The menu's label, as plain text; opens and closes its `HeaderMenu`. */
export const HeaderMenuTrigger = forwardRef<HTMLButtonElement, HeaderMenuTriggerProps>(
  ({ type = "button", className, onClick, ...props }, ref) => {
    const header = useHeader("HeaderMenuTrigger");
    const nav = useNav("HeaderMenuTrigger");
    const menu = useMenu("HeaderMenuTrigger");
    const composedRef = useComposedRefs(ref, menu.triggerRef);
    return (
      <button
        {...props}
        ref={composedRef}
        type={type}
        aria-expanded={menu.open}
        aria-controls={menu.open ? menu.contentId : undefined}
        data-slot="header-trigger"
        data-orientation={header.orientation}
        className={slotClass(slots, "trigger", {}, className)}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          // A click on a menu the pointer just opened keeps it open
          if (menu.open && nav.openedByHover.current) nav.openedByHover.current = false;
          else nav.select(menu.open ? null : menu.value);
        }}
      />
    );
  },
);
HeaderMenuTrigger.displayName = "HeaderMenuTrigger";

export interface HeaderMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns of links (e.g. 2 for product cards); collapsed, always 1. */
  columns?: number;
}

/** The menu's links, centered under its trigger. Rendered only while its menu is open. */
export const HeaderMenuContent = forwardRef<HTMLDivElement, HeaderMenuContentProps>(
  ({ columns = 1, className, style, children, ...props }, ref) => {
    const header = useHeader("HeaderMenuContent");
    const menu = useMenu("HeaderMenuContent");
    if (!menu.open) return null;
    return (
      <div
        {...props}
        ref={ref}
        id={menu.contentId}
        data-slot="header-content"
        data-state="open"
        data-orientation={header.orientation}
        style={{ "--prism-header-columns": columns, ...style } as CSSProperties}
        className={slotClass(slots, "content", {}, className)}
      >
        <div data-slot="header-panel" data-orientation={header.orientation} className={slotClass(slots, "panel", {})}>
          {children}
        </div>
      </div>
    );
  },
);
HeaderMenuContent.displayName = "HeaderMenuContent";

/** The link's contents: plain, or media beside a title and description (a product card). */
function linkContent(children: ReactNode, image: ReactNode, description: ReactNode) {
  if (image == null && description == null) return children;
  return (
    <>
      {image != null && <span data-part="media">{image}</span>}
      <span data-part="body">
        <span data-part="title">{children}</span>
        {description != null && <span data-part="description">{description}</span>}
      </span>
    </>
  );
}

export interface HeaderLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render your own link (e.g. Next.js `Link`) instead of an `<a>`. */
  asChild?: boolean;
  /** Marks the link as the current page (`aria-current="page"`). */
  active?: boolean;
  /** A line under the title, for richer menu entries (products, docs). */
  description?: ReactNode;
  /** An image beside the title (a product shot); decorative, so give it `alt=""`. */
  image?: ReactNode;
}

/** A navigation link; following it closes the open menu and the collapsed panel. */
export const HeaderLink = forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ asChild = false, active = false, description, image, className, children, onClick, ...props }, ref) => {
    const header = useHeader("HeaderLink");
    const nav = useContext(NavContext);
    const shared = {
      ...props,
      "aria-current": active ? ("page" as const) : props["aria-current"],
      "data-slot": "header-link",
      className: slotClass(slots, "link", {}, className),
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        nav?.select(null);
        header.setOpen(false);
      },
    };
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ children?: ReactNode }>;
      return (
        <Slot {...(shared as HTMLAttributes<HTMLElement>)} ref={ref as never}>
          {cloneElement(child, {}, linkContent(child.props.children, image, description))}
        </Slot>
      );
    }
    return (
      <a {...shared} ref={ref}>
        {linkContent(children, image, description)}
      </a>
    );
  },
);
HeaderLink.displayName = "HeaderLink";

export type HeaderActionsProps = HTMLAttributes<HTMLDivElement>;

/** Buttons at the end of the header (sign in, theme toggle). Not collapsed. */
export const HeaderActions = forwardRef<HTMLDivElement, HeaderActionsProps>(({ className, ...props }, ref) => (
  <div {...props} ref={ref} data-slot="header-actions" className={slotClass(slots, "actions", {}, className)} />
));
HeaderActions.displayName = "HeaderActions";

export interface HeaderToggleProps extends Omit<IconButtonProps, "aria-label"> {
  "aria-label"?: string;
}

/** Slides the collapsed navigation in; hidden while the nav fits. */
export const HeaderToggle = forwardRef<HTMLButtonElement, HeaderToggleProps>(
  ({ "aria-label": label = "Menu", variant = "primary", className, children, onClick, ...props }, ref) => {
    const header = useHeader("HeaderToggle");
    const composedRef = useComposedRefs(ref, header.toggleRef);
    return (
      <IconButton
        data-slot="header-toggle"
        {...props}
        ref={composedRef}
        variant={variant}
        aria-label={label}
        aria-expanded={header.open}
        aria-controls={header.navId}
        hidden={header.orientation === "horizontal"}
        className={slotClass(slots, "toggle", {}, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) header.setOpen(!header.open);
        }}
      >
        {children ?? (
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
          </svg>
        )}
      </IconButton>
    );
  },
);
HeaderToggle.displayName = "HeaderToggle";
