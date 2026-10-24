<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { IconButton } from "../icon-button";
import { slots } from "./styles";
import { elementOf, useHeader } from "./context";

export interface HeaderToggleProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/** Slides the collapsed navigation in; hidden while the nav fits. Named "Menu" unless `aria-label` is given. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderToggleProps>(), { variant: "primary", size: "md" });
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const header = useHeader("HeaderToggle");

const toggleRef = ref<unknown>(null);
const sync = () => {
  header.toggleEl.value = elementOf(toggleRef.value);
};
onMounted(sync);
onUpdated(sync);
onBeforeUnmount(() => {
  header.toggleEl.value = null;
});

function onClick(event: MouseEvent) {
  emit("click", event);
  if (!event.defaultPrevented) header.setOpen(!header.open.value);
}

const toggleAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    "data-slot": "header-toggle",
    ...rest,
    "aria-label": (rest["aria-label"] as string | undefined) ?? "Menu",
    "aria-expanded": header.open.value ? "true" : "false",
    "aria-controls": header.navId,
    hidden: header.orientation.value === "horizontal",
    class: slotClass(slots, "toggle", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <IconButton ref="toggleRef" v-bind="toggleAttrs()" :variant="props.variant" :size="props.size" @click="onClick">
    <slot>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false">
        <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
      </svg>
    </slot>
  </IconButton>
</template>
