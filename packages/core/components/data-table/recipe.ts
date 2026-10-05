import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

const focusRing = {
  outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
  outlineOffset: t("focus.ring-offset"),
};

export default defineRecipe({
  name: "data-table",
  base: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: t("font.sans"),
    color: t("color.fg"),
    lineHeight: t("leading.normal"),
  },
  slots: {
    scroll: {
      width: "100%",
      maxWidth: "100%",
      overflowX: "auto",
      borderRadius: t("radius.sm"),
      _focusVisible: focusRing,
    },
    caption: {
      captionSide: "top",
      textAlign: "start",
      paddingBlock: t("space.2"),
      color: t("color.muted-fg"),
      fontSize: t("text.sm"),
    },
    headerCell: {
      textAlign: "start",
      fontWeight: t("weight.semibold"),
      color: t("color.muted-fg"),
      whiteSpace: "nowrap",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: t("color.border-strong"),
    },
    sortButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: t("space.1"),
      padding: "0",
      borderWidth: "0",
      background: "transparent",
      color: "inherit",
      font: "inherit",
      cursor: "pointer",
      borderRadius: t("radius.sm"),
      _hover: { color: t("color.fg") },
      _focusVisible: focusRing,
      "part:sort-icon": { fontSize: t("text.xs"), color: t("color.muted-fg") },
    },
    row: {
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: t("color.border"),
      _hoverAny: { background: t("color.bg-subtle") },
      _selected: { background: t("color.muted") },
    },
    cell: {},
    // A <th scope="row"> cell (columns with `rowHeader`)
    rowHeader: { textAlign: "start", fontWeight: t("weight.medium") },
    checkbox: {
      margin: "0",
      accentColor: t("color.primary"),
      cursor: "pointer",
      _focusVisible: focusRing,
      _disabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
    },
  },
  variants: {
    size: {
      sm: {
        fontSize: t("text.sm"),
        "slot:headerCell": { paddingBlock: t("space.1-5"), paddingInline: t("space.2") },
        "slot:cell": { paddingBlock: t("space.1-5"), paddingInline: t("space.2") },
        "slot:rowHeader": { paddingBlock: t("space.1-5"), paddingInline: t("space.2") },
      },
      md: {
        fontSize: t("text.sm"),
        "slot:headerCell": { paddingBlock: t("space.3"), paddingInline: t("space.3") },
        "slot:cell": { paddingBlock: t("space.3"), paddingInline: t("space.3") },
        "slot:rowHeader": { paddingBlock: t("space.3"), paddingInline: t("space.3") },
      },
    },
  },
  defaultVariants: { size: "md" },
});
