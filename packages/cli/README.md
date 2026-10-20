# @defied/prism-cli

Add accessible React and Vue components to your project as source code you own. Each component is generated from one design-token recipe into **Tailwind CSS**, **CSS Modules** or **plain CSS**, and every framework target passes the same contract tests.

## Quick start

```sh
# 1. Create prism.json (React is the default)
npx @defied/prism-cli init                    # or: init --framework vue

# 2. Install the runtime the generated components import
npm install @defied/prism-tokens @defied/prism-core @defied/prism-react   # or @defied/prism-vue

# 3. Add components
npx prism add button
npx prism add dialog
```

Load the design tokens once, in your global stylesheet:

```css
@import "tailwindcss";                        /* Tailwind styling only */
@import "@defied/prism-tokens/tokens.css";
@import "@defied/prism-tokens/tailwind.css";  /* Tailwind styling only, after tailwindcss */
```

Components are written to `src/components/ui` by default. Edit them freely; they are yours.

## Commands

| Command | What it does |
| --- | --- |
| `prism init [--framework react\|vue]` | Creates `prism.json` for the project. |
| `prism add <component> [--style tailwind\|css-modules\|css]` | Generates a component, plus any Prism components it depends on. |
| `prism sync [--style ...]` | Regenerates every installed component, for example after upgrading the CLI or switching styling. Overwrites local edits. |
| `prism theme --primary <color> [--dark-primary <color>] [--out <file>]` | Generates a CSS file that re-themes Prism from your brand colours (hex, `rgb()` or `oklch()`). Default output: `src/prism-theme.css`. |

`add` and `sync` also take `--registry <path|url>` to install from a registry other than the one bundled with the CLI.

## Components

Alert, Avatar, Badge, Box, Breadcrumb, Button, Calendar, Card, Checkbox, Code, Combobox, Command Palette, Container, Data Table, Dialog, Divider, Drawer, Dropdown Menu, Empty State, Field, Form, Grid, Heading, Icon Button, Inline, Input, Label, Link, Pagination, Popover, Progress, Radio Group, Select, Skeleton, Slider, Spinner, Stack, Surface, Switch, Table, Tabs, Text, Textarea, Toast, Tooltip and Visually Hidden, for both React (18+) and Vue (3.4+).

## Requirements

Node.js 20 or later.

## License

MIT
