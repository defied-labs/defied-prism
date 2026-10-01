import { defineRecipe, token as t } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "tabs",
  base: {
    display: "flex",
    gap: t("space.3"),
    fontFamily: t("font.sans"),
  },
  slots: {
    list: {
      display: "flex",
      gap: t("space.1"),
    },
    trigger: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: t("space.2"),
      borderWidth: "0",
      background: "transparent",
      color: t("color.muted-fg"),
      fontFamily: "inherit",
      fontWeight: t("weight.medium"),
      lineHeight: t("leading.tight"),
      whiteSpace: "nowrap",
      cursor: "pointer",
      transition: [
        `color ${t("duration.fast")} ${t("easing.standard")}`,
        `background-color ${t("duration.fast")} ${t("easing.standard")}`,
        `box-shadow ${t("duration.fast")} ${t("easing.standard")}`,
      ].join(", "),
      _hover: { color: t("color.fg") },
      _selected: { color: t("color.fg") },
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
      _disabled: {
        opacity: t("opacity.disabled"),
        cursor: "not-allowed",
      },
    },
    panel: {
      borderRadius: t("radius.sm"),
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
    },
  },
  variants: {
    orientation: {
      // The line indicator sits under horizontal tabs and beside vertical ones
      horizontal: {
        flexDirection: "column",
        "slot:list": { flexDirection: "row" },
        "slot:trigger": { "--prism-tabs-indicator": "inset 0 -2px 0 0" },
      },
      vertical: {
        flexDirection: "row",
        "slot:list": { flexDirection: "column" },
        "slot:trigger": { "--prism-tabs-indicator": "inset 2px 0 0 0" },
      },
    },
    variant: {
      line: {
        "slot:list": { boxShadow: `inset 0 -1px 0 0 ${t("color.border")}` },
        "slot:trigger": {
          borderRadius: "0",
          _selected: { boxShadow: `var(--prism-tabs-indicator) ${t("color.primary")}` },
        },
      },
      pills: {
        "slot:list": { boxShadow: "none" },
        "slot:trigger": {
          borderRadius: t("radius.md"),
          _selected: { background: t("color.muted") },
        },
      },
    },
    size: {
      sm: {
        "slot:trigger": {
          minHeight: t("control.sm"),
          paddingInline: t("space.3"),
          fontSize: t("text.sm"),
        },
      },
      md: {
        "slot:trigger": {
          minHeight: t("control.md"),
          paddingInline: t("space.4"),
          fontSize: t("text.sm"),
        },
      },
    },
  },
  defaultVariants: { orientation: "horizontal", variant: "line", size: "md" },
});
