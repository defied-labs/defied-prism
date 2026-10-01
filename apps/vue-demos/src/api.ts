/** The island's public API: plain TypeScript, so React hosts can type-check against it. */
export const DEMOS = ["button", "field", "select", "dialog", "toast", "calendar", "data-table"] as const;

export type DemoName = (typeof DEMOS)[number];

export interface MountedDemo {
  /** Replace the demo's props (e.g. variant/size from the host's controls). */
  update(props: Record<string, unknown>): void;
  unmount(): void;
}

export type Mount = (el: Element, name: DemoName, props?: Record<string, unknown>) => MountedDemo;

/** Typed entry for hosts; resolved to the built bundle at runtime. */
export declare const mount: Mount;
