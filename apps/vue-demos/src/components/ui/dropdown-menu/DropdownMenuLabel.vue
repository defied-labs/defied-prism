<script setup lang="ts">
import { inject, normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { slotClass } from "@defied-prism/core";
import { GroupKey } from "./context";
import { slots } from "./styles";

/** Names the surrounding group (or labels a section of the menu). */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const group = inject(GroupKey, null);
onMounted(() => group?.setHasLabel(true));
onBeforeUnmount(() => group?.setHasLabel(false));

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    id: group?.labelId,
    ...rest,
    "data-slot": "dropdown-menu-label",
    class: slotClass(slots, "label", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
