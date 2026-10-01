import { z } from "zod";

/**
 * The component contract: what a Prism component guarantees independent of
 * framework and CSS target. Adapters and generated components are tested
 * against it (see packages/cli/test/contract.test.tsx).
 */

const kebab = /^[a-z][a-z0-9-]*$/;
const camel = /^[a-z][a-zA-Z0-9]*$/;

const EnumProp = z
  .object({
    type: z.literal("enum"),
    values: z.array(z.string().regex(kebab)).min(1),
    default: z.string(),
    /** Visual props are recipe variant dimensions and reflected as data-* (default true). */
    visual: z.boolean().default(true),
    description: z.string().optional(),
  })
  .refine((p) => p.values.includes(p.default), {
    message: "default must be one of values",
  });

const BooleanProp = z.object({
  type: z.literal("boolean"),
  default: z.boolean().default(false),
  description: z.string().optional(),
});

const Slot = z.object({
  element: z.string().regex(/^[a-z][a-z0-9]*$/),
  role: z.string().optional(),
  /** Only rendered in some states (e.g. an empty-results message). */
  optional: z.boolean().default(false),
});

export const ContractSchema = z.object({
  /** HTML element of the anchor slot. */
  element: z.string().regex(/^[a-z][a-z0-9]*$/),
  /**
   * The slot that carries the ARIA role and the variant data-* attributes
   * (e.g. a dialog's content). Defaults to the root.
   */
  anchor: z.string().regex(camel).default("root"),
  /**
   * Every slot the component renders, each marked in the DOM with
   * `data-slot="<component>"` (root) or `data-slot="<component>-<slot>"`.
   */
  slots: z.record(z.string().regex(camel), Slot).optional(),
  /** Visual and behavioral props. Enum props are recipe variant dimensions. */
  props: z.record(z.string().regex(camel), z.union([EnumProp, BooleanProp])),
  /** Values the anchor's `data-state` attribute can take (empty: it has none). */
  states: z.array(z.string().regex(camel)),
  /** Named `data-part` slots the component renders or accepts. */
  parts: z.array(z.string().regex(kebab)),
  keyboard: z.array(
    z.object({
      keys: z.array(z.string()).min(1),
      action: z.string(),
      description: z.string().optional(),
    }),
  ),
  aria: z.object({
    /** The anchor's role; "none" for elements with no implicit role (e.g. <label>). */
    role: z.string(),
    /** ARIA attributes the component manages itself. */
    attributes: z.array(z.string().regex(/^aria-[a-z]+$/)),
  }),
});

export type ComponentContract = z.infer<typeof ContractSchema>;

export function validateContract(data: unknown, component: string): ComponentContract {
  const result = ContractSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - contract.${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`[prism] Component "${component}" has an invalid contract:\n${issues}`);
  }
  return result.data;
}
