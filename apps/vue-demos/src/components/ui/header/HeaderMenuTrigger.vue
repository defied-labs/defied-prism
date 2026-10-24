<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, ref, useAttrs, watchEffect } from "vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { useHeader, useMenu, useNav } from "./context";

/** The menu's label, as plain text; opens and closes its `HeaderMenu`. */
defineOptions({ inheritAttrs: false });

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const header = useHeader("HeaderMenuTrigger");
const nav = useNav("HeaderMenuTrigger");
const menu = useMenu("HeaderMenuTrigger");

// Shared with the menu, so Escape can return focus here
const buttonEl = ref<HTMLButtonElement | null>(null);
watchEffect(() => {
  menu.triggerEl.value = buttonEl.value;
});
onBeforeUnmount(() => {
  menu.triggerEl.value = null;
});

function onClick(event: MouseEvent) {
  emit("click", event);
  if (event.defaultPrevented) return;
  // A click on a menu the pointer just opened keeps it open
  if (menu.open.value && nav.openedByHover.current) nav.openedByHover.current = false;
  else nav.select(menu.open.value ? null : menu.value);
}

const triggerAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    type: "button" as const,
    ...rest,
    "aria-expanded": menu.open.value,
    "aria-controls": menu.open.value ? menu.contentId : undefined,
    "data-slot": "header-trigger",
    "data-orientation": header.orientation.value,
    class: slotClass(slots, "trigger", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <button ref="buttonEl" v-bind="triggerAttrs()" @click="onClick"><slot /></button>
</template>
