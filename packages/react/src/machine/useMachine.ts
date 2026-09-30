import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
  readonly isDestroyed: boolean;
}

export function useMachine<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
>(
  input: MachineInput<TStatus, TData, TEvent>,
  key?: string | number,
): UseMachineReturn<TStatus, TData, TEvent> {
  const machineRef = useRef<Machine<TStatus, TData, TEvent> | null>(null);
  const inputRef = useRef(input);

  const stableKey = useMemo(() => {
    if (key !== undefined) return key;
    const res = typeof input === "function" ? input() : input;
    if (res instanceof Machine) {
      return (
        res.constructor.name + "-" + JSON.stringify(res.getDefinition?.() ?? {})
      );
    }
    return "machine-" + JSON.stringify(res);
  }, [key, input]);

  const inputChanged = !Object.is(inputRef.current, input);
  inputRef.current = input;

  const machine = useMemo(() => {
    if (machineRef.current && !inputChanged && key === undefined) {
      return machineRef.current;
    }

    const res = typeof input === "function" ? input() : input;
    const newMachine =
      res instanceof Machine ? res : new Machine<TStatus, TData, TEvent>(res);
    machineRef.current = newMachine;
    return newMachine;
  }, [stableKey, inputChanged]);

  const [state, setState] = useState<MachineState<TStatus, TData>>(() =>
    machine.getState(),
  );

  // Use ref for latest state to avoid stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(machine.getState());
    const unsubscribe = machine.subscribe((newState) => {
      // Only update if component is still mounted
      if (stateRef.current.status !== "destroyed") {
        setState(newState);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [machine]);

  const isActive = useCallback(
    (targetStatus: TStatus | TStatus[]): boolean => {
      if (Array.isArray(targetStatus)) {
        return targetStatus.includes(state.status);
      }
      return state.status === targetStatus;
    },
    [state.status],
  );

  const send = useCallback(
    (event: TEvent): TransitionResult<TStatus, TData> => {
      return machine.send(event);
    },
    [machine],
  );

  return {
    state,
    status: state.status,
    data: state.data,
    send,
    machine,
    isActive,
    isDestroyed: machine.getLifecycleStatus() === "destroyed",
  };
}
