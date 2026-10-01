import { computed, shallowRef, toValue, watch, type MaybeRefOrGetter, type ShallowRef } from "vue";
import {
  createToastStore,
  type ToastOptions,
  type ToastSnapshot,
  type ToastStore,
} from "@defied-prism/core/components/toast";

/** The app-wide store behind `toast()` and the default `<Toaster>`. */
export const toastStore: ToastStore = createToastStore();

/** Show a toast; returns its id. `toast.dismiss(id?)` removes one or all. */
export function toast(options: ToastOptions): string {
  return toastStore.add(options);
}
toast.dismiss = (id?: string) => toastStore.dismiss(id);
toast.update = (id: string, options: Omit<ToastOptions, "id">) => toastStore.update(id, options);

/** Subscribe to a store's visible and queued toasts; unsubscribes with the scope. */
export function useToasts(
  store: MaybeRefOrGetter<ToastStore> = toastStore,
): Readonly<ShallowRef<ToastSnapshot>> {
  const snapshot = shallowRef<ToastSnapshot>(toValue(store).getSnapshot());
  watch(
    () => toValue(store),
    (current, _, onCleanup) => {
      snapshot.value = current.getSnapshot();
      onCleanup(current.subscribe(() => (snapshot.value = current.getSnapshot())));
    },
    { immediate: true, flush: "sync" },
  );
  return snapshot;
}

/** `const { toast, dismiss, toasts } = useToast()` */
export function useToast(store: MaybeRefOrGetter<ToastStore> = toastStore) {
  const snapshot = useToasts(store);
  const show = (options: ToastOptions) => toValue(store).add(options);
  const dismiss = (id?: string) => toValue(store).dismiss(id);
  return { toast: show, dismiss, toasts: computed(() => snapshot.value.visible) };
}

export { createToastStore };
