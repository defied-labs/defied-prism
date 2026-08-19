import { Machine } from "./Machine";
import type { MachineDefinition } from "./types";

export function createMachine<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
>(
  definition: MachineDefinition<TStatus, TData, TEvent>,
): Machine<TStatus, TData, TEvent> {
  return new Machine(definition);
}
