<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { Slot } from "@defied-prism/vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { useBreadcrumb } from "./context";

export interface BreadcrumbLinkProps {
  /** Render your own link (e.g. a router link) instead of a plain <a>. */
  asChild?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BreadcrumbLinkProps>(), { asChild: false });

const attrs = useAttrs();
const variants = useBreadcrumb("BreadcrumbLink");

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "breadcrumb-link",
    ...variantData(variants()),
    class: slotClass(slots, "link", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <Slot v-if="props.asChild" v-bind="rootAttrs()"><slot /></Slot>
  <a v-else v-bind="rootAttrs()"><slot /></a>
</template>
