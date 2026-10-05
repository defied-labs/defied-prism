<script setup lang="ts">
import { normalizeClass, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { slots } from "./styles";
import { callListener, usePalette, withoutListeners } from "./context";

export interface CommandInputProps {
  placeholder?: string;
}

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<CommandInputProps>(), { placeholder: "Type a command or search…" });

const attrs = useAttrs();
const ctx = usePalette("CommandInput");

function setInput(el: unknown) {
  ctx.inputRef.value = (el as HTMLInputElement | null) ?? null;
}

function onInput(event: Event) {
  callListener(attrs, "input", event);
  if (!event.defaultPrevented) ctx.query.value = (event.target as HTMLInputElement).value;
}

function onKeyDown(event: KeyboardEvent) {
  callListener(attrs, "keydown", event);
  if (!event.defaultPrevented) ctx.onInputKeyDown(event);
}

// Read in the render, so state changes re-render the input
const inputAttrs = () => {
  const { class: className, ...rest } = withoutListeners(attrs, ["input", "keydown"]);
  const variants = ctx.variants.value;
  return {
    "aria-label": "Search commands",
    ...rest,
    type: "text" as const,
    role: "combobox",
    autocomplete: "off" as const,
    spellcheck: false,
    "aria-autocomplete": "list" as const,
    "aria-expanded": ctx.hasResults.value ? ("true" as const) : ("false" as const),
    "aria-controls": ctx.listboxId,
    "aria-activedescendant": ctx.highlightedId.value ?? undefined,
    placeholder: props.placeholder,
    value: ctx.query.value,
    "data-slot": "command-palette-input",
    ...variantData(variants),
    class: slotClass(slots, "input", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <input :ref="setInput" v-bind="inputAttrs()" @input="onInput" @keydown="onKeyDown" />
</template>
