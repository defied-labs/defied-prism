<script setup lang="ts">
import { Comment, Fragment, Text, nextTick, normalizeClass, provide, ref, useAttrs, useSlots, type VNode } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { BreadcrumbKey, type BreadcrumbSize } from "./context";

export interface BreadcrumbProps {
  size?: BreadcrumbSize;
  /** Separator between items (decorative, hidden from assistive tech). Default "/"; the `separator` slot overrides it. */
  separator?: string;
  /** Collapse middle items behind an ellipsis button when there are more items than this. */
  maxItems?: number;
  /** Items kept before the ellipsis when collapsed (default 1). */
  itemsBeforeCollapse?: number;
  /** Items kept after the ellipsis when collapsed (default 1). */
  itemsAfterCollapse?: number;
  /** Accessible name of the ellipsis button; receives the number of hidden items. */
  expandLabel?: (hidden: number) => string;
}

/**
 * `<nav aria-label="Breadcrumb"><ol>`: pass `BreadcrumbItem`s in the default
 * slot; separators are inserted between them.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  size: "md",
  separator: "/",
  maxItems: undefined,
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 1,
  expandLabel: (hidden: number) => `Show ${hidden} more`,
});

const attrs = useAttrs();
const slotsIn = useSlots();
const variants = () => ({ size: props.size });
provide(BreadcrumbKey, variants);

const expanded = ref(false);
const listRef = ref<HTMLOListElement | null>(null);

/** Element children of the default slot, fragments (v-for) unwrapped. */
function elements(nodes: VNode[] | undefined): VNode[] {
  const out: VNode[] = [];
  for (const node of nodes ?? []) {
    if (node.type === Comment || node.type === Text) continue;
    if (node.type === Fragment) out.push(...elements(node.children as VNode[]));
    else out.push(node);
  }
  return out;
}

type Entry = { key: string; node: VNode; ellipsis?: undefined } | { key: string; ellipsis: number };

// Called in the render, so slot and state changes re-render the list
function entries(): Entry[] {
  const items = elements(slotsIn.default?.());
  const toEntry = (node: VNode, index: number): Entry => ({ key: `item-${String(node.key ?? index)}`, node });
  const { maxItems, itemsBeforeCollapse: before, itemsAfterCollapse: after } = props;
  const collapse =
    !expanded.value && maxItems !== undefined && items.length > maxItems && before + after < items.length;
  if (!collapse) return items.map(toEntry);
  return [
    ...items.slice(0, before).map(toEntry),
    { key: "__ellipsis", ellipsis: items.length - before - after },
    ...items.slice(items.length - after).map((node, i) => toEntry(node, items.length - after + i)),
  ];
}

// Move focus to the first revealed item so keyboard users continue from there
async function expand() {
  expanded.value = true;
  await nextTick();
  const revealed = listRef.value?.querySelectorAll<HTMLElement>('[data-slot="breadcrumb-item"]')[
    props.itemsBeforeCollapse
  ];
  revealed?.querySelector<HTMLElement>("a[href], button, [tabindex]")?.focus();
}

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "aria-label": (attrs["aria-label"] as string | undefined) ?? "Breadcrumb",
    "data-slot": "breadcrumb",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
const partAttrs = (slot: string) => ({
  "data-slot": `breadcrumb-${slot}`,
  ...variantData(variants()),
  class: slotClass(slots, slot, variants()),
});
</script>

<template>
  <nav v-bind="rootAttrs()">
    <ol ref="listRef" v-bind="partAttrs('list')">
      <template v-for="(entry, index) in entries()" :key="entry.key">
        <li v-if="index > 0" aria-hidden="true" v-bind="partAttrs('separator')">
          <slot name="separator">{{ props.separator }}</slot>
        </li>
        <li v-if="entry.ellipsis !== undefined" v-bind="partAttrs('item')">
          <button
            type="button"
            :aria-label="props.expandLabel(entry.ellipsis)"
            v-bind="partAttrs('ellipsis')"
            @click="expand"
          >
            <span aria-hidden="true">&hellip;</span>
          </button>
        </li>
        <component :is="entry.node" v-else />
      </template>
    </ol>
  </nav>
</template>
