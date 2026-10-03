import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type HTMLAttributes,
  type RefObject,
} from "react";
import { onDismiss, slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { usePresence } from "@defied-prism/react";
import {
  createToastStore,
  withLeaving,
  type Toast as ToastData,
  type ToastOptions,
  type ToastStore,
} from "@defied-prism/core/components/toast";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

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
    // Dismissed toasts stay rendered until their exit animation ends
    const [rendered, setRendered] = useState(visible);
    const [seen, setSeen] = useState(visible);
    if (seen !== visible) {
      setSeen(visible);
      setRendered(withLeaving(rendered, visible));
    }
    const onExited = useCallback(
      (id: string) => {
        const shown = store.getSnapshot().visible;
        setRendered((list) => list.filter((t) => t.id !== id || shown.some((s) => s.id === id)));
      },
      [store],
    );

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
        {rendered.map((item) => (
          <ToastItem
            key={item.id}
            toast={item}
            open={visible.some((t) => t.id === item.id)}
            onExited={onExited}
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
  /** False once dismissed: the toast plays its exit animation, then calls onExited. */
  open: boolean;
  onExited: (id: string) => void;
  store: ToastStore;
  position: Position;
  dismissLabel: string;
  /** Where focus came from when it entered the region. */
  returnFocus: RefObject<HTMLElement | null>;
}

function ToastItem({ toast: item, open, onExited, store, position, dismissLabel, returnFocus }: ToastItemProps) {
  const variants = { position, status: item.status };
  const slot = (name: string) => ({
    "data-slot": `toast-${name}`,
    ...variantData(variants),
    className: slotClass(slots, name, variants),
  });
  const node = useRef<HTMLDivElement>(null);
  const { present, state } = usePresence(open, node);
  useEffect(() => {
    if (!present) onExited(item.id);
  }, [present, item.id, onExited]);

  const dismiss = () => {
    const el = node.current;
    if (el?.contains(document.activeElement)) {
      // Keep keyboard users in the toasts: a neighbour, else where they came from
      const neighbour = siblingToast(el);
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

  if (!present) return null;
  const countdown = Number.isFinite(item.duration) && item.duration > 0;

  return (
    <div {...slot("item")} ref={node} data-state={state}>
      <div
        // Danger is time-sensitive (assertive); everything else is polite
        role={item.status === "danger" ? "alert" : "status"}
        aria-atomic="true"
        {...slot("toast")}
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
        {countdown && (
          <div
            // Restarts when an update changes the duration
            key={item.duration}
            aria-hidden="true"
            {...slot("progress")}
            style={{
              animationDuration: `${item.duration}ms`,
              animationPlayState: !open || item.pausedBy.length > 0 ? "paused" : "running",
            }}
          />
        )}
      </div>
    </div>
  );
}

/** The nearest toast that is not leaving: the next one, else the previous. */
function siblingToast(el: HTMLElement): HTMLElement | null {
  const live = (node: Element | null, step: (node: Element) => Element | null) => {
    while (node?.getAttribute("data-state") === "closed") node = step(node);
    return node as HTMLElement | null;
  };
  return (
    live(el.nextElementSibling, (n) => n.nextElementSibling) ??
    live(el.previousElementSibling, (n) => n.previousElementSibling)
  );
}
