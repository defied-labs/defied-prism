<script setup lang="ts">
import { normalizeClass, normalizeStyle, ref, useAttrs, watch, watchEffect } from "vue";
import { nextIndex, slotClass, variantData } from "@defied/prism-core";
import { useTabs } from "./context";
import { slots } from "./styles";

/** The tablist: arrow keys (per orientation), Home and End move between tabs. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useTabs("TabList");
const listRef = ref<HTMLElement | null>(null);

type Box = { x: number; y: number; width: number; height: number };

/** A tab's box within the list, or null before layout (or in tests). */
function measure(list: HTMLElement | null, value: string | null | undefined): Box | null {
  if (!list || value == null) return null;
  const tab = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).find(
    (el) => el.dataset.value === value,
  );
  if (!tab || (!tab.offsetWidth && !tab.offsetHeight)) return null;
  return { x: tab.offsetLeft, y: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight };
}

const boxStyle = (box: Box) => ({
  width: `${box.width}px`,
  height: `${box.height}px`,
  transform: `translate(${box.x}px, ${box.y}px)`,
});

// Thumbs that slide between tabs: the selected indicator, and a subtle
// highlight that follows the pointer and returns to the selection
const hovered = ref<string | null>(null);
const boxes = ref<{ selected: Box | null; hovered: Box | null }>({ selected: null, hovered: null });
function update() {
  const list = listRef.value;
  const value = ctx.value.value;
  boxes.value = { selected: measure(list, value), hovered: measure(list, hovered.value ?? value) };
}
watch(() => [ctx.value.value, hovered.value, ctx.tabs.items.value] as const, update, {
  flush: "post",
  immediate: true,
});
watchEffect((onCleanup) => {
  const list = listRef.value;
  const view = list?.ownerDocument.defaultView;
  if (!list || !view || !("ResizeObserver" in view)) return;
  const observer = new view.ResizeObserver(update);
  observer.observe(list);
  ctx.tabs.items.value.forEach((tab) => tab.node && observer.observe(tab.node));
  onCleanup(() => observer.disconnect());
});

function onPointerOver(event: PointerEvent) {
  const tab = (event.target as Element).closest<HTMLButtonElement>('[role="tab"]');
  if (tab && !tab.disabled && tab.dataset.value) hovered.value = tab.dataset.value;
}
function onPointerLeave() {
  hovered.value = null;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  const tabs = ctx.tabs.items.value;
  const current = tabs.findIndex((tab) => tab.node !== null && tab.node === document.activeElement);
  if (current === -1) return;
  const next = nextIndex(event.key, current, tabs.length, {
    orientation: ctx.orientation.value,
    isDisabled: (i) => tabs[i]!.disabled,
  });
  if (next === null) return;
  event.preventDefault();
  const tab = tabs[next]!;
  tab.node?.focus();
  if (ctx.activationMode.value === "automatic") ctx.select(tab.value);
}

// Read in the render, so attribute changes re-render the list
const rootAttrs = () => {
  const { class: className, style, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    role: "tablist",
    "aria-orientation": ctx.orientation.value,
    "data-slot": "tabs-list",
    ...variantData(variants),
    class: slotClass(slots, "list", variants, normalizeClass(className)),
    // Once measured, the indicator replaces the selected tab's own styling
    style: boxes.value.selected
      ? [normalizeStyle(style), { "--prism-tabs-selected": "transparent" }]
      : style,
  };
};

const thumb = (name: string) => {
  const variants = ctx.variants.value;
  return {
    "aria-hidden": true as const,
    "data-slot": `tabs-${name}`,
    ...variantData(variants),
    class: slotClass(slots, name, variants),
  };
};
</script>

<template>
  <div
    ref="listRef"
    v-bind="rootAttrs()"
    @keydown="onKeyDown"
    @pointerover="onPointerOver"
    @pointerleave="onPointerLeave"
  >
    <span
      v-if="boxes.hovered"
      v-bind="thumb('highlight')"
      :data-state="hovered !== null ? 'open' : 'closed'"
      :style="boxStyle(boxes.hovered)"
    />
    <span v-if="boxes.selected" v-bind="thumb('indicator')" :style="boxStyle(boxes.selected)" />
    <slot />
  </div>
</template>
