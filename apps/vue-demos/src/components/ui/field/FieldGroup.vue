<script setup lang="ts">
import { normalizeClass, useAttrs, useSlots } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { provideGroupDisabled, useGroupDisabled } from "./context";

export interface FieldGroupProps {
  /** Caption for the group, rendered as its <legend>. A `legend` slot works too. */
  legend?: string;
  disabled?: boolean;
}

/** A <fieldset> grouping related fields; `disabled` disables every control in it. */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FieldGroupProps>(), { disabled: false });

const attrs = useAttrs();
const vueSlots = useSlots();
const parentDisabled = useGroupDisabled();
provideGroupDisabled(() => parentDisabled() || props.disabled);

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "field-group",
    ...variantData({}),
    class: slotClass(slots, "group", {}, normalizeClass(className)),
  };
};
const legendAttrs = () => ({
  "data-slot": "field-legend",
  ...variantData({}),
  class: slotClass(slots, "legend", {}),
});
</script>

<template>
  <fieldset v-bind="rootAttrs()" :disabled="disabled">
    <legend v-if="legend != null || vueSlots.legend" v-bind="legendAttrs()">
      <slot name="legend">{{ legend }}</slot>
    </legend>
    <slot />
  </fieldset>
</template>
