# Adding a component to the Defied Prism registry

A Prism component is a **contract**, a **recipe** and one **template per
framework**. The contract says what the component guarantees; the recipe
says how it looks in terms of design tokens; the template implements the
behavior for one framework. Tests prove all three agree, in every CSS target
(Tailwind, CSS Modules, plain CSS).

Study `tabs/`, `dialog/` and `combobox/` before starting: they are the
reference implementations.

## Layout

```
packages/core/components/<name>/        kebab-case, one registry item
  manifest.json                          metadata + contract (+ derived tokens)
  recipe.ts                              styles, compiled to recipe.json
  recipe.json                            GENERATED - never edit
  templates/react/<Name>.tsx             the React adapter
  index.ts                               optional: framework-agnostic logic
  <name>.machine.ts                      optional: state machine

packages/cli/test/fixtures/<name>.ts     how the contract harness renders it
packages/cli/test/components/<name>.test.tsx   behavior tests
```

`index.ts` is only for logic a Vue/Svelte/Web Component adapter would reuse
(state machines, filtering, date math). It is published automatically as
`@defied-labs/prism-core/components/<name>`. Do not add it to
`components/index.ts` or `package.json`; subpath exports are automatic.

## 1. Recipe (`recipe.ts`)

```ts
import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

export default defineRecipe({
  name: "switch",
  base: { display: "inline-flex", gap: t("space.2") },          // root slot
  slots: { track: { ... }, thumb: { ... } },                     // other slots (camelCase)
  variants: {
    size: {
      sm: { "slot:track": { width: "2rem" } },                   // target a slot
      md: { "slot:track": { width: "2.5rem" } },
    },
  },
  defaultVariants: { size: "md" },
});
```

Rules the compiler enforces (it will fail the build otherwise):

- **Values are tokens or literal CSS.** Use `t("color.primary")` for anything
  the design system owns (color, space, radius, type, motion, z-index,
  shadows, focus ring). Literal CSS is fine for structural values
  (`"100%"`, `"flex"`, `"0"`). Token list: `packages/tokens/src/tokens.ts`.
- **One owner per property.** A property on an element+state is set by
  `base` *or* one variant dimension, never both.
- **Longhands only when mixing.** Never set `border` and `borderColor` (or
  `padding` and `paddingInline`) on the same element and state.
- **States** are `_hover _hoverAny _active _focus _focusVisible _disabled
  _focusWithin _expanded _ariaDisabled _loading _open _closed _checked _indeterminate
  _current _selected _highlighted _invalid _even _horizontal _vertical
  _placeholder`. `_current` matches `aria-current`; `_even` is
  `:nth-child(even)`: never number children in JS for styling. `_hover` only
  matches enabled form controls; use `_hoverAny` for links, rows and other
  non-form elements. `_checked` matches `:checked` and `aria-checked="true"`.
  A state styles only the element it's on: to style child slots from the
  root's state, set a custom property in the state and read it in the child
  (see switch). Add one to `style-engine/src/recipe/types.ts` only
  if it maps to a stable attribute selector in both CSS and Tailwind.
- **Parts** (`"part:icon"`) style `[data-part="icon"]` descendants.
- Cross-dimension styling (e.g. line variant x vertical orientation): set a
  CSS custom property in one dimension, read it in the other (see tabs).
- Every interactive element needs a visible `_focusVisible` style.
- Animations use the shared keyframes in tokens.css (`prism-spin`,
  `prism-fade-in`, `prism-scale-in`, `prism-pulse`, `prism-indeterminate`,
  `prism-slide-in` with `--prism-slide-x/-y`) and `duration.*` / `easing.*` tokens,
  which collapse under reduced motion.
- Don't set `display` on an element that uses the `hidden` attribute.

Build: `pnpm --filter @defied-labs/prism-core build:registry <name>` validates the
recipe and writes `recipe.json` and the manifest's `tokens`.

## 2. Manifest (`manifest.json`)

Copy `tabs/manifest.json` and change `metadata`, `contract`, the
`compatibility.frameworks[].files` entry and `registryPath`. Leave `tokens`
as `[]`: the build fills it. Add `react-dom` as a peerDependency only if the
template imports it.

The `contract`:

| field | meaning |
| --- | --- |
| `element` | HTML element of the anchor slot |
| `anchor` | slot that carries the ARIA role and variant `data-*` (default `root`) |
| `slots` | every slot: `{ element, role?, optional? }`. `optional` = only rendered in some states |
| `props` | `enum` (with `values`, `default`, `visual?`) or `boolean`. Visual enums **must** be recipe variant dimensions with the same values and default |
| `states` | values of the anchor's `data-state` (`[]` if it has none) |
| `parts` | `data-part` names it renders |
| `keyboard` | `{ keys, action, description? }`; `action: "activate"` is tested generically |
| `aria` | `role` of the anchor (`"none"` for elements with no implicit role, like `<label>`) and the `aria-*` attributes the component manages itself |

Claim only what tests verify. A declared `disabled` prop is checked
generically: native controls must be `disabled` and swallow clicks; other
anchors must set `aria-disabled="true"`.

## 3. Template (`templates/react/<Name>.tsx`)

```tsx
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};
```

