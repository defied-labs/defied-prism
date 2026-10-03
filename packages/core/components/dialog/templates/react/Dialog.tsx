import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type MutableRefObject,
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
  zoomOriginVars,
  type StyleSlots,
} from "@defied-prism/core";
import { Button, type ButtonProps } from "./Button";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The DialogTrigger that last opened the dialog; the content grows out of it. */
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  setHasTitle: (value: boolean) => void;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog(part: string): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) throw new Error(`<${part}> must be used inside <Dialog>.`);
  return context;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const id = useId();

  return (
    <DialogContext.Provider
      value={{
        open,
        setOpen,
        triggerRef,
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
    </DialogContext.Provider>
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

export const DialogTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef, contentId } = useDialog("DialogTrigger");
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
          if (event.defaultPrevented) return;
          if (!open) triggerRef.current = event.currentTarget;
          setOpen(!open);
        },
      } as ButtonProps,
      children,
      { variant: "outline", slot: "dialog-trigger" },
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Use "alertdialog" for confirmations that interrupt the user. */
  role?: "dialog" | "alertdialog";
  /** Close when clicking outside (default: true for dialog, false for alertdialog). */
  closeOnOutsideClick?: boolean;
  /** Close on Escape (default true). */
  closeOnEscape?: boolean;
  /** Element to focus on open; defaults to the first focusable element. */
  initialFocus?: () => HTMLElement | null;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      size = "md",
      role = "dialog",
      closeOnOutsideClick = role !== "alertdialog",
      closeOnEscape = true,
      initialFocus,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const dialog = useDialog("DialogContent");
    const contentRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, contentRef);
    const variants = { size };

    const setOpenRef = useRef(dialog.setOpen);
    setOpenRef.current = dialog.setOpen;
    const initialFocusRef = useRef(initialFocus);
    initialFocusRef.current = initialFocus;

    useEffect(() => {
      const content = contentRef.current;
      const portal = portalRef.current;
      if (!dialog.open || !content || !portal) return;

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
    }, [dialog.open, closeOnEscape, closeOnOutsideClick]);

    // Grow out of whatever opened the dialog: the trigger, else the focused
    // element (controlled opens). Captured once per open, shrinks back into it.
    const originRef = useRef<Record<string, string> | null>(null);
    if (dialog.open && !originRef.current && typeof document !== "undefined") {
      originRef.current = zoomOriginVars(dialog.triggerRef.current ?? document.activeElement);
      dialog.triggerRef.current = null;
    }
    // Stays mounted, data-state="closed", while the exit animation plays
    const { present, state } = usePresence(dialog.open, contentRef);
    if (!present) originRef.current = null;
    if (!present || typeof document === "undefined") return null;

    return createPortal(
      <div ref={portalRef}>
        <div
          aria-hidden="true"
          data-state={state}
          data-slot="dialog-overlay"
          {...variantData(variants)}
          className={slotClass(slots, "overlay", variants)}
        />
        <div
          {...props}
          ref={composedRef}
          id={dialog.contentId}
          role={role}
          aria-modal={dialog.open ? "true" : undefined}
          aria-labelledby={dialog.hasTitle && !props["aria-label"] ? dialog.titleId : undefined}
          aria-describedby={dialog.hasDescription ? dialog.descriptionId : undefined}
          tabIndex={-1}
          style={{ ...originRef.current, ...style } as CSSProperties}
          data-state={state}
          data-slot="dialog-content"
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
DialogContent.displayName = "DialogContent";

export const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId, setHasTitle } = useDialog("DialogTitle");
    useEffect(() => {
      setHasTitle(true);
      return () => setHasTitle(false);
    }, [setHasTitle]);
    return (
      <h2
        {...props}
        ref={ref}
        id={titleId}
        data-slot="dialog-title"
        className={slotClass(slots, "title", {}, className)}
      />
    );
  },
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId, setHasDescription } = useDialog("DialogDescription");
    useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return (
      <p
        {...props}
        ref={ref}
        id={descriptionId}
        data-slot="dialog-description"
        className={slotClass(slots, "description", {}, className)}
      />
    );
  },
);
DialogDescription.displayName = "DialogDescription";

export const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-slot="dialog-footer"
      className={slotClass(slots, "footer", {}, className)}
    />
  ),
);
DialogFooter.displayName = "DialogFooter";

export const DialogClose = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ asChild = false, children, onClick, ...props }, ref) => {
    const { setOpen } = useDialog("DialogClose");
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
      { variant: "secondary", slot: "dialog-close" },
    );
  },
);
DialogClose.displayName = "DialogClose";
