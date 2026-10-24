<script setup lang="ts">
import { computed, normalizeClass, onBeforeUnmount, onMounted, provide, ref, useAttrs, useId, watch } from "vue";
import { useControllableState } from "@defied/prism-vue";
import { lockScroll, onDismiss, slotClass, trapFocus, variantData } from "@defied/prism-core";
import { slots } from "./styles";
import { HeaderKey, type Orientation } from "./context";

export interface HeaderProps {
  variant?: "bar" | "floating";
  position?: "static" | "sticky" | "fixed";
  /** Viewport width (px) below which the navigation collapses behind `HeaderToggle`; 0 never collapses. */
  collapseBelow?: number;
  /** The collapsed navigation is shown. */
  open?: boolean;
  defaultOpen?: boolean;
}

/** The page's banner: brand, navigation and actions. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderProps>(), {
  variant: "bar",
  position: "sticky",
  collapseBelow: 768,
  open: undefined,
  defaultOpen: false,
});
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

const attrs = useAttrs();
const open = useControllableState({
  value: () => props.open,
  defaultValue: props.defaultOpen,
  onChange: (next) => {
    emit("update:open", next);
    emit("openChange", next);
  },
});

// Horizontal during SSR and the first render, so markup matches
const orientation = ref<Orientation>("horizontal");
let stopQuery: (() => void) | undefined;
function watchViewport(width: number) {
  stopQuery?.();
  stopQuery = undefined;
  if (width <= 0 || typeof window.matchMedia !== "function") {
    orientation.value = "horizontal";
    return;
  }
  const query = window.matchMedia(`(max-width: ${width - 0.02}px)`);
  const update = () => {
    orientation.value = query.matches ? "vertical" : "horizontal";
  };
  update();
  query.addEventListener("change", update);
  stopQuery = () => query.removeEventListener("change", update);
}
onMounted(() => watchViewport(props.collapseBelow));
watch(() => props.collapseBelow, watchViewport);

// Back to a full-width nav: there is no panel left to have open
watch(orientation, (next) => {
  if (next === "horizontal") open.value = false;
});

const panelOpen = computed(() => orientation.value === "vertical" && open.value);
const toggleEl = ref<HTMLElement | null>(null);
const navEl = ref<HTMLElement | null>(null);

// The collapsed nav covers the screen: modal while it is shown
let stopPanel: (() => void) | undefined;
watch(
  panelOpen,
  (isOpen) => {
    stopPanel?.();
    stopPanel = undefined;
    const nav = navEl.value;
    if (!isOpen || !nav) return;
    const unlock = lockScroll(nav.ownerDocument);
    const release = trapFocus(nav);
    const stop = onDismiss({
      inside: () => [nav, toggleEl.value],
      onDismiss: (reason) => {
        open.value = false;
        if (reason === "escape") toggleEl.value?.focus();
      },
    });
    stopPanel = () => {
      stop();
      release();
      unlock();
    };
  },
  { flush: "post" },
);
onBeforeUnmount(() => {
  stopQuery?.();
  stopPanel?.();
});

provide(HeaderKey, {
  orientation,
  open: panelOpen,
  setOpen: (next) => {
    open.value = next;
  },
  navId: `${useId()}-header-nav`,
  toggleEl,
  navEl,
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = { variant: props.variant, position: props.position };
  return {
    ...rest,
    "data-slot": "header",
    "data-state": panelOpen.value ? "open" : "closed",
    "data-orientation": orientation.value,
    ...variantData(variants),
    class: slotClass(slots, "root", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <header v-bind="rootAttrs()"><slot /></header>
</template>
