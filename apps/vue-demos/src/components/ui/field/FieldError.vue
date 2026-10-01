<script setup lang="ts">
import {
  Comment,
  Fragment,
  normalizeClass,
  onBeforeUnmount,
  ref,
  Text,
  useAttrs,
  useSlots,
  watch,
  type VNode,
} from "vue";
import { useField } from "@defied-prism/vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";

/**
 * Validation message. While it has content it marks the control invalid and
 * is added to its aria-describedby. The element is always rendered as a
 * polite live region (not role="alert"), so the message is announced when it
 * appears or changes, without interrupting, and several errors appearing at
 * once on submit don't each shout over each other; focus moves to the first
 * invalid control anyway (see Form), which reads the message as description.
 */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const vueSlots = useSlots();
const field = useField();

// Comments (v-if) and empty text don't count as a message
const hasVisible = (nodes: VNode[]): boolean =>
  nodes.some((node) => {
    if (node.type === Comment) return false;
    if (node.type === Text) return String(node.children ?? "") !== "";
    if (node.type === Fragment) return hasVisible((node.children as VNode[]) ?? []);
    return true;
  });

const hasContent = ref(false);
watch(hasContent, (value) => field?.setHasError(value), { immediate: true });
onBeforeUnmount(() => field?.setHasError(false));

// Rendered as a child, so slot content changes are tracked on every render
const Content = () => {
  const nodes = vueSlots.default?.() ?? [];
  hasContent.value = hasVisible(nodes);
  return nodes;
};

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    "aria-live": "polite" as const,
    ...rest,
    id: field?.errorId,
    "data-slot": "field-error",
    ...variantData({}),
    class: slotClass(slots, "error", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <p v-bind="rootAttrs()"><Content /></p>
</template>
