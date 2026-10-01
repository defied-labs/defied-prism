import { defineRecipe, token as t } from "@defied-prism/style-engine";

const focusRing = {
  outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
  outlineOffset: t("focus.ring-offset"),
};

export default defineRecipe({
  name: "calendar",
  base: {
    display: "inline-flex",
    flexDirection: "column",
    gap: t("space.2"),
    fontFamily: t("font.sans"),
    color: t("color.fg"),
    _ariaDisabled: { opacity: t("opacity.disabled") },
  },
  slots: {
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t("space.2"),
    },
    heading: {
      fontSize: t("text.sm"),
      fontWeight: t("weight.semibold"),
      lineHeight: t("leading.tight"),
    },
    // Previous/next month are Prism IconButtons sized from `size`; the slot only lays them out
    navButton: {
      flexShrink: "0",
    },
    grid: {
      borderCollapse: "collapse",
    },
    weekday: {
      fontSize: t("text.xs"),
      fontWeight: t("weight.medium"),
      color: t("color.muted-fg"),
      textAlign: "center",
    },
    cell: {
      position: "relative",
      textAlign: "center",
      borderRadius: t("radius.md"),
      cursor: "pointer",
      _hoverAny: { background: t("color.ghost-hover") },
      _focusVisible: focusRing,
      _selected: { background: t("color.primary"), color: t("color.primary-fg") },
      _ariaDisabled: { opacity: t("opacity.disabled"), cursor: "not-allowed", textDecoration: "line-through" },
      "part:today": {
        position: "absolute",
        insetInline: "0",
        bottom: "2px",
        marginInline: "auto",
        width: "4px",
        height: "4px",
        borderRadius: t("radius.full"),
        background: "currentColor",
      },
    },
  },
  variants: {
    size: {
      sm: {
        "slot:cell": { width: t("control.sm"), height: t("control.sm"), fontSize: t("text.xs") },
      },
      md: {
        "slot:cell": { width: t("control.md"), height: t("control.md"), fontSize: t("text.sm") },
      },
    },
  },
  defaultVariants: { size: "md" },
});
