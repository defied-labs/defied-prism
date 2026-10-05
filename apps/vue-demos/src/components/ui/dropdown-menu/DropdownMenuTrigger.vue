<script setup lang="ts">
import { useAttrs, type ComponentPublicInstance } from "vue";
import { Slot } from "@defied-labs/prism-vue";
import { Button } from "../button";
import { useMenu, type DropdownMenuTriggerProps } from "./context";

/** The menu button. Enter, Space and ArrowDown open on the first item; ArrowUp on the last. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DropdownMenuTriggerProps>(), {
  asChild: false,
  variant: "outline",
  size: "md",
  type: "button",
});

const attrs = useAttrs();
const menu = useMenu("DropdownMenuTrigger");

function setTrigger(instance: Element | ComponentPublicInstance | null) {
  const el = instance && "$el" in instance ? (instance.$el as unknown) : instance;
  menu.triggerRef.value = el instanceof HTMLElement ? el : null;
}

// The consumer's listeners (in attrs) run first; respect their preventDefault.
// Enter and Space activate the button, which opens on the first item.
function onClick(event: MouseEvent) {
  if (event.defaultPrevented) return;
  menu.focusTarget.current = "first";
  menu.open.value = !menu.open.value;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    menu.focusTarget.current = event.key === "ArrowDown" ? "first" : "last";
    menu.open.value = true;
  }
}

// Read in the render, so state changes re-render the trigger
const triggerAttrs = () => ({
  id: menu.triggerId,
  ...attrs,
  "aria-haspopup": "menu",
  "aria-expanded": menu.open.value ? "true" : "false",
  "aria-controls": menu.open.value ? menu.contentId : undefined,
  "data-state": menu.open.value ? "open" : "closed",
});
</script>

<template>
  <Slot
    v-if="props.asChild"
    :ref="setTrigger"
    v-bind="triggerAttrs()"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <slot />
  </Slot>
  <Button
    v-else
    :ref="setTrigger"
    data-slot="dropdown-menu-trigger"
    v-bind="triggerAttrs()"
    :variant="props.variant"
    :size="props.size"
    :full-width="props.fullWidth"
    :loading="props.loading"
    :disabled="props.disabled"
    :type="props.type"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <slot />
  </Button>
</template>
