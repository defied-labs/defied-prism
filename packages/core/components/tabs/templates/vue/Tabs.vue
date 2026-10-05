<script setup lang="ts">
import { computed, normalizeClass, provide, useAttrs, useId } from "vue";
import { useCollection, useControllableState } from "@defied-labs/prism-vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { TabsContext, type Orientation, type TabEntry } from "./context";
import { slots } from "./styles";

export interface TabsProps {
  /** Selected tab (v-model). */
  modelValue?: string;
  /** Selected tab (controlled); the React-style alias of `modelValue`. */
  value?: string;
  /** Initially selected tab (uncontrolled). */
  defaultValue?: string;
  orientation?: Orientation;
  /** automatic: arrow keys select; manual: arrow keys move focus, Enter/Space select. */
  activationMode?: "automatic" | "manual";
  variant?: "line" | "pills";
  size?: "sm" | "md";
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TabsProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: undefined,
  orientation: "horizontal",
  activationMode: "automatic",
  variant: "line",
  size: "md",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
}>();

const attrs = useAttrs();
const value = useControllableState<string | undefined>({
  value: () => (props.modelValue !== undefined ? props.modelValue : props.value),
  defaultValue: props.defaultValue,
  onChange: (next) => {
    if (next === undefined) return;
    emit("update:modelValue", next);
    emit("valueChange", next);
  },
});
const variants = computed(() => ({
  orientation: props.orientation,
  variant: props.variant,
  size: props.size,
}));

provide(TabsContext, {
  value,
  select: (next) => {
    value.value = next;
  },
  baseId: useId(),
  orientation: computed(() => props.orientation),
  activationMode: computed(() => props.activationMode),
  variants,
  tabs: useCollection<TabEntry>(),
});

// Read in the render, so attribute changes re-render the root
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "tabs",
    ...variantData(variants.value),
    class: slotClass(slots, "root", variants.value, normalizeClass(className)),
  };
};
</script>

<template>
  <div v-bind="rootAttrs()"><slot /></div>
</template>
