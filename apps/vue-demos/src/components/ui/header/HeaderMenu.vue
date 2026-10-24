<script setup lang="ts">
import { computed, normalizeClass, onBeforeUnmount, provide, ref, useAttrs, useId, watch } from "vue";
import { onDismiss, slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { MenuKey, useHeader, useNav } from "./context";

export interface HeaderMenuProps {
  /** Identifies the menu for `HeaderNav`'s `value`; generated when omitted. */
  value?: string;
}

/**
 * A top-level entry that discloses a group of links (the APG disclosure
 * navigation pattern: a button, not an ARIA menu). A mouse opens it by
 * hovering; a click, Enter or Space opens it too. Escape, an outside click
 * or tabbing past it closes it.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderMenuProps>(), { value: undefined });

const attrs = useAttrs();
const header = useHeader("HeaderMenu");
const nav = useNav("HeaderMenu");
const generated = useId();
const value = props.value ?? generated;
const open = computed(() => nav.value.value === value);
const itemEl = ref<HTMLLIElement | null>(null);
const triggerEl = ref<HTMLElement | null>(null);

provide(MenuKey, { value, open, contentId: `${generated}-header-content`, triggerEl });

let stop: (() => void) | undefined;
watch(
  open,
  (isOpen) => {
    stop?.();
    stop = undefined;
    const item = itemEl.value;
    if (!isOpen || !item) return;
    stop = onDismiss({
      inside: () => [item],
      onDismiss: (reason) => {
        nav.select(null);
        if (reason === "escape") triggerEl.value?.focus();
      },
    });
  },
  { flush: "post", immediate: true },
);
onBeforeUnmount(() => stop?.());

function onPointerenter(event: PointerEvent) {
  if (event.pointerType === "mouse") nav.hoverOpen(value);
}
function onFocusout(event: FocusEvent) {
  // Tabbing past the menu closes it; focus leaving the page doesn't
  const next = event.relatedTarget as Node | null;
  if (open.value && next && !itemEl.value?.contains(next)) nav.select(null);
}

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "header-item",
    "data-state": open.value ? "open" : "closed",
    "data-orientation": header.orientation.value,
    class: slotClass(slots, "item", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <li ref="itemEl" v-bind="rootAttrs()" @pointerenter="onPointerenter" @focusout="onFocusout">
    <slot />
  </li>
</template>
