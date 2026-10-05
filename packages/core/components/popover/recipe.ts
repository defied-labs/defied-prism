import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

const gap = t("space.2");
// `align` sets these; `side` reads them (cross-dimension styling, see tabs)
const start = "var(--prism-popover-start)";
const end = "var(--prism-popover-end)";
const shift = "var(--prism-popover-shift)";

export default defineRecipe({
  name: "popover",
  base: {
    position: "relative",
    display: "inline-flex",
  },
  slots: {
    content: {
      position: "absolute",
      zIndex: t("z.dropdown"),
      boxSizing: "border-box",
      width: "max-content",
      maxWidth: "20rem",
      padding: t("space.4"),
      borderRadius: t("radius.md"),
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: t("color.border"),
      background: t("color.bg"),
      color: t("color.fg"),
      boxShadow: t("shadow.md"),
      fontFamily: t("font.sans"),
      fontSize: t("text.sm"),
      lineHeight: t("leading.normal"),
      // Unrolls from the edge nearest the trigger (`side` sets the origin)
      animation: `prism-roll-in ${t("duration.normal")} ${t("easing.emphasized")}`,
      _closed: {
        pointerEvents: "none",
        animation: `prism-roll-out ${t("duration.fast")} ${t("easing.exit")} forwards`,
      },
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
    },
  },
  variants: {
    side: {
      top: {
        "slot:content": {
          bottom: "100%",
          left: start,
          right: end,
          translate: `${shift} 0`,
          marginBottom: gap,
          // Above the trigger: roll up from the bottom edge
          transformOrigin: "bottom",
          "--prism-roll-y": "1",
          "--prism-roll-top": "100%",
          "--prism-roll-bottom": "0",
        },
      },
      bottom: {
        "slot:content": {
          top: "100%",
          left: start,
          right: end,
          translate: `${shift} 0`,
          marginTop: gap,
          transformOrigin: "top",
        },
      },
      left: {
        "slot:content": {
          right: "100%",
          top: start,
          bottom: end,
          translate: `0 ${shift}`,
          marginRight: gap,
          transformOrigin: "top",
        },
      },
      right: {
        "slot:content": {
          left: "100%",
          top: start,
          bottom: end,
          translate: `0 ${shift}`,
          marginLeft: gap,
          transformOrigin: "top",
        },
      },
    },
    align: {
      start: {
        "slot:content": {
          "--prism-popover-start": "0",
          "--prism-popover-end": "auto",
          "--prism-popover-shift": "0%",
        },
      },
      center: {
        "slot:content": {
          "--prism-popover-start": "50%",
          "--prism-popover-end": "auto",
          "--prism-popover-shift": "-50%",
        },
      },
      end: {
        "slot:content": {
          "--prism-popover-start": "auto",
          "--prism-popover-end": "0",
          "--prism-popover-shift": "0%",
        },
      },
    },
  },
  defaultVariants: { side: "bottom", align: "center" },
});
