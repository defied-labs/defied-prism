import { useCallback, useState, useSyncExternalStore } from "react";
import {
  Machine,
  type MachineDefinition,
  type MachineEvent,
  type MachineState,
  type TransitionResult,
} from "@defied-prism/core";

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
  readonly state: Readonly<MachineState<TStatus, TData>>;
  readonly status: TStatus;
  readonly data: TData;
  readonly send: (event: TEvent) => TransitionResult<TStatus, TData>;
  readonly machine: Machine<TStatus, TData, TEvent>;
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
 * Binds a Machine to a component. The machine is created once per component
 * instance (inline definitions are fine); pass a different `key` to replace it.
 * Unmounting only unsubscribes; the machine is not destroyed, because
 * StrictMode remounts components and would otherwise get a dead machine.
 */
export function useMachine<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
>(
  input: MachineInput<TStatus, TData, TEvent>,
  key?: string | number,
): UseMachineReturn<TStatus, TData, TEvent> {
  const [entry, setEntry] = useState(() => ({
    key,
    machine: instantiate(input),
  }));

  let { machine } = entry;
  if (entry.key !== key) {
    // Recreate during render (React's "adjust state on prop change" pattern)
    machine = instantiate(input);
    setEntry({ key, machine });
  }

  const state = useSyncExternalStore(
    machine.subscribe,
    machine.getState,
    machine.getState,
  );

  const send = useCallback((event: TEvent) => machine.send(event), [machine]);

  const isActive = useCallback(
    (target: TStatus | TStatus[]) =>
      Array.isArray(target)
        ? target.includes(state.status)
        : target === state.status,
    [state.status],
  );

  return {
    state,
    status: state.status,
    data: state.data,
    send,
    machine,
    isActive,
  };
}
