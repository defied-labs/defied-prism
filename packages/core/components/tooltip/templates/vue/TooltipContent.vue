<script setup lang="ts">
import { normalizeClass, ref, useAttrs } from "vue";
import { slotClass, variantData } from "@defied/prism-core";
import { usePresence } from "@defied/prism-vue";
import { TooltipEvents } from "@defied/prism-core/components/tooltip";
import { slots } from "./styles";
import { compose, useTooltip } from "./context";

export interface TooltipContentProps {
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Always rendered (hidden when closed) so the trigger's aria-describedby
 * resolves for screen reader and keyboard users without hovering.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TooltipContentProps>(), { side: "top" });

const attrs = useAttrs();
const tooltip = useTooltip("TooltipContent");
const contentRef = ref<HTMLSpanElement | null>(null);
// Stays visible with data-state="closed" while the exit animation plays
const { present, state } = usePresence(() => tooltip.open.value, contentRef);

// Read in the render, so attribute and state changes re-render the content
const contentAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = { side: props.side };
  return {
    ...rest,
    id: tooltip.contentId,
    role: "tooltip",
    hidden: !present.value,
    "data-state": state.value,
    "data-slot": "tooltip-content",
    ...variantData(variants),
    class: slotClass(slots, "content", variants, normalizeClass(className)),
    onPointerenter: compose(attrs.onPointerenter, () => tooltip.send(TooltipEvents.pointerEnter())),
    onPointerleave: compose(attrs.onPointerleave, () => tooltip.send(TooltipEvents.pointerLeave())),
  };
};
</script>

<template>
  <span ref="contentRef" v-bind="contentAttrs()"><slot /></span>
</template>
