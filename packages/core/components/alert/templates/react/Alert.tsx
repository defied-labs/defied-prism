import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
} from "react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { IconButton } from "./IconButton";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

type AlertVariants = { status: "neutral" | "info" | "success" | "warning" | "danger" };

const AlertContext = createContext<AlertVariants>({ status: "neutral" });

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  status?: AlertVariants["status"];
  /**
   * Live-region politeness. By default an alert is `role="status"` (polite):
   * static page messages aren't interruptive, and messages rendered later are
   * still announced. Set `urgent` for important, time-sensitive information
   * (`role="alert"`, assertive) per the APG alert pattern.
   */
  urgent?: boolean;
  /** Renders a dismiss button (after `children`) that calls this. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. */
  dismissLabel?: string;
}

/**
 * `<Alert status="warning"><AlertIcon>…</AlertIcon><AlertContent><AlertTitle>…
 * </AlertTitle><AlertDescription>…</AlertDescription></AlertContent></Alert>`
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { status = "neutral", urgent = false, onDismiss, dismissLabel = "Dismiss", className, children, ...props },
    ref,
  ) => {
    const variants = { status };
    return (
      <AlertContext.Provider value={variants}>
        <div
          role={urgent ? "alert" : "status"}
          {...props}
          ref={ref}
          data-slot="alert"
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          {children}
          {onDismiss && (
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={dismissLabel}
              data-slot="alert-close"
              {...variantData(variants)}
              className={slotClass(slots, "close", variants)}
              onClick={() => onDismiss()}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </IconButton>
          )}
        </div>
      </AlertContext.Provider>
    );
  },
);
Alert.displayName = "Alert";

/** Decorative icon, hidden from assistive technology. */
export const AlertIcon = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const variants = useContext(AlertContext);
    return (
      <span
        aria-hidden="true"
        {...props}
        ref={ref}
        data-slot="alert-icon"
        {...variantData(variants)}
        className={slotClass(slots, "icon", variants, className)}
      />
    );
  },
);
AlertIcon.displayName = "AlertIcon";

/** Wraps title and description so they stack next to the icon. */
export const AlertContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const variants = useContext(AlertContext);
    return (
      <div
        {...props}
        ref={ref}
        data-slot="alert-content"
        {...variantData(variants)}
        className={slotClass(slots, "content", variants, className)}
      />
    );
  },
);
AlertContent.displayName = "AlertContent";

export const AlertTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const variants = useContext(AlertContext);
    return (
      <div
        {...props}
        ref={ref}
        data-slot="alert-title"
        {...variantData(variants)}
        className={slotClass(slots, "title", variants, className)}
      />
    );
  },
);
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const variants = useContext(AlertContext);
    return (
      <div
        {...props}
        ref={ref}
        data-slot="alert-description"
        {...variantData(variants)}
        className={slotClass(slots, "description", variants, className)}
      />
    );
  },
);
AlertDescription.displayName = "AlertDescription";

/** Container for action buttons, placed after the content. */
export const AlertAction = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const variants = useContext(AlertContext);
    return (
      <div
        {...props}
        ref={ref}
        data-slot="alert-action"
        {...variantData(variants)}
        className={slotClass(slots, "action", variants, className)}
      />
    );
  },
);
AlertAction.displayName = "AlertAction";
