import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

const gap = t("space.2");

export default defineRecipe({
  name: "tooltip",
  base: {
    position: "relative",
    display: "inline-flex",
  },
  slots: {
    // No `display` here: the content relies on the `hidden` attribute when closed
    content: {
      position: "absolute",
      zIndex: t("z.tooltip"),
      width: "max-content",
      maxWidth: "20rem",
      paddingBlock: t("space.1"),
      paddingInline: t("space.2"),
      borderRadius: t("radius.md"),
      background: t("color.inverse"),
      color: t("color.inverse-fg"),
      boxShadow: t("shadow.md"),
      fontFamily: t("font.sans"),
      fontSize: t("text.xs"),
      lineHeight: t("leading.snug"),
      // Fades in, growing slightly as it settles towards the trigger (`side`
      // sets where it starts); fades back out the same way, faster
      "--prism-zoom-scale": "0.92",
      animation: `prism-zoom-in ${t("duration.normal")} ${t("easing.emphasized")}`,
      _closed: {
        pointerEvents: "none",
        animation: `prism-zoom-out ${t("duration.fast")} ${t("easing.exit")} forwards`,
      },
    },
  },
  variants: {
    side: {
      top: {
        "slot:content": {
          bottom: "100%",
          left: "50%",
          translate: "-50% 0",
          marginBottom: gap,
          transformOrigin: "bottom",
          "--prism-zoom-y": "-0.25rem",
        },
      },
      bottom: {
        "slot:content": {
          top: "100%",
          left: "50%",
          translate: "-50% 0",
          marginTop: gap,
          transformOrigin: "top",
          "--prism-zoom-y": "0.25rem",
        },
      },
      left: {
        "slot:content": {
          right: "100%",
          top: "50%",
          translate: "0 -50%",
          marginRight: gap,
          transformOrigin: "right",
          "--prism-zoom-x": "-0.25rem",
        },
      },
      right: {
        "slot:content": {
          left: "100%",
          top: "50%",
          translate: "0 -50%",
          marginLeft: gap,
          transformOrigin: "left",
          "--prism-zoom-x": "0.25rem",
        },
      },
    },
  },
  defaultVariants: { side: "top" },
});
