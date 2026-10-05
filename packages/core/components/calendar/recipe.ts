import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

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
      // Days drift into focus one after another; --prism-day-index is set inline
      // per day and the stagger is capped so long months don't lag
      animation: ["prism-float-in", t("duration.slow"), t("easing.emphasized"), `calc(min(var(--prism-day-index, 0), 24) * ${t("duration.fast")} / 12)`, "both"].join(" "),
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
    // Where the days float in from; month navigation overrides it inline
    enterFrom: {
      bottom: { "--prism-float-x": "0", "--prism-float-y": "0.5rem" },
      top: { "--prism-float-x": "0", "--prism-float-y": "-0.5rem" },
      left: { "--prism-float-x": "-0.75rem", "--prism-float-y": "0" },
      right: { "--prism-float-x": "0.75rem", "--prism-float-y": "0" },
    },
  },
  defaultVariants: { size: "md", enterFrom: "bottom" },
});
