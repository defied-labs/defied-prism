<script setup lang="ts">
import { computed, ref } from "vue";
import { Checkbox } from "../../components/ui/checkbox";

const toppings = ["Mushrooms", "Olives", "Peppers"];
const selected = ref<string[]>(["Olives"]);
const all = computed(() => selected.value.length === toppings.length);
const some = computed(() => selected.value.length > 0 && !all.value);

function toggleAll(checked: boolean) {
  selected.value = checked ? [...toppings] : [];
}
function toggle(topping: string, checked: boolean) {
  selected.value = checked ? [...selected.value, topping] : selected.value.filter((t) => t !== topping);
}
</script>

<template>
  <div>
    <Checkbox :model-value="all" :indeterminate="some" @update:model-value="toggleAll">All toppings</Checkbox>
    <Checkbox
      v-for="topping in toppings"
      :key="topping"
      :model-value="selected.includes(topping)"
      @update:model-value="toggle(topping, $event)"
    >
      {{ topping }}
    </Checkbox>
  </div>
</template>
