import {
  type MachineDefinition,
  type MachineEvent,
  type MachineState,
  type MachineContext,
  type MachineTransition,
  type TransitionResult,
  type MachineError,
  type MachineStatusEnum,
} from "./types";

type Subscriber<TStatus extends string, TData = unknown> = (
  state: MachineState<TStatus, TData>,
) => void;

/**
 * Validates machine definition at construction time.
 * Throws if definition is invalid - fail fast, no silent failures.
 */
export function validateMachineDefinition<
  TStatus extends string,
  TData = unknown,
  TEvent extends MachineEvent<string, any> = MachineEvent<string, any>,
>(definition: MachineDefinition<TStatus, TData, TEvent>): void {
  if (!definition || typeof definition !== "object") {
    throw new Error("[Machine] Definition must be an object.");
  }

  if (
    !definition.initialState ||
    typeof definition.initialState.status !== "string"
  ) {
    throw new Error(
      "[Machine] Machine definition must specify a valid initialState with status.",
    );
  }

  // Validate initial state
  if (
    !definition.initialState ||
    typeof definition.initialState.status !== "string"
  ) {
    throw new Error(
      "[Machine] Machine definition must specify a valid initialState with status.",
    );
  }

  // Initial state must be in declared states
  if (!definition.states.includes(definition.initialState.status)) {
    throw new Error(
      `[Machine] Initial state "${definition.initialState.status}" not declared in states array.`,
    );
  }

  // Validate data matches expected type (shallow check)
  if (
    definition.initialState.data === undefined ||
    definition.initialState.data === null
  ) {
    throw new Error("[Machine] initialState.data must be defined.");
  }

  if (!Array.isArray(definition.transitions)) {
    throw new Error(
      "[Machine] Machine definition transitions must be an array.",
    );
  }
  if (definition.transitions.length === 0) {
    throw new Error(
      "[Machine] Machine definition must have at least one transition.",
    );
  }

  const declaredStates = new Set<TStatus>(definition.states);

  // Collect all referenced states and validate structure
  for (const tr of definition.transitions) {
    if (!tr.event || typeof tr.event !== "string") {
      throw new Error(
        "[Machine] Every transition must specify a string event type.",
      );
    }
    if (!tr.to || typeof tr.to !== "string") {
      throw new Error(
        `[Machine] Transition for event "${tr.event}" must specify a target "to" state.`,
      );
    }

    const fromStates = Array.from(tr.from) as TStatus[];
    if (fromStates.length === 0) {
      throw new Error(
        `[Machine] Transition for event "${tr.event}" has empty "from" list.`,
      );
    }

    // All 'from' states must be declared
    for (const fromState of fromStates) {
      if (!declaredStates.has(fromState)) {
        throw new Error(
          `[Machine] Transition for event "${tr.event}" references undeclared 'from' state "${fromState}".`,
        );
      }
    }

    // 'to' state must be declared
    if (!declaredStates.has(tr.to)) {
      throw new Error(
        `[Machine] Transition for event "${tr.event}" targets undeclared 'to' state "${tr.to}".`,
      );
    }

    // Guard and reducer are both optional - if neither provided, state data is preserved
    // This is valid for simple state-only transitions
  }

  // Check for ambiguous transitions: same (from, event) without guards
  const seenKeys = new Map<string, number>(); // key -> transition index
  for (let i = 0; i < definition.transitions.length; i++) {
    const tr = definition.transitions[i];
    const fromStates = Array.from(tr.from);
    for (const fromState of fromStates) {
      const key = `${fromState}:${tr.event}`;
      if (!tr.guard) {
        if (seenKeys.has(key)) {
          throw new Error(
            `[Machine] Ambiguous transition: state "${fromState}" + event "${tr.event}" ` +
              `matches multiple unguarded transitions (indices ${seenKeys.get(key)} and ${i}). ` +
              `Add guards to disambiguate.`,
          );
        }
        seenKeys.set(key, i);
      }
    }
  }

  // Verify every state has at least one outgoing transition or is terminal
  // (optional but good for completeness)
  for (const state of definition.states) {
    const hasOutgoing = definition.transitions.some((tr) =>
      Array.from(tr.from).includes(state),
    );
  }
}

