<script setup lang="ts">
import { normalizeClass, ref, useAttrs, useId } from "vue";
import { useCollectionItem } from "@defied-prism/vue";
import { slotClass } from "@defied-prism/core";
import { useMenu } from "./context";
import { slots } from "./styles";

export interface MenuItemImplProps {
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  styleSlot: "item" | "checkboxItem" | "radioItem";
  dataSlot: string;
  checked?: boolean;
  onActivate?: () => void;
  disabled?: boolean;
  textValue?: string;
}

/** Shared implementation of every menu item (internal). */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<MenuItemImplProps>(), {
  checked: undefined,
  onActivate: undefined,
  disabled: false,
  textValue: undefined,
});
const emit = defineEmits<{ select: [event: Event] }>();

const attrs = useAttrs();
const menu = useMenu("DropdownMenuItem");
const generatedId = useId();
const id = () => (attrs.id as string | undefined) ?? generatedId;
const nodeRef = ref<HTMLElement | null>(null);
const highlighted = ref(false);
useCollectionItem(
  menu.collection,
  () => ({ id: id(), value: id(), disabled: props.disabled, textValue: props.textValue }),
  nodeRef,
);

// The consumer's listeners (in attrs) run first; respect their preventDefault
function onClick(event: MouseEvent) {
  if (event.defaultPrevented || props.disabled) return;
  props.onActivate?.();
  const selectEvent = new Event("prism.menu.select", { cancelable: true });
  emit("select", selectEvent);
  if (!selectEvent.defaultPrevented && !menu.keepOpen.current) menu.close(true);
}

function onPointerMove(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement;
  if (!props.disabled && document.activeElement !== target) target.focus();
}

function onPointerLeave(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement;
  if (document.activeElement === target) target.closest<HTMLElement>('[role="menu"]')?.focus();
}

// Read in the render, so attribute and state changes re-render the item
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const checked = props.checked;
  return {
    ...rest,
    id: id(),
    role: props.role,
    tabindex: -1,
    "aria-disabled": props.disabled || undefined,
    "aria-checked": checked,
    "data-text-value": props.textValue,
    "data-state": checked === undefined ? undefined : checked ? "checked" : "unchecked",
    "data-highlighted": highlighted.value ? "" : undefined,
    "data-slot": props.dataSlot,
    class: slotClass(slots, props.styleSlot, {}, normalizeClass(className)),
  };
};
</script>

<template>
  <div
    ref="nodeRef"
    v-bind="rootAttrs()"
    @click="onClick"
    @focus="highlighted = true"
    @blur="highlighted = false"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <slot />
  </div>
</template>
