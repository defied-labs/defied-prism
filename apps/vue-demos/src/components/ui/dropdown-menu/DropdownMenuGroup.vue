<script setup lang="ts">
import { normalizeClass, provide, ref, useAttrs, useId } from "vue";
import { slotClass } from "@defied-labs/prism-core";
import { GroupKey } from "./context";
import { slots } from "./styles";

/** Groups related items; a DropdownMenuLabel inside names the group. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const labelId = `${useId()}-label`;
const hasLabel = ref(false);
provide(GroupKey, {
  labelId,
  setHasLabel: (value) => {
    hasLabel.value = value;
  },
});

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    "aria-labelledby": hasLabel.value ? labelId : undefined,
    ...rest,
    role: "group",
    "data-slot": "dropdown-menu-group",
    class: slotClass(slots, "group", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
