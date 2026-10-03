<script setup lang="ts">
import { inject } from "vue";
import MenuItemImpl from "./MenuItemImpl.vue";
import { RadioGroupKey, type DropdownMenuItemProps } from "./context";

export interface DropdownMenuRadioItemProps extends DropdownMenuItemProps {
  value: string;
}

const props = withDefaults(defineProps<DropdownMenuRadioItemProps>(), {
  disabled: false,
  textValue: undefined,
});
const emit = defineEmits<{ select: [event: Event] }>();

const group = inject(RadioGroupKey, null);
if (!group) throw new Error("<DropdownMenuRadioItem> must be used inside <DropdownMenuRadioGroup>.");
const radio = group;
const choose = () => radio.setValue(props.value);
</script>

<template>
  <MenuItemImpl
    role="menuitemradio"
    style-slot="radioItem"
    data-slot="dropdown-menu-radio-item"
    :checked="radio.value.value === props.value"
    :on-activate="choose"
    :disabled="props.disabled"
    :text-value="props.textValue"
    @select="(event: Event) => emit('select', event)"
  >
    <span aria-hidden="true" data-part="indicator"
      ><template v-if="radio.value.value === props.value">●</template></span
    >
    <slot />
  </MenuItemImpl>
</template>
