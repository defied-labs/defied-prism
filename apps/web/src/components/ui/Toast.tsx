import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type FocusEvent,
  type HTMLAttributes,
  type RefObject,
} from "react";
import { onDismiss, slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import {
  createToastStore,
  type Toast as ToastData,
  type ToastOptions,
  type ToastStore,
} from "@defied-prism/core/components/toast";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { tailwindSlots } from "@defied-prism/core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "fixed z-(--prism-z-toast) flex gap-prism-2 [width:max-content] [max-width:calc(100vw_-_2rem)] m-0 p-0 pointer-events-none font-prism-sans",
    "variants": {
      "position": {
        "top-start": "top-prism-4 [bottom:auto] [inset-inline-start:var(--prism-space-4)] [inset-inline-end:auto] [transform:none] [flex-direction:column-reverse]",
        "top-center": "top-prism-4 [bottom:auto] [inset-inline-start:50%] [inset-inline-end:auto] [transform:translateX(-50%)] [flex-direction:column-reverse]",
        "top-end": "top-prism-4 [bottom:auto] [inset-inline-start:auto] [inset-inline-end:var(--prism-space-4)] [transform:none] [flex-direction:column-reverse]",
        "bottom-start": "[top:auto] bottom-prism-4 [inset-inline-start:var(--prism-space-4)] [inset-inline-end:auto] [transform:none] flex-col",
        "bottom-center": "[top:auto] bottom-prism-4 [inset-inline-start:50%] [inset-inline-end:auto] [transform:translateX(-50%)] flex-col",
        "bottom-end": "[top:auto] bottom-prism-4 [inset-inline-start:auto] [inset-inline-end:var(--prism-space-4)] [transform:none] flex-col"
      }
    }
  },
  "toast": {
    "base": "flex items-start gap-prism-3 [width:22rem] max-w-full py-prism-3 px-prism-4 [border-width:1px] border-solid rounded-prism-lg shadow-prism-lg text-prism-sm leading-prism-normal [pointer-events:auto] [animation:prism-scale-in_var(--prism-duration-normal)_var(--prism-easing-emphasized)] focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)]",
    "variants": {
      "status": {
        "neutral": "bg-prism-neutral-bg text-prism-neutral-fg border-prism-neutral-border",
        "info": "bg-prism-info-bg text-prism-info-fg border-prism-info-border",
        "success": "bg-prism-success-bg text-prism-success-fg border-prism-success-border",
        "warning": "bg-prism-warning-bg text-prism-warning-fg border-prism-warning-border",
        "danger": "bg-prism-danger-bg text-prism-danger-fg border-prism-danger-border"
      }
    }
  },
  "content": {
    "base": "flex flex-col gap-prism-1 grow [min-width:0]",
    "variants": {}
  },
  "title": {
    "base": "font-prism-semibold leading-prism-tight",
    "variants": {}
  },
  "description": {
    "base": "text-inherit",
    "variants": {}
  },
  "action": {
    "base": "shrink-0",
    "variants": {}
  },
  "close": {
    "base": "shrink-0",
    "variants": {}
  }
});

export type { ToastData, ToastOptions, ToastStore };
export { createToastStore };

type Position = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";

/** The app-wide store behind `toast()` and the default `<Toaster>`. */
export const toastStore: ToastStore = createToastStore();

/** Show a toast; returns its id. `toast.dismiss(id?)` removes one or all. */
export function toast(options: ToastOptions): string {
  return toastStore.add(options);
}
toast.dismiss = (id?: string) => toastStore.dismiss(id);
toast.update = (id: string, options: Omit<ToastOptions, "id">) => toastStore.update(id, options);

const emptySnapshot = { visible: [], queued: [] };

/** Subscribe to a store's visible and queued toasts. */
export function useToasts(store: ToastStore = toastStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => emptySnapshot);
}

/** `const { toast, dismiss, toasts } = useToast()` */
export function useToast(store: ToastStore = toastStore) {
  const { visible } = useToasts(store);
  const show = useCallback((options: ToastOptions) => store.add(options), [store]);
  const dismiss = useCallback((id?: string) => store.dismiss(id), [store]);
  return { toast: show, dismiss, toasts: visible };
}

