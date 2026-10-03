<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, ref, useAttrs, watch } from "vue";
import { nextIndex, onDismiss, slotClass, variantData } from "@defied/prism-core";
import { usePresence } from "@defied/prism-vue";
import {
  TYPEAHEAD_TIMEOUT,
  isTypeaheadKey,
  typeaheadIndex,
} from "@defied/prism-core/components/dropdown-menu";
import { useMenu } from "./context";
import { slots } from "./styles";

export interface DropdownMenuContentProps {
  /** Horizontal alignment with the trigger. */
  align?: "start" | "end";
}

/**
 * The menu (role="menu"). Items get real focus: arrows, Home/End and
 * typeahead move it; Escape and Tab close; outside clicks close. Stays
 * mounted while closed so uncontrolled checkbox and radio state survives.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DropdownMenuContentProps>(), { align: "start" });

const attrs = useAttrs();
const menu = useMenu("DropdownMenuContent");
const contentRef = ref<HTMLDivElement | null>(null);
// Stays visible with data-state="closed" while the exit animation plays
const { present, state } = usePresence(() => menu.open.value, contentRef);
const typeahead: { buffer: string; timer?: ReturnType<typeof setTimeout> } = { buffer: "" };
const variants = () => ({ align: props.align });

// Registered, rendered items in DOM order
const items = () => menu.collection.items.value.filter((item) => item.node);

let cleanup: (() => void) | undefined;
function teardown() {
  cleanup?.();
  cleanup = undefined;
  clearTimeout(typeahead.timer);
  typeahead.buffer = "";
}

function activate(open: boolean) {
  teardown();
  const content = contentRef.value;
  if (!open || !content) return;
  const enabled = items().filter((item) => !item.disabled);
  const target = menu.focusTarget.current === "last" ? enabled[enabled.length - 1] : enabled[0];
  (target?.node ?? content).focus();
  menu.focusTarget.current = "first";
  cleanup = onDismiss({
    inside: () => [content, menu.triggerRef.value],
    onDismiss: (reason) => menu.close(reason === "escape"),
  });
}

// After the DOM updates, like a React effect
onMounted(() => activate(menu.open.value));
watch(() => menu.open.value, activate, { flush: "post" });
onBeforeUnmount(teardown);

// The consumer's onKeydown (in attrs) runs first; respect its preventDefault
function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  const list = items();
  const current = list.findIndex((item) => item.node === document.activeElement);
  const active = list[current]?.node;
  const isDisabled = (i: number) => list[i]!.disabled;

  if (event.key === "Tab") {
    // Close. Tab continues from the trigger's place in the page;
    // Shift+Tab lands on the trigger itself.
    if (event.shiftKey) event.preventDefault();
    menu.triggerRef.value?.focus();
    menu.open.value = false;
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (!active) return;
    menu.keepOpen.current = event.key === " " && active.getAttribute("role") !== "menuitem";
    active.click();
    menu.keepOpen.current = false;
    return;
  }
  const next = nextIndex(event.key, current, list.length, { orientation: "vertical", isDisabled });
  if (next !== null) {
    event.preventDefault();
    list[next]?.node?.focus();
    return;
  }
  if (isTypeaheadKey(event)) {
    event.preventDefault();
    clearTimeout(typeahead.timer);
    typeahead.buffer += event.key;
    typeahead.timer = setTimeout(() => {
      typeahead.buffer = "";
    }, TYPEAHEAD_TIMEOUT);
    const match = typeaheadIndex(
      list.map((item) => item.textValue),
      current,
      typeahead.buffer,
      { isDisabled },
    );
    if (match !== null) list[match]!.node?.focus();
  }
}

// Read in the render, so attribute and state changes re-render the menu
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    "aria-labelledby": menu.triggerId,
    ...rest,
    id: menu.contentId,
    role: "menu",
    tabindex: -1,
    hidden: !present.value,
    "data-state": state.value,
    "data-slot": "dropdown-menu-content",
    ...variantData(variants()),
    class: slotClass(slots, "content", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <div ref="contentRef" v-bind="rootAttrs()" @keydown="onKeyDown"><slot /></div>
</template>
