<script setup lang="ts">
import { inject, normalizeClass, ref, useAttrs, useId } from "vue";
import { useCollectionItem } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { ComboboxEvents } from "@defied/prism-core/components/combobox";
import { GroupContext, useComboboxContext } from "./context";
import { slots } from "./styles";

export interface ComboboxItemProps {
  value: string;
  disabled?: boolean;
  /** Text for filtering and the input; defaults to the item's text content. */
  textValue?: string;
}

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ComboboxItemProps>(), { disabled: false, textValue: undefined });

const attrs = useAttrs();
const ctx = useComboboxContext("ComboboxItem");
const groupId = inject(GroupContext, null)?.id ?? null;
const generatedId = useId();
const id = () => (attrs.id as string | undefined) ?? generatedId;
const nodeRef = ref<HTMLElement | null>(null);
useCollectionItem(
  ctx.collection,
  () => ({
    id: id(),
    value: props.value,
    disabled: props.disabled,
    textValue: props.textValue,
    groupId,
  }),
  nodeRef,
);

const isHighlighted = () => ctx.highlighted.value === props.value;

// The consumer's listeners (in attrs) run first; respect their preventDefault.
// Keep focus in the input while clicking an item.
function onMouseDown(event: MouseEvent) {
  event.preventDefault();
}

function onPointerMove(event: PointerEvent) {
  if (!event.defaultPrevented && !props.disabled && !isHighlighted()) {
    ctx.send(ComboboxEvents.highlight(props.value));
  }
}

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || props.disabled) return;
  ctx.choose(ctx.visible.value.find((item) => item.value === props.value));
}

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    id: id(),
    role: "option",
    hidden: !ctx.visibleValues.value.has(props.value),
    "aria-selected": ctx.selected.value === props.value,
    "aria-disabled": props.disabled || undefined,
    "data-highlighted": isHighlighted() ? "" : undefined,
    "data-slot": "combobox-option",
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
