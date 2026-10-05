export { default as Toaster } from "./Toaster.vue";
export type { ToasterProps } from "./Toaster.vue";
export { createToastStore, toast, toastStore, useToast, useToasts } from "./toast";
export type {
  Toast as ToastData,
  ToastOptions,
  ToastStore,
} from "@defied-labs/prism-core/components/toast";
