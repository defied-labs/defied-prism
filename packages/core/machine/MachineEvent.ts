/**
 * Typed event definitions for type-safe state machines.
 * Each machine defines its own event types for full type safety.
 */

export interface MachineEvent<
  TType extends string,
  TPayload extends Record<string, unknown> | void = void,
> {
  readonly type: TType;
  readonly payload: TPayload;
}

/**
 * Helper to create a typed event constructor
 */
export function createEvent<
  TType extends string,
  TPayload extends Record<string, unknown>,
>(type: TType, payload: TPayload): MachineEvent<TType, TPayload> {
  return { type, payload } as const;
}

/**
 * Helper for events with no payload
 */
export function createSimpleEvent<TType extends string>(
  type: TType,
): MachineEvent<TType, void> {
  return { type, payload: undefined as any } as const;
}

/**
 * Type-safe event matcher for use in guards/reducers
 */
export function isEvent<TEvent extends MachineEvent>(
  event: MachineEvent,
  type: TEvent["type"],
): event is TEvent {
  return event.type === type;
}

/**
 * Type alias for events with void payload - for convenience
 */
export type VoidEvent<TType extends string> = MachineEvent<TType, void>;

/**
 * Type alias for events with payload - for convenience
 */
export type PayloadEvent<
  TType extends string,
  TPayload extends Record<string, unknown>,
> = MachineEvent<TType, TPayload>;
