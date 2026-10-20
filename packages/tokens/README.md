# @defied/prism-tokens

Design tokens for [Defied Prism](https://github.com/defied-labs/defied-prism), from one source:

- `@defied/prism-tokens/tokens.css`: every token as a CSS variable, a dark theme (`.dark`, `[data-theme="dark"]` or the OS preference), shared animation keyframes, and motion that collapses under `prefers-reduced-motion`.
- `@defied/prism-tokens/tailwind.css`: the tokens as Tailwind v4 theme values under a `prism-` namespace (`bg-prism-primary`, `px-prism-4`), so they never collide with your own theme. Import after `tailwindcss` and `tokens.css`.
- `@defied/prism-tokens/tokens.json`: the raw values.

```css
@import "tailwindcss";
@import "@defied/prism-tokens/tokens.css";
@import "@defied/prism-tokens/tailwind.css";
```

## License

MIT
