<script setup lang="ts">
import { normalizeClass, ref, useAttrs, useId } from "vue";
import { useCollectionItem } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { callListener, useSelectContext, withoutListeners } from "./context";
import { slots } from "./styles";

export interface SelectItemProps {
  value: string;
  disabled?: boolean;
  /** Text for typeahead and the trigger; defaults to the item's text content. */
  textValue?: string;
}

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<SelectItemProps>(), { disabled: false });

const attrs = useAttrs();
const ctx = useSelectContext("SelectItem");
const generatedId = useId();
const id = () => (attrs.id as string | undefined) ?? generatedId;
const nodeRef = ref<HTMLElement | null>(null);
useCollectionItem(
  ctx.collection,
  () => ({ id: id(), value: props.value, disabled: props.disabled, textValue: props.textValue }),
  nodeRef,
);

const isHighlighted = () => ctx.highlighted.value === props.value;

// Keep focus on the combobox while clicking an option
function onMouseDown(event: MouseEvent) {
  callListener(attrs, "mousedown", event);
  event.preventDefault();
}

function onPointerMove(event: PointerEvent) {
  callListener(attrs, "pointermove", event);
  if (!event.defaultPrevented && !props.disabled && !isHighlighted()) {
    ctx.setHighlighted(props.value);
  }
}

function onClick(event: MouseEvent) {
  callListener(attrs, "click", event);
  if (event.defaultPrevented || props.disabled) return;
  ctx.setValue(props.value);
  ctx.close();
}

const rootAttrs = () => {
  const { class: className, ...rest } = withoutListeners(attrs, [
    "click",
    "pointermove",
    "mousedown",
  ]);
  const variants = ctx.variants.value;
  return {
    ...rest,
    id: id(),
    role: "option",
    "aria-selected": ctx.value.value === props.value,
    "aria-disabled": props.disabled || undefined,
    "data-highlighted": isHighlighted() ? "" : undefined,
    "data-slot": "select-option",
    ...variantData(variants),
    class: slotClass(slots, "option", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div
    ref="nodeRef"
    v-bind="rootAttrs()"
    @mousedown="onMouseDown"
    @pointermove="onPointerMove"
    @click="onClick"
  >
    <slot />
  </div>
</template>
