<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { slots } from "./styles";
import { useBreadcrumb } from "./context";

/** The current page: not a link, marked aria-current="page". */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const variants = useBreadcrumb("BreadcrumbPage");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "aria-current": "page" as const,
    "data-slot": "breadcrumb-page",
    ...variantData(variants()),
    class: slotClass(slots, "page", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <span v-bind="rootAttrs()"><slot /></span>
</template>
