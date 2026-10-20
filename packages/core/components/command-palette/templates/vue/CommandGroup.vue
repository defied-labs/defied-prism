<script setup lang="ts">
import { normalizeClass, provide, useAttrs, useId, useSlots } from "vue";
import { slotClass, variantData } from "@defied/prism-core";
import { slots } from "./styles";
import { CommandGroupKey, usePalette } from "./context";

export interface CommandGroupProps {
  /** Group label; or use the `heading` slot. */
  heading?: string;
}

/** A labelled group of items; not rendered while none of its items match. */
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<CommandGroupProps>(), { heading: undefined });

const attrs = useAttrs();
const vueSlots = useSlots();
const ctx = usePalette("CommandGroup");
const key = useId();
const labelId = `${key}-label`;
provide(CommandGroupKey, key);

const hasHeading = () => props.heading != null || !!vueSlots.heading;

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    ...rest,
    role: "group",
    "aria-labelledby": hasHeading() ? labelId : undefined,
    "data-slot": "command-palette-group",
    ...variantData(variants),
    class: slotClass(slots, "group", variants, normalizeClass(className)),
  };
};

const labelAttrs = () => ({
  id: labelId,
  "data-slot": "command-palette-group-label",
  ...variantData(ctx.variants.value),
  class: slotClass(slots, "groupLabel", ctx.variants.value),
});
</script>

<template>
  <div v-if="ctx.isGroupVisible(key)" v-bind="rootAttrs()">
    <div v-if="hasHeading()" v-bind="labelAttrs()"><slot name="heading">{{ props.heading }}</slot></div>
    <slot />
  </div>
  <!-- Items stay mounted (and registered) while the group is hidden -->
  <slot v-else />
</template>
