<script setup lang="ts">
import { useAttrs } from "vue";
import { Slot } from "@defied-labs/prism-vue";
import { TooltipEvents } from "@defied-labs/prism-core/components/tooltip";
import { compose, useTooltip } from "./context";

export interface TooltipTriggerProps {
  /** Render your own element (e.g. a Button) instead of a plain <button>. */
  asChild?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TooltipTriggerProps>(), { asChild: false });

const attrs = useAttrs();
const { contentId, send } = useTooltip("TooltipTrigger");

const triggerAttrs = () => ({
  ...attrs,
  "aria-describedby": [attrs["aria-describedby"], contentId].filter(Boolean).join(" "),
  "data-slot": "tooltip-trigger",
  onPointerenter: compose(attrs.onPointerenter, () => send(TooltipEvents.pointerEnter())),
  onPointerleave: compose(attrs.onPointerleave, () => send(TooltipEvents.pointerLeave())),
  onPointerdown: compose(attrs.onPointerdown, () => send(TooltipEvents.press())),
  onFocus: compose(attrs.onFocus, () => send(TooltipEvents.focus())),
  onBlur: compose(attrs.onBlur, () => send(TooltipEvents.blur())),
});
</script>

<template>
  <Slot v-if="props.asChild" v-bind="triggerAttrs()"><slot /></Slot>
  <button v-else type="button" v-bind="triggerAttrs()"><slot /></button>
</template>
