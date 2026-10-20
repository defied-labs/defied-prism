<script setup lang="ts">
import { normalizeClass, provide, ref, useAttrs, useId } from "vue";
import { useOverflow } from "@defied/prism-vue";
import { slotClass, variantData } from "@defied/prism-core";
import { slots } from "./styles";
import { TableKey, type TableVariants } from "./context";

export interface TableProps {
  density?: TableVariants["density"];
  /** Alternate body row backgrounds. */
  striped?: boolean;
  /**
   * Accessible name of the scroll region when the table overflows
   * horizontally. Defaults to the `TableCaption`, then the table's
   * `aria-label`, then "Table".
   */
  scrollLabel?: string;
}

/**
 * A semantic `<table>` inside a horizontal scroll container. When (and only
 * when) the table is wider than its container, the container becomes a
 * focusable, named `role="region"`. When it fits, it adds no tab stop.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TableProps>(), {
  density: "normal",
  striped: false,
  scrollLabel: undefined,
});

const attrs = useAttrs();
const variants = (): TableVariants => ({ density: props.density, striped: props.striped });
const captionId = `${useId()}-caption`;
const hasCaption = ref(false);
const scrollRef = ref<HTMLDivElement | null>(null);
const overflowing = useOverflow(scrollRef);

provide(TableKey, {
  variants,
  captionId,
  setHasCaption: (has) => {
    hasCaption.value = has;
  },
});

const scrollAttrs = () => {
  const name = props.scrollLabel ?? (attrs["aria-label"] as string | undefined) ?? "Table";
  const region = overflowing.value
    ? {
        role: "region",
        tabindex: 0,
        ...(hasCaption.value && !props.scrollLabel ? { "aria-labelledby": captionId } : { "aria-label": name }),
      }
    : {};
  return {
    ...region,
    "data-slot": "table-scroll",
    ...variantData(variants()),
    class: slotClass(slots, "scroll", variants()),
  };
};

const tableAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "table",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <div ref="scrollRef" v-bind="scrollAttrs()">
    <table v-bind="tableAttrs()"><slot /></table>
  </div>
</template>
