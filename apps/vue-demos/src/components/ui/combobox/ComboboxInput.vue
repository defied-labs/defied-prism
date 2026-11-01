<script setup lang="ts">
import { normalizeClass, useAttrs, useId, watchEffect } from "vue";
import { mergeFieldControlProps, useField } from "@defied/prism-vue";
import { nextIndex, slotClass } from "@defied/prism-core";
import { ComboboxEvents } from "@defied/prism-core/components/combobox";
import { useComboboxContext } from "./context";
import { slots } from "./styles";
import { Input } from "../input";

/** The text input (role="combobox"). Focus stays here while the list is open. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useComboboxContext("ComboboxInput");
const field = useField();
const generatedId = useId();

// Fallthrough attrs aren't reactive in a computed: merge with the Field during render
const control = () =>
  mergeFieldControlProps(field, {
    id: attrs.id as string | undefined,
    disabled: ctx.disabled.value,
    required: ctx.required.value,
    "aria-describedby": attrs["aria-describedby"] as string | undefined,
    "aria-invalid": attrs["aria-invalid"] as boolean | "true" | "false" | undefined,
  });

// The listbox is named like the input
watchEffect(() => {
  ctx.setLabelling({
    label: attrs["aria-label"] as string | undefined,
    labelledBy: attrs["aria-labelledby"] as string | undefined,
  });
});

const highlightedItem = () =>
  ctx.visible.value.find((item) => item.value === ctx.highlighted.value);

function move(key: string) {
  const visible = ctx.visible.value;
  const item = highlightedItem();
  const current = item ? visible.indexOf(item) : -1;
  // Nothing highlighted yet (opened on focus): start at the selection or an end
  const enabled = visible.filter((entry) => !entry.disabled);
  const start =
    key === "ArrowDown"
      ? (enabled.find((entry) => entry.value === ctx.selected.value) ?? enabled[0])
      : enabled[enabled.length - 1];
  const next =
    current === -1
      ? (start ? visible.indexOf(start) : -1)
      : nextIndex(key, current, visible.length, {
          orientation: "vertical",
          isDisabled: (i) => visible[i]!.disabled,
        });
  if (next !== null && next !== -1) ctx.send(ComboboxEvents.highlight(visible[next]!.value));
}

// The consumer's listeners (in attrs) run first; respect their preventDefault
function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowUp": {
      event.preventDefault();
      if (!ctx.open.value) {
        const enabled = ctx.visible.value.filter((item) => !item.disabled);
        const initial = event.altKey
          ? null
          : event.key === "ArrowDown"
            ? (enabled.find((item) => item.value === ctx.selected.value) ?? enabled[0])?.value
            : enabled[enabled.length - 1]?.value;
        ctx.send(ComboboxEvents.open(initial ?? null));
      } else if (!event.altKey) {
        move(event.key);
      }
      break;
    }
    case "Enter": {
      const item = highlightedItem();
      if (ctx.open.value && item) {
        event.preventDefault();
        ctx.choose(item);
      }
      break;
    }
  }
}

// Show every option as soon as the input is focused or clicked
function openList(event: Event) {
  if (event.defaultPrevented || ctx.open.value || control().disabled) return;
  ctx.send(ComboboxEvents.open(null));
}

function onBlur(event: FocusEvent) {
  if (!ctx.rootRef.value?.contains(event.relatedTarget as Node | null)) {
    ctx.send(ComboboxEvents.close());
  }
}

// Read in the render, so attribute, Field and state changes re-render the input
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const merged = control();
  const showList = ctx.showList.value;
  const item = highlightedItem();
  const variants = ctx.variants.value;
  // Input merges the Field itself: hand it the caller's describedby/invalid
  // (not the merged ones) so Field ids are added once; required stays off
  // the element (conveyed with aria-required, like the APG combobox).
  return {
    ...rest,
    id: merged.id ?? `${generatedId}-input`,
    type: "text",
    role: "combobox",
    autocomplete: "off",
    size: variants.size,
    fullWidth: true,
    disabled: merged.disabled,
    required: false,
    "aria-required": merged.required || undefined,
    "aria-describedby": attrs["aria-describedby"],
    "aria-invalid": attrs["aria-invalid"],
    "aria-autocomplete": "list" as const,
    "aria-expanded": showList,
    "aria-controls": showList ? ctx.listboxId : undefined,
    "aria-activedescendant": showList && item ? item.id : undefined,
    "data-state": ctx.open.value ? "open" : "closed",
    "data-slot": "combobox-input",
    class: slotClass(slots, "input", variants, normalizeClass(className)),
  };
};

function onUpdate(value: string) {
  ctx.type(value);
}
</script>

<template>
  <Input
    v-bind="rootAttrs()"
    :model-value="ctx.inputValue.value"
    @update:model-value="onUpdate"
    @keydown="onKeyDown"
    @focus="openList"
    @click="openList"
    @blur="onBlur"
  />
</template>
