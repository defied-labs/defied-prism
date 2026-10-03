import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { Slot, useComposedRefs, useControllableState, usePresence } from "@defied-prism/react";
import {
  hideOthers,
  lockScroll,
  onDismiss,
  slotClass,
  trapFocus,
  variantData,
  type StyleSlots,
} from "@defied-prism/core";
import { Button, type ButtonProps } from "./Button";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  setHasTitle: (value: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawer(part: string): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) throw new Error(`<${part}> must be used inside <Drawer>.`);
  return context;
}

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function Drawer({ open: openProp, defaultOpen = false, onOpenChange, children }: DrawerProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const id = useId();

  return (
    <DrawerContext.Provider
      value={{
        open,
        setOpen,
        contentId: `${id}-content`,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
        hasTitle,
        setHasTitle,
        hasDescription,
        setHasDescription,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

interface TriggerProps extends ButtonProps {
  /** Render your own element (a link, an icon, a menu item) instead of a Prism Button. */
  asChild?: boolean;
}

function renderButton(
  asChild: boolean,
  ref: Ref<HTMLButtonElement>,
  props: ButtonProps,
  children: ReactNode,
  defaults: { variant: ButtonProps["variant"]; slot: string },
) {
  if (asChild) {
    // Button's visual props mean nothing on the consumer's element
    const rest: Record<string, unknown> = { ...props };
    for (const key of ["variant", "size", "fullWidth", "loading"] as const) delete rest[key];
    return (
      <Slot ref={ref as Ref<HTMLElement>} {...(rest as HTMLAttributes<HTMLElement>)}>
        {children as ReactElement}
      </Slot>
    );
  }
  return (
    <Button variant={defaults.variant} data-slot={defaults.slot} {...props} ref={ref}>
      {children}
    </Button>
  );
}

export const DrawerTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { open, setOpen, contentId } = useDrawer("DrawerTrigger");
    return renderButton(
      asChild,
      ref,
      {
        ...props,
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-controls": open ? contentId : undefined,
        "data-state": open ? "open" : "closed",
        onClick: (event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        },
      } as ButtonProps,
      children,
      { variant: "outline", slot: "drawer-trigger" },
    );
  },
);
DrawerTrigger.displayName = "DrawerTrigger";

export interface DrawerContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  /** Edge of the viewport the drawer slides from. */
  side?: "left" | "right" | "top" | "bottom";
  /** Width (left/right) or height (top/bottom). */
  size?: "sm" | "md" | "lg" | "full";
  /** Close when clicking outside (default true). */
  closeOnOutsideClick?: boolean;
  /** Close on Escape (default true). */
  closeOnEscape?: boolean;
  /** Element to focus on open; defaults to the first focusable element. */
  initialFocus?: () => HTMLElement | null;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  (
    {
      side = "right",
      size = "md",
      closeOnOutsideClick = true,
      closeOnEscape = true,
      initialFocus,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const drawer = useDrawer("DrawerContent");
    const contentRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, contentRef);
    const variants = { side, size };

    const setOpenRef = useRef(drawer.setOpen);
    setOpenRef.current = drawer.setOpen;
    const initialFocusRef = useRef(initialFocus);
    initialFocusRef.current = initialFocus;

    useEffect(() => {
      const content = contentRef.current;
      const portal = portalRef.current;
      if (!drawer.open || !content || !portal) return;

      const cleanups = [
        lockScroll(),
        hideOthers(portal),
        onDismiss({
          inside: () => [content],
          escape: closeOnEscape,
          outside: closeOnOutsideClick,
          onDismiss: () => setOpenRef.current(false),
        }),
        // Last, so focus moves in after the rest of the page is inert
        trapFocus(content, { initialFocus: initialFocusRef.current?.() }),
      ];
      return () => {
        for (const cleanup of cleanups.reverse()) cleanup();
      };
    }, [drawer.open, closeOnEscape, closeOnOutsideClick]);

    // Stays mounted, data-state="closed", while the exit animation plays
    const { present, state } = usePresence(drawer.open, contentRef);
    if (!present || typeof document === "undefined") return null;

    return createPortal(
      <div ref={portalRef}>
        <div
          aria-hidden="true"
          data-state={state}
          data-slot="drawer-overlay"
          {...variantData(variants)}
          className={slotClass(slots, "overlay", variants)}
        />
        <div
          {...props}
          ref={composedRef}
          id={drawer.contentId}
          role="dialog"
          aria-modal={drawer.open ? "true" : undefined}
          aria-labelledby={drawer.hasTitle && !props["aria-label"] ? drawer.titleId : undefined}
          aria-describedby={drawer.hasDescription ? drawer.descriptionId : undefined}
          tabIndex={-1}
          data-state={state}
          data-slot="drawer-content"
          {...variantData(variants)}
          className={slotClass(slots, "content", variants, className)}
        >
          {children}
        </div>
      </div>,
      document.body,
    );
  },
);
DrawerContent.displayName = "DrawerContent";

export const DrawerTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId, setHasTitle } = useDrawer("DrawerTitle");
    useEffect(() => {
      setHasTitle(true);
      return () => setHasTitle(false);
    }, [setHasTitle]);
    return (
      <h2
        {...props}
        ref={ref}
        id={titleId}
        data-slot="drawer-title"
        className={slotClass(slots, "title", {}, className)}
      />
    );
  },
);
DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId, setHasDescription } = useDrawer("DrawerDescription");
    useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return (
      <p
        {...props}
        ref={ref}
        id={descriptionId}
        data-slot="drawer-description"
        className={slotClass(slots, "description", {}, className)}
      />
    );
  },
);
DrawerDescription.displayName = "DrawerDescription";

export const DrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="drawer-footer"
      className={slotClass(slots, "footer", {}, className)}
    />
  ),
);
DrawerFooter.displayName = "DrawerFooter";

export const DrawerClose = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { setOpen } = useDrawer("DrawerClose");
    return renderButton(
      asChild,
      ref,
      {
        ...props,
        onClick: (event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        },
      },
      children,
      { variant: "secondary", slot: "drawer-close" },
    );
  },
);
DrawerClose.displayName = "DrawerClose";
