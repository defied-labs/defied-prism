import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Slot, useComposedRefs, useControllableState, usePresence } from "@defied/prism-react";
import { getFocusable, onDismiss, slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import { Button, type ButtonProps } from "./Button";
import { tailwindSlots } from "@defied/prism-core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "relative inline-flex",
    "variants": {}
  },
  "content": {
    "base": "absolute z-(--prism-z-dropdown) box-border [width:max-content] [max-width:20rem] p-prism-4 rounded-prism-md [border-width:1px] border-solid border-prism-border bg-prism-bg text-prism-fg shadow-prism-md font-prism-sans text-prism-sm leading-prism-normal [animation:prism-roll-in_var(--prism-duration-normal)_var(--prism-easing-emphasized)] data-[state=closed]:pointer-events-none data-[state=closed]:[animation:prism-roll-out_var(--prism-duration-fast)_var(--prism-easing-exit)_forwards] focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)]",
    "variants": {
      "side": {
        "top": "[bottom:100%] [left:var(--prism-popover-start)] [right:var(--prism-popover-end)] [translate:var(--prism-popover-shift)_0] mb-prism-2 [transform-origin:bottom] [--prism-roll-y:1] [--prism-roll-top:100%] [--prism-roll-bottom:0]",
        "bottom": "[top:100%] [left:var(--prism-popover-start)] [right:var(--prism-popover-end)] [translate:var(--prism-popover-shift)_0] mt-prism-2 [transform-origin:top]",
        "left": "[right:100%] [top:var(--prism-popover-start)] [bottom:var(--prism-popover-end)] [translate:0_var(--prism-popover-shift)] mr-prism-2 [transform-origin:top]",
        "right": "[left:100%] [top:var(--prism-popover-start)] [bottom:var(--prism-popover-end)] [translate:0_var(--prism-popover-shift)] ml-prism-2 [transform-origin:top]"
      },
      "align": {
        "start": "[--prism-popover-start:0] [--prism-popover-end:auto] [--prism-popover-shift:0%]",
        "center": "[--prism-popover-start:50%] [--prism-popover-end:auto] [--prism-popover-shift:-50%]",
        "end": "[--prism-popover-start:auto] [--prism-popover-end:0] [--prism-popover-shift:0%]"
      }
    }
  }
});

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerRef: MutableRefObject<HTMLElement | null>;
  rootRef: MutableRefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(part: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) throw new Error(`<${part}> must be used inside <Popover>.`);
  return context;
}

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Positioning root: the content is placed relative to it. */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ open: openProp, defaultOpen = false, onOpenChange, className, children, ...props }, ref) => {
    const [open, setOpen] = useControllableState({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const contentId = `${useId()}-popover`;
    const triggerRef = useRef<HTMLElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(ref, rootRef);

    return (
      <PopoverContext.Provider value={{ open, setOpen, contentId, triggerRef, rootRef }}>
        <div
          {...props}
          ref={composedRef}
          data-slot="popover"
          data-state={open ? "open" : "closed"}
          className={slotClass(slots, "root", {}, className)}
        >
          {children}
        </div>
      </PopoverContext.Provider>
    );
  },
);
Popover.displayName = "Popover";

export interface PopoverTriggerProps extends ButtonProps {
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

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { open, setOpen, contentId, triggerRef } = usePopover("PopoverTrigger");
    const composedRef = useComposedRefs<HTMLButtonElement>(
      ref,
      triggerRef as MutableRefObject<HTMLButtonElement | null>,
    );
    return renderButton(
      asChild,
      composedRef,
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
      { variant: "outline", slot: "popover-trigger" },
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** Element to focus on open; defaults to the first focusable element, then the content. */
  initialFocus?: () => HTMLElement | null;
}

/**
 * A non-modal dialog: focus moves in on open, but is not trapped and the
 * page stays interactive. Escape (focus returns to the trigger) and outside
 * clicks close it; only the topmost layer closes, so it nests in dialogs.
 */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ side = "bottom", align = "center", initialFocus, className, children, ...props }, ref) => {
    const popover = usePopover("PopoverContent");
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, contentRef);
    const variants = { side, align };
    // Lingers with data-state="closed" while the exit animation plays
    const { present, state } = usePresence(popover.open, contentRef);

    const setOpenRef = useRef(popover.setOpen);
    setOpenRef.current = popover.setOpen;
    const initialFocusRef = useRef(initialFocus);
    initialFocusRef.current = initialFocus;

    useEffect(() => {
      const content = contentRef.current;
      if (!popover.open || !content) return;
      const target = initialFocusRef.current?.() ?? getFocusable(content)[0] ?? content;
      target.focus();
      return onDismiss({
        inside: () => [content, popover.triggerRef.current],
        onDismiss: (reason) => {
          setOpenRef.current(false);
          if (reason === "escape") popover.triggerRef.current?.focus();
        },
      });
    }, [popover.open, popover.triggerRef]);

    if (!present) return null;

    return (
      <div
        {...props}
        ref={composedRef}
        id={popover.contentId}
        role="dialog"
        tabIndex={-1}
        data-state={state}
        data-slot="popover-content"
        {...variantData(variants)}
        className={slotClass(slots, "content", variants, className)}
      >
        {children}
      </div>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

/** Closes the popover and returns focus to the trigger. */
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { setOpen, triggerRef } = usePopover("PopoverClose");
    return renderButton(
      asChild,
      ref,
      {
        ...props,
        onClick: (event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          setOpen(false);
          triggerRef.current?.focus();
        },
      },
      children,
      { variant: "secondary", slot: "popover-close" },
    );
  },
);
PopoverClose.displayName = "PopoverClose";
