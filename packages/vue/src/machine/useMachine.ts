import {
  computed,
  getCurrentScope,
  onScopeDispose,
  shallowRef,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type ShallowRef,
} from "vue";
import {
  Machine,
  type MachineDefinition,
  type MachineEvent,
  type MachineState,
  type TransitionResult,
} from "@defied/prism-core";

export type MachineInput<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
> =
  | Machine<TStatus, TData, TEvent>
  | MachineDefinition<TStatus, TData, TEvent>
  | (() =>
      | Machine<TStatus, TData, TEvent>
      | MachineDefinition<TStatus, TData, TEvent>);

export interface UseMachineReturn<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
> {
  readonly state: Readonly<ShallowRef<Readonly<MachineState<TStatus, TData>>>>;
  readonly status: ComputedRef<TStatus>;
  readonly data: ComputedRef<TData>;
  readonly send: (event: TEvent) => TransitionResult<TStatus, TData>;
  readonly machine: Readonly<ShallowRef<Machine<TStatus, TData, TEvent>>>;
  readonly isActive: (targetStatus: TStatus | TStatus[]) => boolean;
}

function instantiate<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
>(input: MachineInput<TStatus, TData, TEvent>) {
  const resolved = typeof input === "function" ? input() : input;
  return resolved instanceof Machine ? resolved : new Machine(resolved);
}

/**
 * Binds a Machine to the current component (or effect scope). The machine is
 * created once; when `key` changes it is replaced with a fresh one. Disposing
 * the scope only unsubscribes; the machine is not destroyed, matching the
 * React adapter.
 */
export function useMachine<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
>(
  input: MachineInput<TStatus, TData, TEvent>,
  key?: MaybeRefOrGetter<string | number | undefined>,
): UseMachineReturn<TStatus, TData, TEvent> {
  const machine = shallowRef(instantiate(input));
  const state = shallowRef(machine.value.getState());

  let unsubscribe = machine.value.subscribe((next) => (state.value = next));

  if (key !== undefined) {
    watch(
      () => toValue(key),
      () => {
        unsubscribe();
        const next = instantiate(input);
        machine.value = next;
        state.value = next.getState();
        unsubscribe = next.subscribe((snapshot) => (state.value = snapshot));
      },
    );
  }

  if (getCurrentScope()) onScopeDispose(() => unsubscribe());

  const send = (event: TEvent) => machine.value.send(event);
  const isActive = (target: TStatus | TStatus[]) =>
    Array.isArray(target)
      ? target.includes(state.value.status)
      : target === state.value.status;

  return {
    state,
    status: computed(() => state.value.status),
    data: computed(() => state.value.data),
    send,
    machine,
    isActive,
  };
}
