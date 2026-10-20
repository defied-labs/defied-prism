<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, onMounted, useAttrs } from "vue";
import { useField } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { slots } from "./styles";

/** Help text, referenced by the control's aria-describedby. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const field = useField();

onMounted(() => field?.setHasDescription(true));
onBeforeUnmount(() => field?.setHasDescription(false));

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    id: field?.descriptionId,
    "data-slot": "field-description",
    ...variantData({}),
    class: slotClass(slots, "description", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <p v-bind="rootAttrs()"><slot /></p>
</template>
