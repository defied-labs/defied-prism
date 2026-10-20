<script setup lang="ts">
import { inject, normalizeClass, ref, useAttrs, useId } from "vue";
import { useCollectionItem } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { slots } from "./styles";
import { callListener, CommandGroupKey, usePalette, withoutListeners } from "./context";

export interface CommandItemProps {
  value: string;
  /** Searchable text; defaults to the rendered text content. */
  textValue?: string;
  /** Extra search terms (aliases, descriptions). */
  keywords?: readonly string[];
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<CommandItemProps>(), {
  textValue: undefined,
  keywords: undefined,
  disabled: false,
});
/** `select` runs when this command is chosen, before the palette's `select`. */
const emit = defineEmits<{ select: [] }>();

const attrs = useAttrs();
const ctx = usePalette("CommandItem");
const group = inject(CommandGroupKey, undefined);
const id = useId();
const nodeRef = ref<HTMLElement | null>(null);
const run = () => emit("select");

// Text is remembered by value while the item is filtered out (not rendered)
useCollectionItem(
  ctx.collection,
  () => ({
    id,
    value: props.value,
    textValue: props.textValue,
    keywords: props.keywords,
    disabled: props.disabled,
    group,
    run,
  }),
  nodeRef,
);

const isHighlighted = () => ctx.highlightedId.value === id;

// Keep focus in the input while clicking
function onMouseDown(event: MouseEvent) {
  callListener(attrs, "mousedown", event);
  event.preventDefault();
}

function onPointerMove(event: PointerEvent) {
  callListener(attrs, "pointermove", event);
  if (!event.defaultPrevented && !props.disabled && !isHighlighted()) ctx.setHighlighted(id);
}

function onClick(event: MouseEvent) {
  callListener(attrs, "click", event);
  if (!event.defaultPrevented) ctx.choose(id);
}

const rootAttrs = () => {
  const { class: className, ...rest } = withoutListeners(attrs, ["click", "pointermove", "mousedown"]);
  const variants = ctx.variants.value;
  const highlighted = isHighlighted();
  return {
    ...rest,
    id,
    role: "option",
    "aria-selected": highlighted ? ("true" as const) : ("false" as const),
    "aria-disabled": props.disabled || undefined,
    "data-highlighted": highlighted ? "" : undefined,
    "data-value": props.value,
    "data-slot": "command-palette-item",
    ...variantData(variants),
    class: slotClass(slots, "item", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div
    v-if="ctx.isItemVisible(id)"
    ref="nodeRef"
    v-bind="rootAttrs()"
    @mousedown="onMouseDown"
    @pointermove="onPointerMove"
    @click="onClick"
  >
    <slot />
  </div>
</template>
