<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { useHeader, useNav } from "./context";

/** A top-level entry holding a single `HeaderLink`. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const header = useHeader("HeaderItem");
const nav = useNav("HeaderItem");

function onPointerenter(event: PointerEvent) {
  // The surface would otherwise stay under the previous menu
  if (event.pointerType === "mouse") nav.hoverClose();
}

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "header-item",
    "data-orientation": header.orientation.value,
    class: slotClass(slots, "item", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <li v-bind="rootAttrs()" @pointerenter="onPointerenter"><slot /></li>
</template>