export interface ToasterProps extends HTMLAttributes<HTMLDivElement> {
  position?: Position;
  /** Maximum toasts visible at once; the rest wait in a queue. */
  max?: number;
  /** Accessible name of the region. */
  label?: string;
  /** Accessible name of each toast's dismiss button. */
  dismissLabel?: string;
  /** Defaults to the app-wide store used by `toast()`. */
  store?: ToastStore;
}

/**
 * Renders the toasts of a store in a labelled region. Render one per app.
 * Auto-dismiss timers live here; the store only describes them as data.
 */
export const Toaster = forwardRef<HTMLDivElement, ToasterProps>(
  (
    {
      position = "bottom-end",
      max,
      label = "Notifications",
      dismissLabel = "Dismiss notification",
      store = toastStore,
      className,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const { visible } = useToasts(store);
    const returnFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (max !== undefined) store.setMax(max);
    }, [max, store]);

    // Timers as data -> real timers. Rescheduled whenever the toasts change.
    useEffect(() => {
      const handles = store
        .getTimers()
        .map(({ id, delay }) => setTimeout(() => store.expire(id), delay));
      return () => handles.forEach(clearTimeout);
    }, [visible, store]);

    const variants = { position };
    return (
      <div
        role="region"
        aria-label={label}
        {...props}
        ref={ref}
        data-slot="toast"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
        onFocus={(event: FocusEvent<HTMLDivElement>) => {
          onFocus?.(event);
          const from = event.relatedTarget as HTMLElement | null;
          if (!event.currentTarget.contains(from)) returnFocus.current = from;
        }}
      >
        {visible.map((item) => (
          <ToastItem
            key={item.id}
            toast={item}
            store={store}
            position={position}
            dismissLabel={dismissLabel}
            returnFocus={returnFocus}
          />
        ))}
      </div>
    );
  },
);
Toaster.displayName = "Toaster";

interface ToastItemProps {
  toast: ToastData;
  store: ToastStore;
  position: Position;
  dismissLabel: string;
  /** Where focus came from when it entered the region. */
  returnFocus: RefObject<HTMLElement | null>;
}

function ToastItem({ toast: item, store, position, dismissLabel, returnFocus }: ToastItemProps) {
  const variants = { position, status: item.status };
  const slot = (name: string) => ({
    "data-slot": `toast-${name}`,
    ...variantData(variants),
    className: slotClass(slots, name, variants),
  });
  const node = useRef<HTMLDivElement>(null);
  const dismiss = () => {
    const el = node.current;
    if (el?.contains(document.activeElement)) {
      // Keep keyboard users in the toasts: a neighbour, else where they came from
      const neighbour = (el.nextElementSibling ?? el.previousElementSibling) as HTMLElement | null;
      const target = neighbour?.querySelector<HTMLElement>("button") ?? returnFocus.current;
      target?.focus();
    }
    store.dismiss(item.id);
  };
  const escapeLayer = useRef<(() => void) | null>(null);
  const releaseEscape = () => {
    escapeLayer.current?.();
    escapeLayer.current = null;
  };
  // Release the Escape layer if the toast leaves while focused
  useEffect(() => releaseEscape, []);

  return (
    <div
      // Danger is time-sensitive (assertive); everything else is polite
      role={item.status === "danger" ? "alert" : "status"}
      aria-atomic="true"
      {...slot("toast")}
      ref={node}
      onPointerEnter={() => store.pause(item.id, "hover")}
      onPointerLeave={() => store.resume(item.id, "hover")}
      onFocus={() => {
        store.pause(item.id, "focus");
        // While focus is inside, Escape dismisses this toast as the topmost
        // layer (without closing a surrounding dialog or popover)
        escapeLayer.current ??= onDismiss({ inside: () => [], outside: false, onDismiss: dismiss });
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          releaseEscape();
          store.resume(item.id, "focus");
        }
      }}
    >
      <div {...slot("content")}>
        {item.title && <div {...slot("title")}>{item.title}</div>}
        {item.description && <div {...slot("description")}>{item.description}</div>}
      </div>
      {item.action && (
        <Button
          variant="outline"
          size="sm"
          {...slot("action")}
          onClick={() => {
            item.action?.onClick?.();
            dismiss();
          }}
        >
          {item.action.label}
        </Button>
      )}
      <IconButton variant="ghost" size="sm" aria-label={dismissLabel} {...slot("close")} onClick={dismiss}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </IconButton>
    </div>
  );
}
