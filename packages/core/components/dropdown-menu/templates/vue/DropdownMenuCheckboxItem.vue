<script setup lang="ts">
import { useControllableState } from "@defied-labs/prism-vue";
import MenuItemImpl from "./MenuItemImpl.vue";
import type { DropdownMenuItemProps } from "./context";

export interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  /** Checked state (v-model:checked). */
  checked?: boolean;
  defaultChecked?: boolean;
}

/** Toggles on activation. Enter toggles and closes; Space toggles and keeps the menu open. */
const props = withDefaults(defineProps<DropdownMenuCheckboxItemProps>(), {
  checked: undefined,
  defaultChecked: false,
  disabled: false,
  textValue: undefined,
});
const emit = defineEmits<{
  select: [event: Event];
  "update:checked": [checked: boolean];
  checkedChange: [checked: boolean];
}>();

const checked = useControllableState({
  value: () => props.checked,
  defaultValue: props.defaultChecked,
  onChange: (next) => {
    emit("update:checked", next);
    emit("checkedChange", next);
  },
});
const toggle = () => {
  checked.value = !checked.value;
};
</script>

<template>
  <MenuItemImpl
    role="menuitemcheckbox"
    style-slot="checkboxItem"
    data-slot="dropdown-menu-checkbox-item"
    :checked="checked"
    :on-activate="toggle"
    :disabled="props.disabled"
    :text-value="props.textValue"
    @select="(event: Event) => emit('select', event)"
  >
    <span aria-hidden="true" data-part="indicator"><template v-if="checked">✓</template></span>
    <slot />
  </MenuItemImpl>
</template>
