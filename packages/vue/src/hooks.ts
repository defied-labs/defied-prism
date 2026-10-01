import { computed, ref, toValue, type MaybeRefOrGetter, type WritableComputedRef } from "vue";

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`), the convention every Prism component follows for
 * `value`/`open`/`selected`-style props. In Vue `value` is usually a
 * `v-model` prop and `onChange` emits its `update:` event.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: MaybeRefOrGetter<T | undefined>;
  defaultValue: T;
  onChange?: (value: T) => void;
}): WritableComputedRef<T> {
  const internal = ref(defaultValue) as { value: T };
  const current = () => {
    const controlled = toValue(value);
    return controlled !== undefined ? controlled : internal.value;
  };
  return computed({
    get: current,
    set: (next: T) => {
      if (Object.is(next, current())) return;
      if (toValue(value) === undefined) internal.value = next;
      onChange?.(next);
    },
  });
}
