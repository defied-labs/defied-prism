import { defineRecipe, token as t } from "@defied/prism-style-engine";

// Layout, borders, hover, padding (via Table density) and the checkbox look
// come from the composed Table and Checkbox; these are data-table deltas only.
export default defineRecipe({
  name: "data-table",
  base: {},
  slots: {
    // Rendered by Table, which styles it (and gives it `<slot>-scroll`)
    scroll: {},
    // Above the table, unlike Table's bottom caption
    caption: { captionSide: "top", marginTop: "0", paddingBlock: t("space.2") },
    headerCell: { borderBottomColor: t("color.border-strong") },
    // Rendered by the registry Button (ghost); this only styles the sort icon
    sortButton: {
      "part:sort-icon": { fontSize: t("text.xs"), color: t("color.muted-fg") },
    },
    row: { _selected: { background: t("color.muted") } },
    cell: {},
    // A <th scope="row"> cell (columns with `rowHeader`)
    rowHeader: { fontWeight: t("weight.medium"), color: t("color.fg"), whiteSpace: "normal" },
    // Rendered by the registry Checkbox
    checkbox: {},
  },
  variants: {
    // sm maps to Table density "compact", md to "normal"
    size: { sm: {}, md: {} },
  },
  defaultVariants: { size: "md" },
});
