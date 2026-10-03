/**
 * Framework-agnostic toast queue.
 *
 * The store owns ordering, the visible window (`max`), and auto-dismiss
 * bookkeeping. It never schedules timers itself: `getTimers(now)` returns
 * timers as data ({ id, delay }) and the adapter schedules them, calling
 * `expire(id, now)` when one fires. Time is always passed in, so the store
 * is pure and trivially testable.
 */

export type ToastStatus = "neutral" | "info" | "success" | "warning" | "danger";
export type PauseReason = "hover" | "focus" | (string & {});

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastOptions {
  /** Reuse an id to update an existing toast in place. */
  id?: string;
  title?: string;
  description?: string;
  status?: ToastStatus;
  /** Auto-dismiss delay in ms. `Infinity` (or <= 0) keeps it until dismissed. */
  duration?: number;
  action?: ToastAction;
}

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  status: ToastStatus;
  duration: number;
  action?: ToastAction;
  /** Auto-dismiss time left, in ms, as of `startedAt` (or while paused). */
  remaining: number;
  /** When the current countdown run started; null while paused or queued. */
  startedAt: number | null;
  /** Active pause reasons (hover, focus, ...). Paused while non-empty. */
  pausedBy: PauseReason[];
  visible: boolean;
}

export interface ToastSnapshot {
  /** Toasts on screen, oldest first. */
  visible: Toast[];
  /** Toasts waiting for a visible slot, oldest first. */
  queued: Toast[];
}

export interface ToastTimer {
  id: string;
  delay: number;
}

export interface ToastStoreOptions {
  /** Maximum simultaneously visible toasts (default 3). */
  max?: number;
  /** Default auto-dismiss duration in ms (default 5000). */
  duration?: number;
  now?: () => number;
}

export const DEFAULT_TOAST_DURATION = 5000;
export const DEFAULT_TOAST_MAX = 3;

const persistent = (duration: number) => !Number.isFinite(duration) || duration <= 0;

export interface ToastStore {
  add(options: ToastOptions, now?: number): string;
  update(id: string, options: Omit<ToastOptions, "id">, now?: number): void;
  /** Dismiss one toast, or every toast when `id` is omitted. */
  dismiss(id?: string, now?: number): void;
  /** A timer fired; dismisses the toast only if its time is really up. */
  expire(id: string, now?: number): void;
  pause(id: string, reason: PauseReason, now?: number): void;
  resume(id: string, reason: PauseReason, now?: number): void;
  setMax(max: number, now?: number): void;
  getMax(): number;
  getSnapshot(): ToastSnapshot;
  /** Pending auto-dismiss timers for running, visible toasts. */
  getTimers(now?: number): ToastTimer[];
  subscribe(listener: () => void): () => void;
}

export function createToastStore(options: ToastStoreOptions = {}): ToastStore {
  const clock = options.now ?? (() => Date.now());
  const defaultDuration = options.duration ?? DEFAULT_TOAST_DURATION;
  let max = Math.max(1, options.max ?? DEFAULT_TOAST_MAX);
  let toasts: Toast[] = [];
  let snapshot: ToastSnapshot = { visible: [], queued: [] };
  let counter = 0;
  const listeners = new Set<() => void>();

  const remainingAt = (toast: Toast, now: number) =>
    toast.startedAt === null ? toast.remaining : toast.remaining - (now - toast.startedAt);

  /** Recompute the visible window and start/stop countdowns accordingly. */
  function commit(now: number) {
    toasts = toasts.map((toast, index) => {
      const visible = index < max;
      const running = visible && toast.pausedBy.length === 0 && !persistent(toast.duration);
      const remaining = remainingAt(toast, now);
      if (running) {
        return toast.startedAt !== null && toast.visible
          ? toast
          : { ...toast, visible, remaining, startedAt: now };
      }
      if (toast.visible === visible && toast.startedAt === null) return toast;
      return { ...toast, visible, remaining, startedAt: null };
    });
    snapshot = { visible: toasts.slice(0, max), queued: toasts.slice(max) };
    for (const listener of [...listeners]) listener();
  }

  const find = (id: string) => toasts.findIndex((t) => t.id === id);

  const store: ToastStore = {
    add(opts, now = clock()) {
      if (opts.id && find(opts.id) !== -1) {
        const { id, ...rest } = opts;
        store.update(id, rest, now);
        return id;
      }
      const duration = opts.duration ?? defaultDuration;
      const id = opts.id ?? `toast-${++counter}`;
      toasts = [
        ...toasts,
        {
          id,
          title: opts.title,
          description: opts.description,
          status: opts.status ?? "neutral",
          action: opts.action,
          duration,
          remaining: duration,
          startedAt: null,
          pausedBy: [],
          visible: false,
        },
      ];
      commit(now);
      return id;
    },
    update(id, opts, now = clock()) {
      const index = find(id);
      if (index === -1) return;
      const current = toasts[index]!;
      const duration = opts.duration ?? current.duration;
      // A new duration restarts the countdown
      const restart = opts.duration !== undefined;
      toasts = toasts.map((t, i) =>
        i === index
          ? {
              ...t,
              ...opts,
              status: opts.status ?? t.status,
              duration,
              remaining: restart ? duration : t.remaining,
              startedAt: restart ? null : t.startedAt,
            }
          : t,
      );
      commit(now);
    },
    dismiss(id, now = clock()) {
      const next = id === undefined ? [] : toasts.filter((t) => t.id !== id);
      if (next.length === toasts.length) return;
      toasts = next;
      commit(now);
    },
    expire(id, now = clock()) {
      const toast = toasts[find(id)];
      if (!toast || !toast.visible || toast.startedAt === null) return;
      if (remainingAt(toast, now) <= 0) store.dismiss(id, now);
    },
    pause(id, reason, now = clock()) {
      const index = find(id);
      const toast = toasts[index];
      if (!toast || toast.pausedBy.includes(reason)) return;
      toasts = toasts.map((t, i) =>
        i === index
          ? { ...t, pausedBy: [...t.pausedBy, reason], remaining: remainingAt(t, now), startedAt: null }
          : t,
      );
      commit(now);
    },
    resume(id, reason, now = clock()) {
      const index = find(id);
      const toast = toasts[index];
      if (!toast || !toast.pausedBy.includes(reason)) return;
      toasts = toasts.map((t, i) =>
        i === index ? { ...t, pausedBy: t.pausedBy.filter((r) => r !== reason) } : t,
      );
      commit(now);
    },
    setMax(value, now = clock()) {
      const next = Math.max(1, Math.floor(value));
      if (next === max) return;
      max = next;
      commit(now);
    },
    getMax: () => max,
    getSnapshot: () => snapshot,
    getTimers(now = clock()) {
      return toasts
        .filter((t) => t.visible && t.startedAt !== null)
        .map((t) => ({ id: t.id, delay: Math.max(0, remainingAt(t, now)) }));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return store;
}

/**
 * The toasts a Toaster renders: the visible ones plus those that just left
 * and still play their exit animation, kept where they were so the stack
 * does not jump. `previous` is the last list this returned; drop a leaving
 * toast from it once its animation ends.
 */
export function withLeaving<T extends { id: string }>(previous: readonly T[], visible: readonly T[]): T[] {
  const ids = new Set(visible.map((t) => t.id));
  const next = [...visible];
  previous.forEach((toast, index) => {
    if (!ids.has(toast.id)) next.splice(Math.min(index, next.length), 0, toast);
  });
  return next;
}
