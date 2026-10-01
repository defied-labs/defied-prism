import type { ReactElement } from "react";

/** A generated component module, e.g. { Button, ButtonIcon }. */
export type GeneratedModule = Record<string, any>;

/**
 * How the contract harness renders a registry component. `props` go to the
 * part that owns the contract's anchor slot (variants, className, …).
 * Render everything the contract declares (open overlays, visible slots).
 */
export type Fixture = (m: GeneratedModule, props: Record<string, unknown>) => ReactElement;
