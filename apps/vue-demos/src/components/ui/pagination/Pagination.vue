<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { useControllableState } from "@defied-labs/prism-vue";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { clampPage, paginationRange } from "@defied-labs/prism-core/components/pagination";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  /** Total number of pages. */
  count: number;
  /** Current page, 1-based (controlled, v-model:page). */
  page?: number;
  /** Initial page (uncontrolled, default 1). */
  defaultPage?: number;
  /** Pages shown on each side of the current page (default 1). */
  siblings?: number;
  /** Pages always shown at the start and end (default 1). */
  boundaries?: number;
  size?: "sm" | "md";
  /** Render pages as links to these URLs instead of buttons. */
  getHref?: (page: number) => string;
  /** Accessible name of a page control (default "Page N"). */
  getPageLabel?: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} }, "list": { base: styles["list"], variants: {} }, "item": { base: styles["item"], variants: {} }, "link": { base: styles["link"], variants: {} }, "previous": { base: styles["previous"], variants: {} }, "next": { base: styles["next"], variants: {} }, "ellipsis": { base: styles["ellipsis"], variants: {} } };

/** Visible content of the previous / next controls: the `previous` and `next` slots. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PaginationProps>(), {
  page: undefined,
  defaultPage: 1,
  siblings: 1,
  boundaries: 1,
  size: "md",
  getHref: undefined,
  getPageLabel: (page: number) => `Page ${page}`,
  previousLabel: "Previous page",
  nextLabel: "Next page",
});
const emit = defineEmits<{ "update:page": [page: number]; pageChange: [page: number] }>();

const attrs = useAttrs();
const rawPage = useControllableState({
  value: () => props.page,
  defaultValue: props.defaultPage,
  onChange: (next) => {
    emit("update:page", next);
    emit("pageChange", next);
  },
});
const current = () => clampPage(rawPage.value, props.count);
const variants = () => ({ size: props.size });
const items = () =>
  paginationRange({ page: current(), count: props.count, siblings: props.siblings, boundaries: props.boundaries });

function go(target: number) {
  const next = clampPage(target, props.count);
  if (next !== current()) rawPage.value = next;
}

type Kind = "link" | "previous" | "next";

function controlAttrs(kind: Kind, target: number, label: string, options: { current?: boolean; disabled?: boolean } = {}) {
  const common = {
    "aria-label": label,
    "aria-current": options.current ? "page" : undefined,
    "data-slot": `pagination-${kind}`,
    ...variantData(variants()),
    class: slotClass(slots, kind, variants()),
  };
  if (props.getHref) {
    // Links can't be disabled: drop the href so they stop being links
    if (options.disabled) return { ...common, role: "link", "aria-disabled": "true" };
    return {
      ...common,
      href: props.getHref(target),
      onClick: (event: MouseEvent) => {
        // Let modified clicks open new tabs; plain clicks update state too
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        go(target);
      },
    };
  }
  return { ...common, type: "button", disabled: options.disabled, onClick: () => go(target) };
}

const tag = () => (props.getHref ? "a" : "button");

// Read in the render, so attribute changes re-render the pager
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "aria-label": (attrs["aria-label"] as string | undefined) ?? "Pagination",
    "data-slot": "pagination",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
const partAttrs = (slot: "list" | "item" | "ellipsis") => ({
  "data-slot": `pagination-${slot}`,
  ...variantData(variants()),
  class: slotClass(slots, slot, variants()),
});
</script>

<template>
  <nav v-bind="rootAttrs()">
    <ul v-bind="partAttrs('list')">
      <li v-bind="partAttrs('item')">
        <component :is="tag()" v-bind="controlAttrs('previous', current() - 1, props.previousLabel, { disabled: current() <= 1 })">
          <slot name="previous"><span aria-hidden="true">‹</span></slot>
        </component>
      </li>
      <li v-for="item in items()" :key="item" v-bind="partAttrs('item')">
        <component
          :is="tag()"
          v-if="typeof item === 'number'"
          v-bind="controlAttrs('link', item, props.getPageLabel(item), { current: item === current() })"
        >
          {{ item }}
        </component>
        <span v-else aria-hidden="true" v-bind="partAttrs('ellipsis')">…</span>
      </li>
      <li v-bind="partAttrs('item')">
        <component :is="tag()" v-bind="controlAttrs('next', current() + 1, props.nextLabel, { disabled: current() >= props.count })">
          <slot name="next"><span aria-hidden="true">›</span></slot>
        </component>
      </li>
    </ul>
  </nav>
</template>
