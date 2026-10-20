import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "link",
  base: {
    borderRadius: t("radius.sm"),
    textUnderlineOffset: "0.2em",
    cursor: "pointer",
    transition: `color ${t("duration.fast")} ${t("easing.standard")}`,
    _focusVisible: {
      outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
      outlineOffset: t("focus.ring-offset"),
    },
    // "(opens in a new tab)": announced, not shown
    "part:external-hint": {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clipPath: "inset(50%)",
      whiteSpace: "nowrap",
      borderWidth: "0",
    },
  },
  variants: {
    tone: {
      primary: { color: t("color.link"), _hoverAny: { color: t("color.link-hover") } },
      neutral: { color: t("color.fg") },
      muted: { color: t("color.muted-fg") },
    },
    underline: {
      always: { textDecorationLine: "underline" },
      hover: {
        textDecorationLine: "none",
        _hoverAny: { textDecorationLine: "underline" },
        _focusVisible: { textDecorationLine: "underline" },
      },
      none: { textDecorationLine: "none" },
    },
  },
  defaultVariants: { tone: "primary", underline: "always" },
});
