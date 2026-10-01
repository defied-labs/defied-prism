<script setup lang="ts">
import { normalizeClass, onBeforeUnmount, useAttrs, useId, watchEffect } from "vue";
import { useFieldControlProps } from "@defied-prism/vue";
import { nextIndex, slotClass, variantData } from "@defied-prism/core";
import {
  TYPEAHEAD_TIMEOUT,
  selectKeyAction,
  typeaheadIndex,
} from "@defied-prism/core/components/select";
import { callListener, useSelectContext, withoutListeners, type ItemEntry } from "./context";
import { slots } from "./styles";
import SelectValue from "./SelectValue.vue";

/** The combobox button. Renders `<SelectValue />` unless given content. */
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const ctx = useSelectContext("SelectTrigger");
const generatedId = useId();
const control = useFieldControlProps(() => ({
  id: attrs.id as string | undefined,
  disabled: ctx.disabled.value,
  required: ctx.required.value,
  "aria-describedby": attrs["aria-describedby"] as string | undefined,
  "aria-invalid": attrs["aria-invalid"] as boolean | "true" | "false" | undefined,
}));
const typeahead: { buffer: string; timer?: ReturnType<typeof setTimeout> } = { buffer: "" };
onBeforeUnmount(() => clearTimeout(typeahead.timer));

// The listbox is named like the trigger
watchEffect(() => {
  ctx.setLabelling({
    label: attrs["aria-label"] as string | undefined,
    labelledBy: attrs["aria-labelledby"] as string | undefined,
  });
});

const enabled = () => ctx.items.value.filter((item) => !item.disabled);
const highlightedIndex = () =>
  ctx.items.value.findIndex((item) => item.value === ctx.highlighted.value);
const highlightedItem = () => ctx.items.value[highlightedIndex()];
const selectedOrFirst = () => {
  const selected = ctx.selected.value;
  return selected && !selected.disabled ? selected : enabled()[0];
};

function choose(item: ItemEntry | undefined) {
  if (!item || item.disabled) return;
  ctx.setValue(item.value);
  ctx.close();
}

function search(key: string, current: number) {
  const items = ctx.items.value;
  clearTimeout(typeahead.timer);
  typeahead.buffer += key;
  typeahead.timer = setTimeout(() => {
    typeahead.buffer = "";
  }, TYPEAHEAD_TIMEOUT);
  const index = typeaheadIndex(
    items.map((item) => item.textValue),
    current,
    typeahead.buffer,
    { isDisabled: (i) => items[i]!.disabled },
  );
  return index === null ? undefined : items[index];
}

function onKeyDown(event: KeyboardEvent) {
  callListener(attrs, "keydown", event);
  if (event.defaultPrevented) return;
  const items = ctx.items.value;
  const open = ctx.open.value;
  const typing = typeahead.buffer !== "";
  switch (selectKeyAction(event, open, typing)) {
    case "open":
      event.preventDefault();
      ctx.openAt(selectedOrFirst()?.value ?? null);
      break;
    case "openFirst":
      event.preventDefault();
      ctx.openAt(enabled()[0]?.value ?? null);
      break;
    case "openLast": {
      event.preventDefault();
      const list = enabled();
      ctx.openAt(list[list.length - 1]?.value ?? null);
      break;
    }
    case "navigate": {
      event.preventDefault();
      const current = highlightedIndex();
      const fallback = selectedOrFirst();
      const next =
        current === -1
          ? fallback
            ? items.indexOf(fallback)
            : -1
          : nextIndex(event.key, current, items.length, {
              orientation: "vertical",
              loop: false,
              isDisabled: (i) => items[i]!.disabled,
            });
      if (next !== null && next !== -1) ctx.setHighlighted(items[next]!.value);
      break;
    }
    case "select": {
      event.preventDefault();
      const item = highlightedItem();
      choose(item);
      if (!item) ctx.close();
      break;
    }
    case "selectAndBlur":
      // Tab keeps its default: focus moves on
      choose(highlightedItem());
      ctx.close();
      break;
    case "typeahead": {
      event.preventDefault();
      if (open) {
        const match = search(event.key, highlightedIndex());
        if (match) ctx.setHighlighted(match.value);
      } else {
        const match = search(
          event.key,
          items.findIndex((item) => item.value === ctx.value.value),
        );
        if (match) ctx.setValue(match.value);
      }
      break;
    }
    // "close" (Escape) is handled by the dismiss layer
  }
}

function onClick(event: MouseEvent) {
  callListener(attrs, "click", event);
  if (event.defaultPrevented) return;
  if (ctx.open.value) ctx.close();
  else ctx.openAt(selectedOrFirst()?.value ?? null);
}

function onBlur(event: FocusEvent) {
  callListener(attrs, "blur", event);
  if (!ctx.rootRef.value?.contains(event.relatedTarget as Node | null)) ctx.close();
}

// Read in the render, so attribute changes re-render the trigger
const rootAttrs = () => {
  const { class: className, ...rest } = withoutListeners(attrs, ["click", "keydown", "blur"]);
  const open = ctx.open.value;
  const item = highlightedItem();
  const variants = ctx.variants.value;
  return {
    ...rest,
    id: control.value.id ?? `${generatedId}-trigger`,
    type: "button" as const,
    role: "combobox",
    disabled: control.value.disabled,
    "aria-required": control.value.required || undefined,
    "aria-describedby": control.value["aria-describedby"],
    "aria-invalid": control.value["aria-invalid"],
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": open ? ctx.listboxId : undefined,
    "aria-activedescendant": open && item ? item.id : undefined,
    "data-state": open ? "open" : "closed",
    "data-slot": "select-trigger",
    ...variantData(variants),
    class: slotClass(slots, "trigger", variants, normalizeClass(className)),
  };
};
</script>

<template>
  <button v-bind="rootAttrs()" @click="onClick" @keydown="onKeyDown" @blur="onBlur">
    <slot><SelectValue /></slot>
    <span aria-hidden="true" data-part="icon">▾</span>
  </button>
</template>