export class Machine<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
> {
  readonly #definition: MachineDefinition<TStatus, TData, TEvent>;
  #state: MachineState<TStatus, TData>;
  readonly #context: MachineContext;
  #isDestroyed = false;
  #status: MachineStatusEnum = "active";

  readonly #subscribers = new Set<Subscriber<TStatus, TData>>();

  constructor(definition: MachineDefinition<TStatus, TData, TEvent>) {
    validateMachineDefinition(definition);

    this.#definition = definition;
    this.#state = structuredClone(definition.initialState);
    this.#context = structuredClone(definition.context ?? {});
  }

  /** Get current state snapshot (read-only) */
  getState(): Readonly<MachineState<TStatus, TData>> {
    return structuredClone(this.#state);
  }

  /** Get current status */
  getStatus(): TStatus {
    return this.#state.status;
  }

  /** Get the machine definition */
  getDefinition(): MachineDefinition<TStatus, TData, TEvent> {
    return this.#definition;
  }

  /** Get machine lifecycle status */
  getLifecycleStatus(): MachineStatusEnum {
    return this.#status;
  }

  /** Check if machine is active (not destroyed) */
  isActive(): boolean {
    return this.#status === "active";
  }

  /**
   * Send an event to the machine.
   * Returns TransitionResult for explicit error handling.
   * Throws in development for invalid transitions, returns error in production.
   */
  send(event: TEvent): TransitionResult<TStatus, TData> {
    if (this.#status === "destroyed") {
      const error: MachineError = { code: "MACHINE_DESTROYED" };
      if (
        typeof process !== "undefined" &&
        process.env?.NODE_ENV !== "production"
      ) {
        throw new Error("[Machine] Cannot send event to a destroyed machine.");
      }
      return { success: false, error };
    }

    const currentStatus = this.#state.status;
    const matchingTransitions = this.#definition.transitions.filter((tr) => {
      if (tr.event !== event.type) return false;
      return Array.from(tr.from).includes(currentStatus);
    });

    if (matchingTransitions.length === 0) {
      const error: MachineError = {
        code: "NO_TRANSITION",
        state: currentStatus,
        event: event.type,
      };
      if (
        typeof process !== "undefined" &&
        process.env?.NODE_ENV !== "production"
      ) {
        throw new Error(
          `[Machine] No transition found for event "${event.type}" in state "${currentStatus}".`,
        );
      }
      return { success: false, error };
    }

    // Evaluate guards in order - first match wins
    let selected: MachineTransition<TStatus, TData, TEvent> | null = null;
    for (const tr of matchingTransitions) {
      if (!tr.guard || tr.guard(this.getState(), this.#context, event)) {
        selected = tr;
        break;
      }
    }

    if (!selected) {
      const error: MachineError = {
        code: "GUARD_REJECTED",
        state: currentStatus,
        event: event.type,
      };
      if (
        typeof process !== "undefined" &&
        process.env?.NODE_ENV !== "production"
      ) {
        throw new Error(
          `[Machine] Guard condition rejected transition for event "${event.type}" in state "${currentStatus}".`,
        );
      }
      return { success: false, error };
    }

    // Pure reducer execution - no mutation
    let nextData: TData;
    if (selected.reducer) {
      nextData = selected.reducer(this.getState(), this.#context, event);
    } else {
      // No reducer specified - keep current data
      nextData = structuredClone(this.#state.data);
    }

    this.#state = {
      status: selected.to,
      data: nextData,
    };

    this.#notify();
    return { success: true, state: this.getState() };
  }

  /** Reset machine to initial state */
  reset(): void {
    if (this.#status === "destroyed") {
      throw new Error("[Machine] Cannot reset a destroyed machine.");
    }
    this.#state = structuredClone(this.#definition.initialState);
    this.#notify();
  }

  /** Subscribe to state changes */
  subscribe(subscriber: Subscriber<TStatus, TData>): () => void {
    if (this.#status === "destroyed") {
      return () => {}; // No-op for destroyed machine
    }
    this.#subscribers.add(subscriber);
    return () => {
      this.#subscribers.delete(subscriber);
    };
  }

  /** Destroy machine - terminal state, prevents further sends */
  destroy(): void {
    if (this.#status === "destroyed") return; // Idempotent
    this.#status = "destroyed";
    this.#state = {
      ...this.#state,
      status: "destroyed" as TStatus,
    } as MachineState<TStatus, TData>;
    this.#subscribers.clear();
  }

  #notify(): void {
    const snapshot = this.getState();
    this.#subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}
