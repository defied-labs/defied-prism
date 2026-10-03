<script setup lang="ts">
import { normalizeClass, provide, ref, useAttrs, useId } from "vue";
import { useCollection, useControllableState } from "@defied-prism/vue";
import { slotClass } from "@defied-prism/core";
import { MenuKey, type FocusTarget, type MenuItemEntry } from "./context";
import { slots } from "./styles";

export interface DropdownMenuProps {
  /** Open state (v-model:open). */
  open?: boolean;
  defaultOpen?: boolean;
}

/** Positioning root: the menu is placed relative to it. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DropdownMenuProps>(), { open: undefined, defaultOpen: false });
const emit = defineEmits<{ "update:open": [open: boolean]; openChange: [open: boolean] }>();

const attrs = useAttrs();
const open = useControllableState({
  value: () => props.open,
  defaultValue: props.defaultOpen,
  onChange: (next) => {
    emit("update:open", next);
    emit("openChange", next);
  },
});
const id = useId();
const triggerRef = ref<HTMLElement | null>(null);

provide(MenuKey, {
  open,
  contentId: `${id}-menu`,
  triggerId: `${id}-trigger`,
  triggerRef,
  focusTarget: { current: "first" as FocusTarget },
  keepOpen: { current: false },
  close: (focusTrigger) => {
    open.value = false;
    if (focusTrigger) triggerRef.value?.focus();
  },
  collection: useCollection<MenuItemEntry>(),
});

// Read in the render, so attribute and state changes re-render the root
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "dropdown-menu",
    "data-state": open.value ? "open" : "closed",
    class: slotClass(slots, "root", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
