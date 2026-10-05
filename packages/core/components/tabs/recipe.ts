import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

export default defineRecipe({
  name: "tabs",
  base: {
    display: "flex",
    gap: t("space.3"),
    fontFamily: t("font.sans"),
  },
  slots: {
    list: {
      position: "relative",
      isolation: "isolate",
      display: "flex",
      gap: t("space.1"),
    },
    // Thumbs sized and moved inline to a tab's box (behind the tabs). The
    // indicator marks the selected tab; the highlight follows the pointer.
    indicator: {
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "-1",
      pointerEvents: "none",
      transition: [
        `transform ${t("duration.normal")} ${t("easing.standard")}`,
        `width ${t("duration.normal")} ${t("easing.standard")}`,
        `height ${t("duration.normal")} ${t("easing.standard")}`,
      ].join(", "),
    },
    highlight: {
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "-1",
      pointerEvents: "none",
      background: t("color.muted"),
      opacity: "0.6",
      transition: [
        `transform ${t("duration.normal")} ${t("easing.standard")}`,
        `width ${t("duration.normal")} ${t("easing.standard")}`,
        `height ${t("duration.normal")} ${t("easing.standard")}`,
        `opacity ${t("duration.fast")} ${t("easing.standard")}`,
      ].join(", "),
      _closed: { opacity: "0" },
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
        "slot:indicator": { "--prism-tabs-indicator": "inset 0 -2px 0 0" },
      },
      vertical: {
        flexDirection: "row",
        "slot:list": { flexDirection: "column" },
        "slot:trigger": { "--prism-tabs-indicator": "inset 2px 0 0 0" },
        "slot:indicator": { "--prism-tabs-indicator": "inset 2px 0 0 0" },
      },
    },
    variant: {
      line: {
        "slot:list": { boxShadow: `inset 0 -1px 0 0 ${t("color.border")}` },
        // Until the indicator is measured the selected tab draws its own line;
        // the list then sets --prism-tabs-selected to transparent
        "slot:trigger": {
          borderRadius: "0",
          _selected: { boxShadow: `var(--prism-tabs-indicator) var(--prism-tabs-selected, ${t("color.primary")})` },
        },
        "slot:indicator": {
          borderRadius: "0",
          background: "transparent",
          boxShadow: `var(--prism-tabs-indicator) ${t("color.primary")}`,
        },
        "slot:highlight": { borderRadius: t("radius.sm") },
      },
      pills: {
        "slot:list": { boxShadow: "none" },
        "slot:trigger": {
          borderRadius: t("radius.md"),
          _selected: { background: `var(--prism-tabs-selected, ${t("color.muted")})` },
        },
        "slot:indicator": {
          borderRadius: t("radius.md"),
          background: t("color.muted"),
          boxShadow: "none",
        },
        "slot:highlight": { borderRadius: t("radius.md") },
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
