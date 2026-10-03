# Defied Prism

Defied Prism is a multi-framework component engine and state machine architecture built for modern UI development.

## Features

- **Multi-Framework Generators**: Code generation for React and Vue, every component on both, each passing the same contract tests. `prism init --framework vue` sets a project up for Vue.
- **Three Styling Targets**: One `defineRecipe` per component compiles to **Tailwind CSS**, **CSS Modules** or **plain CSS**.
- **State Machine Core**: Headless, state-driven UI logic using per-mount machine definition instances.
- **CLI Registry**: Command-line generator with built-in TypeScript transpilation (via Sucrase) for dynamic registry style evaluation.

## Styling Targets

Defied Prism uses a single DSL (`defineRecipe`) to compile components into Tailwind CSS utility strings, scoped CSS Modules files or plain CSS:

- **Tailwind Engine**: Maps spacing scale steps (`4`, `rem(1)`, `px(16)`) to Tailwind utilities (e.g. `px-4`, `py-2`).
- **CSS Modules Engine**: Compiles typed lengths into explicit CSS property declarations (`padding-left: 1rem;`).

> **Engine Limitations & Trade-offs**:
> While common layout properties, colors, pseudo-states (`:hover`, `:focus-visible`), and spacing steps map cleanly between Tailwind and CSS Modules, arbitrary raw CSS strings or non-standard utility tokens may require explicit engine targeting. Using structured length helpers (`rem`, `px`) ensures cross-engine compatibility across both output targets.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Run the showcase site (generates its code samples with the real CLI, builds the Vue demo island, then starts Next.js on port 3001):

```bash
pnpm run dev
```

Check types across workspace:

```bash
pnpm run check-types
```

## License

MIT
