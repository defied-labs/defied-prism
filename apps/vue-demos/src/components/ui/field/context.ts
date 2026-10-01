import { inject, provide, type InjectionKey } from "vue";

/**
 * A disabled FieldGroup disables its controls natively; Fields inside it read
 * this so their labels dim too.
 */
const GroupDisabledKey: InjectionKey<() => boolean> = Symbol("PrismFieldGroupDisabled");

export function provideGroupDisabled(disabled: () => boolean): void {
  provide(GroupDisabledKey, disabled);
}

export function useGroupDisabled(): () => boolean {
  return inject(GroupDisabledKey, () => false);
}
