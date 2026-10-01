import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type HTMLAttributes,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from "react";
import { Slot, useMachine } from "@defied-prism/react";
import {
  isTooltipOpen,
  onDismiss,
  slotClass,
  variantData,
  type StyleSlots,
} from "@defied-prism/core";
import {
  TooltipEvents,
  tooltipMachineDefinition,
  type TooltipEvent,
} from "@defied-prism/core/components/tooltip";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

interface TooltipContextValue {
  open: boolean;
  contentId: string;
  send: (event: TooltipEvent) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltip(part: string): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (!context) throw new Error(`<${part}> must be used inside <Tooltip>.`);
  return context;
}

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Hover delay before showing, in ms (focus shows immediately). */
  openDelay?: number;
  /** Grace period before hiding, so the pointer can move into the tooltip. */
  closeDelay?: number;
  /** Start open (uncontrolled). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  (
    { openDelay = 500, closeDelay = 150, defaultOpen = false, onOpenChange, className, children, ...props },
    ref,
  ) => {
    const { status, send } = useMachine(() =>
      defaultOpen
        ? { ...tooltipMachineDefinition, initialState: { status: "open" as const, data: {} } }
        : tooltipMachineDefinition,
    );
    const open = isTooltipOpen(status);
    const contentId = useId();

    // The machine is pure; timers live in the adapter
    useEffect(() => {
      if (status !== "opening" && status !== "closing") return;
      const timer = setTimeout(
        () => send(TooltipEvents.delayElapsed()),
        status === "opening" ? openDelay : closeDelay,
      );
      return () => clearTimeout(timer);
    }, [status, openDelay, closeDelay, send]);

    // Escape closes the tooltip without closing a surrounding dialog
    useEffect(() => {
      if (!open) return;
      return onDismiss({
        inside: () => [],
        outside: false,
        onDismiss: () => send(TooltipEvents.escape()),
      });
    }, [open, send]);

    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const firstRender = useRef(true);
    useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      onOpenChangeRef.current?.(open);
    }, [open]);

    return (
      <TooltipContext.Provider value={{ open, contentId, send }}>
        <span
          {...props}
          ref={ref}
          data-slot="tooltip"
          data-state={open ? "open" : "closed"}
          className={slotClass(slots, "root", {}, className)}
        >
          {children}
        </span>
      </TooltipContext.Provider>
    );
  },
);
Tooltip.displayName = "Tooltip";

export interface TooltipTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render your own element (e.g. a Button) instead of a plain <button>. */
  asChild?: boolean;
}

export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ asChild = false, children, ...props }, ref) => {
    const { contentId, send } = useTooltip("TooltipTrigger");
    const triggerProps = {
      ...props,
      "aria-describedby": [props["aria-describedby"], contentId].filter(Boolean).join(" "),
      "data-slot": "tooltip-trigger",
      onPointerEnter: (event: PointerEvent<HTMLButtonElement>) => {
        props.onPointerEnter?.(event);
        send(TooltipEvents.pointerEnter());
      },
      onPointerLeave: (event: PointerEvent<HTMLButtonElement>) => {
        props.onPointerLeave?.(event);
        send(TooltipEvents.pointerLeave());
      },
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        props.onPointerDown?.(event);
        send(TooltipEvents.press());
      },
      onFocus: (event: FocusEvent<HTMLButtonElement>) => {
        props.onFocus?.(event);
        send(TooltipEvents.focus());
      },
      onBlur: (event: FocusEvent<HTMLButtonElement>) => {
        props.onBlur?.(event);
        send(TooltipEvents.blur());
      },
    };

    if (asChild) {
      return (
        <Slot ref={ref as Ref<HTMLElement>} {...(triggerProps as HTMLAttributes<HTMLElement>)}>
          {children as ReactElement}
        </Slot>
      );
    }
    return (
      <button type="button" {...triggerProps} ref={ref}>
        {children}
      </button>
    );
  },
);
TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps extends HTMLAttributes<HTMLSpanElement> {
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Always rendered (hidden when closed) so the trigger's aria-describedby
 * resolves for screen reader and keyboard users without hovering.
 */
export const TooltipContent = forwardRef<HTMLSpanElement, TooltipContentProps>(
  ({ side = "top", className, onPointerEnter, onPointerLeave, ...props }, ref) => {
    const { open, contentId, send } = useTooltip("TooltipContent");
    const variants = { side };

    return (
      <span
        {...props}
        ref={ref}
        id={contentId}
        role="tooltip"
        hidden={!open}
        data-state={open ? "open" : "closed"}
        data-slot="tooltip-content"
        {...variantData(variants)}
        className={slotClass(slots, "content", variants, className)}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          send(TooltipEvents.pointerEnter());
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          send(TooltipEvents.pointerLeave());
        }}
      />
    );
  },
);
TooltipContent.displayName = "TooltipContent";