- `{{STYLE_SLOTS}}` is required and appears exactly once, bare.
- Every rendered slot element gets:
  - `data-slot="<name>"` for the root, `data-slot="<name>-<kebab-slot>"` otherwise
  - `{...variantData(variants)}` (variant data attributes; CSS targets select on them)
  - `className={slotClass(slots, "<slot>", variants, className)}`
- Import only from `react`, `react-dom` (portals), `@defied-labs/prism-react`,
  `@defied-labs/prism-core`, `@defied-labs/prism-core/components/<name>`, and other
  registry components as siblings (`import { Button } from "./Button"`).
  Every sibling must be listed in the manifest's `registryDependencies`
  (`["button"]`); `prism add` installs them first. A test enforces both
  directions.
- **Reuse, don't copy.** A part that *is* a button the consumer doesn't
  supply (close X, toast action, month arrows) renders `Button` /
  `IconButton`. Pass `data-slot="<name>-<slot>"` so the part stays
  identifiable; Button keeps a given `data-slot`. Button owns its
  `data-state` (loading/disabled), so style an open trigger with
  `_expanded` (`aria-expanded`), not `_open`.
- **Triggers** (dialog, drawer, popover, menu) render a `Button` by
  default, forwarding `variant`/`size`, and take `asChild` to render the
  consumer's element instead (a link, an icon, a menu item).
- `forwardRef` every element-rendering part; set `displayName`.
- Spread user props first, then your own attributes; **compose** user event
  handlers (call theirs, respect `event.defaultPrevented`) rather than
  overwriting them.
- Controlled + uncontrolled state: `useControllableState` from
  `@defied-labs/prism-react` (`value`/`defaultValue`/`onValueChange`,
  `open`/`defaultOpen`/`onOpenChange`, `checked`/`defaultChecked`/`onCheckedChange`).
- `asChild` triggers: `Slot` from `@defied-labs/prism-react`.
- Form controls: wrap your control's props with `useFieldControlProps`
  from `@defied-labs/prism-react` so they work inside `Field` (id, describedby,
  invalid, disabled, required).
- Behavior primitives in `@defied-labs/prism-core` (framework-agnostic, reuse
  them, don't reimplement): `trapFocus`, `onDismiss` (Escape/outside click,
  layered: only the topmost layer closes), `lockScroll`, `hideOthers`
  (makes the page inert behind modals), `nextIndex` (arrow/Home/End
  navigation with disabled skipping), `getFocusable`.
- A state machine (`@defied-labs/prism-core` `Machine`, `useMachine`) earns its
  place when there are real states with timing or ordering (tooltip,
  combobox). Plain state is fine otherwise. Machines are pure: timers live
  in the adapter.
- Follow the WAI-ARIA Authoring Practices pattern for the widget.
- Overlays that don't need a portal (popovers, menus) are absolutely
  positioned inside a `position: relative` root. No collision handling yet.
- SSR: don't touch `document` during render.

## API shape

- **Compound (children + context)** whenever the consumer controls structure
  or content: parts, items, options, groups (`<Select><SelectItem/>…`).
  Items register through context; never read `children` to find them.
- **Data / props** only where the component must compute over values:
  table columns (sorting needs them), pagination ranges, the imperative
  `toast()` call. Leaf components (Avatar, Spinner, Progress) take props.
- **Labels, descriptions and errors belong to `Field`**, not to each control.
  Exception: a checkbox, radio or switch takes its inline, clickable label
  as `children`; that's the native pattern, not a duplicate of Field.

## 4. Contract fixture (`packages/cli/test/fixtures/<name>.ts`)

```ts
import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) => h(m.Switch, { "aria-label": "Wi-Fi", ...props })) satisfies Fixture;
```

Render the component fully (open overlays, every non-optional slot) and
accessibly named. `props` belong on the part that owns the anchor slot. The
harness then checks role, slots, defaults, every variant value, className
forwarding, managed ARIA, parts, keyboard activation and **axe** in all
three CSS targets.

## 5. Behavior tests (`packages/cli/test/components/<name>.test.tsx`)

Copy the setup from `tabs.test.tsx` (use a unique `NAMESPACE`). Test the
APG keyboard interactions, controlled/uncontrolled behavior, focus
management, disabled handling and anything the contract can't express.
Use `@testing-library/user-event`; for timers, use fake timers with
`fireEvent` instead (see `tooltip.test.tsx`).

## Tailwind output

Tailwind classes are generated from the recipe: tokens become Prism's
namespaced utilities (`bg-prism-primary`, `px-prism-4`,
`rounded-prism-md`, from `@defied-labs/prism-tokens/tailwind.css`), common
literals become plain utilities (`flex`, `items-center`), anything else an
arbitrary property. `slotClass` merges consumer classes with
tailwind-merge, so `className="bg-red-500"` always wins.
`test/tailwind-compile.test.ts` compiles every class with real Tailwind.

## Commands

```sh
pnpm --filter @defied-labs/prism-core build:registry <name>        # compile recipe, derive tokens
cd packages/cli
PRISM_COMPONENTS=<name> npx vitest run test/contract.test.tsx  # contract, all CSS targets
npx vitest run test/components/<name>.test.tsx                 # behavior
PRISM_COMPONENTS=<name> npx vitest run test/registry-manifests.test.ts  # contract/recipe consistency
PRISM_COMPONENTS=<name> npx vitest run test/generated-types.test.ts     # generated code type-checks
```

Done means: the recipe builds, all five commands pass, no `any` in the
template's public props, and the manifest claims nothing untested.
