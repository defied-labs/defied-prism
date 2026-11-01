import { defineRecipe, token as t } from "@defied/prism-style-engine";

const popup = {
  position: "absolute",
  zIndex: t("z.dropdown"),
  top: "100%",
  left: "0",
  right: "0",
  marginTop: t("space.1"),
  boxSizing: "border-box",
  borderRadius: t("radius.md"),
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: t("color.border"),
  background: t("color.bg"),
  boxShadow: t("shadow.lg"),
  animation: `prism-fade-in ${t("duration.fast")} ${t("easing.standard")}`,
} as const;

export default defineRecipe({
  name: "combobox",
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: t("space.1-5"),
    fontFamily: t("font.sans"),
    color: t("color.fg"),
  },
  slots: {
    // The input's look comes from the registry Input (size, fullWidth).
    input: {},
    listbox: {
      ...popup,
      padding: t("space.1"),
      maxHeight: "16rem",
      overflowY: "auto",
      // Unrolls down from the input, and rolls back up on close
      transformOrigin: "top",
      animation: `prism-roll-in ${t("duration.normal")} ${t("easing.standard")}`,
      _closed: {
        pointerEvents: "none",
        animation: `prism-roll-out ${t("duration.fast")} ${t("easing.exit")} forwards`,
      },
    },
    option: {
      display: "flex",
      alignItems: "center",
      paddingBlock: t("space.1-5"),
      paddingInline: t("space.2"),
      borderRadius: t("radius.sm"),
      fontSize: t("text.sm"),
      cursor: "pointer",
      userSelect: "none",
      _highlighted: { background: t("color.muted") },
      _selected: { fontWeight: t("weight.semibold") },
      _ariaDisabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
    },
    group: {},
    label: {
      paddingBlock: t("space.1-5"),
      paddingInline: t("space.2"),
      color: t("color.muted-fg"),
      fontSize: t("text.xs"),
      fontWeight: t("weight.semibold"),
    },
    empty: {
      ...popup,
      padding: t("space.2"),
      color: t("color.muted-fg"),
      fontSize: t("text.sm"),
    },
  },
  variants: {
    // Forwarded to Input; the parts carry data-size for custom styling.
    size: { sm: {}, md: {}, lg: {} },
  },
  defaultVariants: { size: "md" },
});
