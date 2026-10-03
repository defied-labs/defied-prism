<script setup lang="ts">
import { computed, normalizeClass, provide, ref, useAttrs, useId, watch } from "vue";
import { useCollection, useFieldControlProps, useMachine } from "@defied/prism-vue";
import { onDismiss, slotClass, variantData } from "@defied/prism-core";
import {
  ComboboxEvents,
  createComboboxMachineDefinition,
  filterOptions,
  matchesQuery,
  type ComboboxOption,
} from "@defied/prism-core/components/combobox";
import {
  ComboboxContext,
  type ComboboxFilter,
  type ItemEntry,
  type Labelling,
  type Size,
} from "./context";
import { slots } from "./styles";

export interface ComboboxProps {
  /** Selected item value (v-model). */
  modelValue?: string | null;
  /** Selected item value (controlled); the React-style alias of `modelValue`. */
  value?: string | null;
  /** Initially selected item value (uncontrolled). */
  defaultValue?: string | null;
  /** Text in the input (v-model:inputValue). */
  inputValue?: string;
  /**
   * Which items match the typed text. Defaults to a case- and
   * accent-insensitive "contains" on each item's text. Pass `false` to show
   * every item (e.g. results already filtered by a server).
   */
  filter?: ComboboxFilter | false;
  /** Submits the selected value with forms through a hidden input. */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  size?: Size;
  /** Start with the list open. */
  defaultOpen?: boolean;
}

/**
 * An editable combobox with list autocomplete (WAI-ARIA APG). Focus stays in
 * `ComboboxInput`; the highlighted item is conveyed with
 * aria-activedescendant. `ComboboxContent` stays mounted (hidden while
 * closed) so items register and the input can show the selected item's text.
 */
defineOptions({ inheritAttrs: false });

// undefined defaults: absent booleans defer to the Field / stay uncontrolled
const props = withDefaults(defineProps<ComboboxProps>(), {
  modelValue: undefined,
  value: undefined,
  defaultValue: null,
  inputValue: undefined,
  filter: undefined,
  name: undefined,
  disabled: undefined,
  required: undefined,
  size: "md",
  defaultOpen: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  valueChange: [value: string | null];
  "update:inputValue": [inputValue: string];
  /** As the user types, and with the item's text when one is selected. */
  inputValueChange: [inputValue: string];
}>();

const attrs = useAttrs();

const defaultFilter: ComboboxFilter = (item, query) =>
  matchesQuery({ value: item.value, label: item.textValue }, query);

const controlledValue = () => (props.modelValue !== undefined ? props.modelValue : props.value);
const initialSelected = controlledValue() !== undefined ? controlledValue()! : props.defaultValue;

// The machine owns typed text, highlight and selection; timers (none here) live in the adapter
const { state, send } = useMachine(() =>
  createComboboxMachineDefinition({
    selected: initialSelected,
    inputValue: props.inputValue ?? "",
    open: props.defaultOpen,
  }),
);
const highlighted = computed(() => state.value.data.highlighted);
const selected = computed(() => state.value.data.selected);
const inputValue = computed(() => props.inputValue ?? state.value.data.inputValue);
const open = computed(() => state.value.status === "open");
const labelling = ref<Labelling>({});
// Field supplies disabled/required when the Combobox doesn't
const control = useFieldControlProps(() => ({
  disabled: props.disabled,
  required: props.required,
}));

const collection = useCollection<ItemEntry>();
const { items } = collection;
const labelOf = (value: string | null | undefined) =>
  items.value.find((item) => item.value === value)?.textValue ?? "";

const visible = computed(() => {
  const list = items.value;
  const filter = props.filter ?? defaultFilter;
  if (filter === false) return list;
  const byValue = new Map(list.map((item) => [item.value, item]));
  return filterOptions(
    list.map((item) => ({ value: item.value, label: item.textValue, disabled: item.disabled })),
    { inputValue: inputValue.value, selected: selected.value },
    (option: ComboboxOption, query) => filter(byValue.get(option.value)!, query),
  ).map((option) => byValue.get(option.value)!);
});
const visibleValues = computed(() => new Set(visible.value.map((item) => item.value)));
const visibleGroups = computed(
  () => new Set(visible.value.flatMap((item) => (item.groupId ? [item.groupId] : []))),
);

// The input shows the initial selection's text once its item registers
let pendingLabel = initialSelected != null && props.inputValue === undefined;
watch(
  items,
  () => {
    if (!pendingLabel) return;
    const label = labelOf(state.value.data.selected);
    if (!label) return;
    pendingLabel = false;
    if (state.value.data.inputValue === "") send(ComboboxEvents.sync(state.value.data.selected, label));
  },
  { immediate: true, flush: "sync" },
);

// Follow a controlled value
watch(controlledValue, (next) => {
  if (next === undefined || next === selected.value) return;
  send(ComboboxEvents.sync(next, props.inputValue ?? labelOf(next)));
});

// Follow a controlled input value
watch(
  () => props.inputValue,
  (next) => {
    if (next === undefined || next === state.value.data.inputValue) return;
    send(ComboboxEvents.sync(state.value.data.selected, next));
  },
);

const rootRef = ref<HTMLElement | null>(null);
const listboxId = `${useId()}-listbox`;
const variants = computed(() => ({ size: props.size }));

// Escape and outside clicks close the list (without closing an outer dialog)
watch(
  open,
  (isOpen, _, onCleanup) => {
    if (!isOpen) return;
    onCleanup(
      onDismiss({
        inside: () => [rootRef.value],
        onDismiss: () => send(ComboboxEvents.close()),
      }),
    );
  },
  { immediate: true },
);

// Keep the highlighted item in view
watch(
  highlighted,
  (current) => {
    if (!current) return;
    items.value.find((item) => item.value === current)?.node?.scrollIntoView?.({ block: "nearest" });
  },
  { flush: "post" },
);

function setInputValue(next: string) {
  emit("update:inputValue", next);
  emit("inputValueChange", next);
}

function setValue(next: string | null) {
  emit("update:modelValue", next);
  emit("valueChange", next);
}

provide(ComboboxContext, {
  open,
  inputValue,
  highlighted,
  selected,
  visible,
  visibleValues,
  visibleGroups,
  showList: computed(() => open.value && visible.value.length > 0),
  disabled: computed(() => control.value.disabled),
  required: computed(() => control.value.required),
  variants,
  listboxId,
  rootRef,
  labelling,
  setLabelling: (next) => {
    labelling.value = next;
  },
  send,
  type: (next) => {
    const previous = selected.value;
    send(ComboboxEvents.input(next));
    setInputValue(next);
    if (next === "" && previous !== null && previous !== undefined) setValue(null);
  },
  choose: (item) => {
    if (!item || item.disabled) return;
    const previousText = inputValue.value;
    const previous = selected.value;
    send(ComboboxEvents.select({ value: item.value, label: item.textValue }));
    if (item.textValue !== previousText) setInputValue(item.textValue);
    if (item.value !== previous) setValue(item.value);
  },
  collection,
});

// Read in the render, so attribute changes re-render the root
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "combobox",
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
      :value="selected ?? ''"
      :disabled="control.disabled"
    />
  </div>
</template>
