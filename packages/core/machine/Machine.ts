import {
  type MachineDefinition,
  type MachineEvent,
  type MachineState,
  type MachineContext,
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

  if (!Array.isArray(definition.states)) {
    throw new Error("[Machine] Machine definition states must be an array.");
  }

  // Initial state must be in declared states
  if (!definition.states.includes(definition.initialState.status)) {
    throw new Error(
      `[Machine] Initial state "${definition.initialState.status}" not declared in states array.`,
    );
  }

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
    if (tr.from.length === 0) {
      throw new Error(
        `[Machine] Transition for event "${tr.event}" has empty "from" list.`,
      );
    }
    for (const fromState of tr.from) {
      if (!declaredStates.has(fromState)) {
        throw new Error(
          `[Machine] Transition for event "${tr.event}" references undeclared 'from' state "${fromState}".`,
        );
      }
    }
    if (!declaredStates.has(tr.to)) {
      throw new Error(
        `[Machine] Transition for event "${tr.event}" targets undeclared 'to' state "${tr.to}".`,
      );
    }
  }

  // Ambiguous transitions: same (from, event) with more than one unguarded entry
  const seenKeys = new Map<string, number>();
  definition.transitions.forEach((tr, i) => {
    if (tr.guard) return;
    for (const fromState of tr.from) {
      const key = `${fromState}:${tr.event}`;
      if (seenKeys.has(key)) {
        throw new Error(
          `[Machine] Ambiguous transition: state "${fromState}" + event "${tr.event}" ` +
            `matches multiple unguarded transitions (indices ${seenKeys.get(key)} and ${i}). ` +
            `Add guards to disambiguate.`,
        );
      }
      seenKeys.set(key, i);
    }
  });
}

/** Snapshots are shared by reference, so freeze them to keep reducers honest. */
function freezeState<TStatus extends string, TData>(
  state: MachineState<TStatus, TData>,
): MachineState<TStatus, TData> {
  if (state.data !== null && typeof state.data === "object") {
    Object.freeze(state.data);
  }
  return Object.freeze(state);
}

export class Machine<
  TStatus extends string,
  TData,
  TEvent extends MachineEvent<string, any>,
> {
  readonly #definition: MachineDefinition<TStatus, TData, TEvent>;
  #state: MachineState<TStatus, TData>;
  readonly #context: MachineContext;
  #status: MachineStatusEnum = "active";

  readonly #subscribers = new Set<Subscriber<TStatus, TData>>();

  constructor(definition: MachineDefinition<TStatus, TData, TEvent>) {
    validateMachineDefinition(definition);

    this.#definition = definition;
    this.#state = freezeState({ ...definition.initialState });
    this.#context = Object.freeze({ ...(definition.context ?? {}) });
  }

  /**
   * Current state snapshot. The same frozen object is returned until the
   * next transition, so it is safe to use with `useSyncExternalStore`.
   */
  getState = (): Readonly<MachineState<TStatus, TData>> => this.#state;

  getStatus(): TStatus {
    return this.#state.status;
  }

  getDefinition(): MachineDefinition<TStatus, TData, TEvent> {
    return this.#definition;
  }

  getLifecycleStatus(): MachineStatusEnum {
    return this.#status;
  }

  isActive(): boolean {
    return this.#status === "active";
  }

  /**
   * Send an event to the machine. Never throws: events that do not apply to
   * the current state are ignored and reported through the result.
   */
  send(event: TEvent): TransitionResult<TStatus, TData> {
    if (this.#status === "destroyed") {
      return { success: false, error: { code: "MACHINE_DESTROYED" } };
    }

    const current = this.#state;
    let sawCandidate = false;

    for (const tr of this.#definition.transitions) {
      if (tr.event !== event.type || !tr.from.includes(current.status)) {
        continue;
      }
      sawCandidate = true;
      if (tr.guard && !tr.guard(current, this.#context, event)) continue;

      const nextData = tr.reducer
        ? tr.reducer(current, this.#context, event)
        : current.data;
      this.#state = freezeState({ status: tr.to, data: nextData });
      this.#notify();
      return { success: true, state: this.#state };
    }

    const error: MachineError = {
      code: sawCandidate ? "GUARD_REJECTED" : "NO_TRANSITION",
      state: current.status,
      event: event.type,
    };
    return { success: false, error };
  }

  /** Reset machine to initial state */
  reset(): void {
    if (this.#status === "destroyed") {
      throw new Error("[Machine] Cannot reset a destroyed machine.");
    }
    this.#state = freezeState({ ...this.#definition.initialState });
    this.#notify();
  }

  /** Subscribe to state changes */
  subscribe = (subscriber: Subscriber<TStatus, TData>): (() => void) => {
    if (this.#status === "destroyed") {
      return () => {};
    }
    this.#subscribers.add(subscriber);
    return () => {
      this.#subscribers.delete(subscriber);
    };
  };

  /** Destroy machine - terminal lifecycle, prevents further sends */
  destroy(): void {
    if (this.#status === "destroyed") return;
    this.#status = "destroyed";
    this.#subscribers.clear();
  }

  #notify(): void {
    const snapshot = this.#state;
    this.#subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}
