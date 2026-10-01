<script setup lang="ts">
import { normalizeClass, provide, ref, useAttrs, useId } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { GroupContext, useSelectContext } from "./context";
import { slots } from "./styles";

/** A labelled group of items; name it with `SelectLabel`. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useSelectContext("SelectGroup");
const labelId = `${useId()}-label`;
const hasLabel = ref(false);
provide(GroupContext, {
  labelId,
  setHasLabel: (has) => {
    hasLabel.value = has;
  },
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const variants = ctx.variants.value;
  return {
    "aria-labelledby": hasLabel.value ? labelId : undefined,
    ...rest,
    role: "group",
    "data-slot": "select-group",
    ...variantData(variants),
    class: slotClass(slots, "group", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
