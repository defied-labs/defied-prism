<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { Slot } from "@defied-prism/vue";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

export interface LinkProps {
  tone?: "primary" | "neutral" | "muted";
  underline?: "always" | "hover" | "none";
  /** Open in a new tab (rel="noopener noreferrer") and announce it. */
  external?: boolean;
  /** Text announced for external links. */
  externalLabel?: string;
  /** Merge onto the single child, e.g. a router `<RouterLink>`. */
  asChild?: boolean;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<LinkProps>(), {
  tone: "primary",
  underline: "always",
  external: false,
  externalLabel: "(opens in a new tab)",
  asChild: false,
});

const attrs = useAttrs();
const variants = () => ({ tone: props.tone, underline: props.underline });

// Read in the render, so attribute changes re-render the link
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const rel = rest.rel as string | undefined;
  return {
    ...rest,
    ...(props.external
      ? {
          target: (rest.target as string | undefined) ?? "_blank",
          rel: [...new Set([...(rel?.split(/\s+/) ?? []), "noopener", "noreferrer"])]
            .filter(Boolean)
            .join(" "),
        }
      : {}),
    "data-slot": "link",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
</script>

<template>
  <Slot v-if="props.asChild" v-bind="rootAttrs()"><slot /></Slot>
  <a v-else v-bind="rootAttrs()"><slot /><template v-if="props.external">{{ " " }}<span data-part="external-hint">{{ props.externalLabel }}</span></template></a>
</template>
