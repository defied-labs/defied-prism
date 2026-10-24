<script setup lang="ts">
import { computed, nextTick, normalizeClass, onBeforeUnmount, provide, ref, useAttrs, watch } from "vue";
import { useControllableState } from "@defied/prism-vue";
import { slotClass } from "@defied/prism-core";
import { IconButton } from "../icon-button";
import { slots } from "./styles";
import { NavKey, useHeader } from "./context";

export interface HeaderNavProps {
  /** The open menu's `value`. */
  value?: string | null;
  defaultValue?: string | null;
  /** Names the close button of the collapsed nav. */
  closeLabel?: string;
}

/**
 * The navigation landmark and its list. One menu is open at a time, on a
 * single surface that moves from menu to menu; it stays open while the
 * pointer is anywhere over the nav. Collapsed, the nav is a full-screen
 * panel that `HeaderToggle` slides in.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderNavProps>(), {
  value: undefined,
  defaultValue: null,
  closeLabel: "Close menu",
});
const emit = defineEmits<{ "update:value": [value: string | null]; valueChange: [value: string | null] }>();

const attrs = useAttrs();
const header = useHeader("HeaderNav");
const value = useControllableState<string | null>({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onChange: (next) => {
    emit("update:value", next);
    emit("valueChange", next);
  },
});
const collapsed = computed(() => header.orientation.value === "vertical");
const openedByHover = { current: false };

function select(next: string | null) {
  openedByHover.current = false;
  value.value = next;
}

function hoverClose() {
  if (!collapsed.value && openedByHover.current && value.value !== null) select(null);
}

// Switching layouts, or closing the collapsed panel, closes its menus
watch([header.orientation, header.open], () => {
  if (value.value !== null) value.value = null;
});

provide(NavKey, {
  value: computed(() => value.value),
  select,
  openedByHover,
  hoverOpen: (next) => {
    if (collapsed.value || value.value === next) return;
    openedByHover.current = true;
    value.value = next;
  },
  hoverClose,
});

const navRef = (el: unknown) => {
  header.navEl.value = el instanceof HTMLElement ? el : null;
};

// Fit the shared surface to the open menu's panel, following it as it resizes
const viewportEl = ref<HTMLDivElement | null>(null);
let wasOpen = false;
let observer: ResizeObserver | undefined;
let frame = 0;
function fitViewport() {
  observer?.disconnect();
  cancelAnimationFrame(frame);
  const nav = header.navEl.value;
  const viewport = viewportEl.value;
  const panel = nav?.querySelector<HTMLElement>('[data-slot="header-panel"]');
  if (!nav || !viewport || !panel || collapsed.value) {
    wasOpen = false;
    return;
  }
  const place = () => {
    const outer = nav.getBoundingClientRect();
    const inner = panel.getBoundingClientRect();
    Object.assign(viewport.style, {
      left: `${inner.left - outer.left}px`,
      top: `${inner.top - outer.top}px`,
      width: `${inner.width}px`,
      height: `${inner.height}px`,
    });
  };
  // Opening from closed: appear in place; only moving between menus slides
  if (!wasOpen) viewport.style.transitionProperty = "opacity, scale, translate";
  place();
  wasOpen = true;
  frame = requestAnimationFrame(() => {
    viewport.style.transitionProperty = "";
  });
  if (typeof ResizeObserver === "function") {
    observer = new ResizeObserver(place);
    observer.observe(panel);
  }
}
watch([() => value.value, collapsed], () => nextTick(fitViewport), { flush: "post", immediate: true });
onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
});

function onPointerleave(event: PointerEvent) {
  if (event.pointerType === "mouse") hoverClose();
}

function close() {
  header.setOpen(false);
  header.toggleEl.value?.focus();
}

const listClass = () => slotClass(slots, "list", {});
const viewportClass = () => slotClass(slots, "viewport", {});
const closeClass = () => slotClass(slots, "close", {});

const navAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    id: header.navId,
    "aria-label": (rest["aria-label"] as string | undefined) ?? (rest["aria-labelledby"] ? undefined : "Main"),
    // Hidden while sliding out, so it can't be tabbed into. Present or absent:
    // Vue would render `inert="false"`, which still makes the nav inert
    inert: collapsed.value && !header.open.value ? true : undefined,
    "data-slot": "header-nav",
    "data-orientation": header.orientation.value,
    "data-state": collapsed.value ? (header.open.value ? "open" : "closed") : undefined,
    class: slotClass(slots, "nav", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <nav :ref="navRef" v-bind="navAttrs()" @pointerleave="onPointerleave">
    <!-- Before the list, so the menus paint over it -->
    <div
      ref="viewportEl"
      aria-hidden="true"
      data-slot="header-viewport"
      :data-state="value !== null && !collapsed ? 'open' : 'closed'"
      :data-orientation="header.orientation.value"
      :class="viewportClass()"
    />
    <ul data-slot="header-list" :data-orientation="header.orientation.value" :class="listClass()">
      <slot />
    </ul>
    <IconButton
      v-if="collapsed"
      data-slot="header-close"
      :aria-label="props.closeLabel"
      variant="primary"
      size="lg"
      :class="closeClass()"
      @click="close"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false">
        <path d="m4 4 8 8M12 4l-8 8" />
      </svg>
    </IconButton>
  </nav>
</template>
