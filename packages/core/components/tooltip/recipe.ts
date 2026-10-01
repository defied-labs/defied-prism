import { defineRecipe, token as t } from "@defied-prism/style-engine";

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
      animation: `prism-fade-in ${t("duration.fast")} ${t("easing.standard")}`,
    },
  },
  variants: {
    side: {
      top: {
        "slot:content": {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: gap,
        },
      },
      bottom: {
        "slot:content": {
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: gap,
        },
      },
      left: {
        "slot:content": {
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginRight: gap,
        },
      },
      right: {
        "slot:content": {
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: gap,
        },
      },
    },
  },
  defaultVariants: { side: "top" },
});
