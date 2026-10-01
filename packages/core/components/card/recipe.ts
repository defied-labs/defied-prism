import { defineRecipe, token as t } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "card",
  base: {
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: t("radius.lg"),
    background: t("color.bg"),
    color: t("color.fg"),
    fontFamily: t("font.sans"),
    overflow: "hidden",
  },
  slots: {
    header: {
      display: "flex",
      flexDirection: "column",
      gap: t("space.1-5"),
      paddingInline: t("space.6"),
      paddingTop: t("space.6"),
    },
    title: {
      margin: "0",
      fontSize: t("text.lg"),
      fontWeight: t("weight.semibold"),
      lineHeight: t("leading.tight"),
    },
    description: {
      margin: "0",
      fontSize: t("text.sm"),
      lineHeight: t("leading.normal"),
      color: t("color.muted-fg"),
    },
    content: {
      paddingInline: t("space.6"),
      paddingBlock: t("space.4"),
      fontSize: t("text.sm"),
      lineHeight: t("leading.normal"),
    },
    footer: {
      display: "flex",
      alignItems: "center",
      gap: t("space.2"),
      paddingInline: t("space.6"),
      paddingBottom: t("space.6"),
    },
    link: {
      color: "inherit",
      textDecoration: "none",
      borderRadius: t("radius.sm"),
      _hoverAny: { textDecoration: "underline" },
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
    },
  },
  variants: {
    variant: {
      flat: { borderColor: "transparent", boxShadow: "none" },
      raised: { borderColor: t("color.border"), boxShadow: t("shadow.md") },
      outlined: { borderColor: t("color.border"), boxShadow: "none" },
    },
    interactive: {
      true: {
        cursor: "pointer",
        transitionProperty: "border-color, box-shadow",
        transitionDuration: t("duration.fast"),
        transitionTimingFunction: t("easing.standard"),
        _hoverAny: { outline: `1px solid ${t("color.border-strong")}` },
        // The whole card shows focus while its link has it
        _focusWithin: {
          outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
          outlineOffset: t("focus.ring-offset"),
        },
      },
    },
  },
  defaultVariants: { variant: "outlined" },
});
