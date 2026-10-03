<script setup lang="ts">
import MenuItemImpl from "./MenuItemImpl.vue";
import type { DropdownMenuItemProps } from "./context";

/** An action. `@select` fires on activation; the menu then closes unless prevented. */
const props = withDefaults(defineProps<DropdownMenuItemProps>(), {
  disabled: false,
  textValue: undefined,
});
const emit = defineEmits<{ select: [event: Event] }>();
</script>

<template>
  <MenuItemImpl
    role="menuitem"
    style-slot="item"
    data-slot="dropdown-menu-item"
    :disabled="props.disabled"
    :text-value="props.textValue"
    @select="(event: Event) => emit('select', event)"
  >
    <slot />
  </MenuItemImpl>
</template>
