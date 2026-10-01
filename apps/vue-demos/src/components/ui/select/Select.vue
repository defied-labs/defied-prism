<script setup lang="ts">
import { computed, normalizeClass, provide, ref, useAttrs, useId, watch } from "vue";
import {
  useCollection,
  useControllableState,
  useFieldControlProps,
} from "@defied-prism/vue";
import { onDismiss, slotClass, variantData } from "@defied-prism/core";
import { SelectContext, type ItemEntry, type Labelling, type Size } from "./context";
import { slots } from "./styles";

export interface SelectProps {
  /** Selected value (v-model). */
  modelValue?: string | null;
  /** Selected value (controlled); the React-style alias of `modelValue`. */
  value?: string | null;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string | null;
  /** Open state (v-model:open). */
  open?: boolean;
  /** Start with the list open. */
  defaultOpen?: boolean;
  /** Submits the selected value with forms through a hidden input. */
  name?: string;
  disabled?: boolean;
  /** Marks the selection as required (aria-required). */
  required?: boolean;
  size?: Size;
  /** Shown by `SelectValue` when nothing is selected. */
  placeholder?: string;
}

/**
 * A select-only combobox (WAI-ARIA APG): a button-like combobox that opens
 * a listbox. Focus stays on the combobox; the highlighted option is conveyed
 * with aria-activedescendant. Tab selects the highlighted option and moves on.
 *
 * `SelectContent` stays mounted (hidden) while closed, so items register and
 * the trigger can show the selected item's text at any time.
 */
defineOptions({ inheritAttrs: false });

// undefined defaults: absent booleans defer to the Field / stay uncontrolled
const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: null,
  open: undefined,
  defaultOpen: false,
  disabled: undefined,
  required: undefined,
  size: "md",
  placeholder: "Select…",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  valueChange: [value: string];
  "update:open": [open: boolean];
}>();

const attrs = useAttrs();

const value = useControllableState<string | null>({
  value: () => (props.modelValue !== undefined ? props.modelValue : props.value),
  defaultValue: props.defaultValue,
  onChange: (next) => {
    if (next === null) return;
    emit("update:modelValue", next);
    emit("valueChange", next);
  },
});
const open = useControllableState<boolean>({
  value: () => props.open,
  defaultValue: props.defaultOpen,
  onChange: (next) => emit("update:open", next),
});
const highlighted = ref<string | null>(null);
const labelling = ref<Labelling>({});
// Field supplies disabled/required when the Select doesn't
const control = useFieldControlProps(() => ({
  disabled: props.disabled,
  required: props.required,
}));

const collection = useCollection<ItemEntry>();
const { items } = collection;
const selected = computed(() => items.value.find((item) => item.value === value.value));

// defaultOpen: highlight the selection (or the first option) once items exist
let pendingOpen = props.defaultOpen;
watch(
  items,
  (list) => {
    if (!pendingOpen || list.length === 0) return;
    pendingOpen = false;
    const first = list.find((item) => !item.disabled);
    const current = selected.value;
    highlighted.value = (current && !current.disabled ? current : first)?.value ?? null;
  },
  { immediate: true, flush: "sync" },
);

const rootRef = ref<HTMLElement | null>(null);
const listboxId = `${useId()}-listbox`;
const variants = computed(() => ({ size: props.size }));

const close = () => {
  open.value = false;
  highlighted.value = null;
};
const openAt = (next: string | null) => {
  open.value = true;
  highlighted.value = next;
};

// Escape and outside clicks close the list (without closing an outer dialog)
watch(
  open,
  (isOpen, _, onCleanup) => {
    if (!isOpen) return;
    onCleanup(onDismiss({ inside: () => [rootRef.value], onDismiss: close }));
  },
  { immediate: true },
);

// Keep the highlighted option in view
watch(
  [open, highlighted],
  ([isOpen, current]) => {
    if (!isOpen || current === null) return;
    items.value.find((item) => item.value === current)?.node?.scrollIntoView?.({ block: "nearest" });
  },
  { flush: "post" },
);

provide(SelectContext, {
  value,
  open,
  highlighted,
  items,
  selected,
  disabled: computed(() => control.value.disabled),
  required: computed(() => control.value.required),
  placeholder: computed(() => props.placeholder),
  variants,
  listboxId,
  rootRef,
  labelling,
  setLabelling: (next) => {
    labelling.value = next;
  },
  setValue: (next) => {
    value.value = next;
  },
  setHighlighted: (next) => {
    highlighted.value = next;
  },
  openAt,
  close,
  collection,
});

// Read in the render, so attribute changes re-render the root
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "select",
    "data-state": open.value ? "open" : "closed",
    ...variantData(variants.value),
    class: slotClass(slots, "root", variants.value, normalizeClass(className)),
  };
};
</script>

<template>
  <div ref="rootRef" v-bind="rootAttrs()">
    <slot />
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="value ?? ''"
      :disabled="control.disabled"
    />
  </div>
</template>
