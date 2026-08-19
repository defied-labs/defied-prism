/**
 * Completely redesigned type system for deterministic, typed state machines.
 *
 * Key principles:
 * - MachineStatus is per-machine, not a global loose union
 * - MachineState has explicit typed data schema (no Record<string, unknown>)
 * - Transitions have explicit metadata: guard, reducer, target, description
 * - No silent no-op behavior - invalid transitions throw in dev, error in prod
 * - "destroyed" is terminal and not part of active transition logic
 */

// ============================================
// Core Machine Types
// ============================================

/**
 * Status type is intentionally NOT a global union.
 * Each machine defines its own status type for type safety.
 */
export type MachineStatus<TStatus extends string = string> = TStatus;

/**
 * MachineState with strongly typed data - no loose Record<string, unknown>
 */
export interface MachineState<
  TStatus extends string = string,
  TData = unknown,
> {
  readonly status: TStatus;
  readonly data: TData;
}

/**
 * MachineContext - shared read-only context across transitions
 */
export interface MachineContext {
  readonly [key: string]: unknown;
}

/**
 * Typed machine event with discriminated payload
 */
export interface MachineEvent<
  TType extends string = string,
  TPayload extends Record<string, unknown> | void = void,
> {
  readonly type: TType;
  readonly payload: TPayload;
}

/**
 * Transition metadata for debugging and introspection
 */
export interface TransitionMetadata {
  readonly description?: string;
  readonly tags?: readonly string[];
}

/**
 * Strongly typed transition with explicit all fields
 */
export interface MachineTransition<
  TStatus extends string = string,
  TData = unknown,
  TEvent extends MachineEvent<string, Record<string, unknown> | void> =
    MachineEvent,
> {
  readonly from: readonly TStatus[];
  readonly event: TEvent["type"];
  readonly to: TStatus;
  readonly metadata?: TransitionMetadata;

  /**
   * Guard - pure function that determines if transition should fire
   * Return true to allow, false to skip to next matching transition
   */
  readonly guard?: (
    state: Readonly<MachineState<TStatus, TData>>,
    context: Readonly<MachineContext>,
    event: TEvent,
  ) => boolean;

  /**
   * Reducer - pure function that produces next state data
   * No mutation allowed - return new data object
   */
  readonly reducer?: (
    state: Readonly<MachineState<TStatus, TData>>,
    context: Readonly<MachineContext>,
    event: TEvent,
  ) => TData;
}

/**
 * Complete machine definition with validation at construction time
 */
export interface MachineDefinition<
  TStatus extends string = string,
  TData = unknown,
  TEvent extends MachineEvent<string, Record<string, unknown> | void> =
    MachineEvent,
> {
  /** All valid states in this machine (including initial) */
  readonly states: readonly TStatus[];

  /** Initial state with typed data */
  readonly initialState: MachineState<TStatus, TData>;

  /** Optional shared context */
  readonly context?: MachineContext;

  /** All transitions - validated for completeness and unambiguity */
  readonly transitions: readonly MachineTransition<TStatus, TData, TEvent>[];
}

/**
 * Result of a transition attempt
 */
export type TransitionResult<TStatus extends string, TData> =
  | { readonly success: true; readonly state: MachineState<TStatus, TData> }
  | { readonly success: false; readonly error: MachineError };

/**
 * Machine error types for explicit error handling
 */
export type MachineError =
  | {
      readonly code: "NO_TRANSITION";
      readonly state: string;
      readonly event: string;
    }
  | {
      readonly code: "GUARD_REJECTED";
      readonly state: string;
      readonly event: string;
    }
  | { readonly code: "MACHINE_DESTROYED" }
  | { readonly code: "INVALID_DEFINITION"; readonly message: string };

/**
 * Machine status for external consumption
 */
export type MachineStatusEnum = "active" | "destroyed";
