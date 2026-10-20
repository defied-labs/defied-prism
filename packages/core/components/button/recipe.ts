import { defineRecipe, token as t } from "@defied/prism-style-engine";

const tone = (name: "primary" | "secondary" | "destructive") => ({
  background: t(`color.${name}`),
  color: t(`color.${name}-fg`),
  borderColor: "transparent",
  _hover: { background: t(`color.${name}-hover`) },
  _active: { background: t(`color.${name}-active`) },
});

const size = (
  height: "xs" | "sm" | "md" | "lg" | "xl",
  paddingInline: "2" | "3" | "4" | "5" | "6",
  fontSize: "xs" | "sm" | "md" | "lg",
  radius: "sm" | "md" | "lg",
) => ({
  minHeight: t(`control.${height}`),
  paddingInline: t(`space.${paddingInline}`),
  fontSize: t(`text.${fontSize}`),
  borderRadius: t(`radius.${radius}`),
});

export default defineRecipe({
  name: "button",
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: t("space.2"),
    borderWidth: "1px",
    borderStyle: "solid",
    fontFamily: t("font.sans"),
    fontWeight: t("weight.medium"),
    lineHeight: t("leading.tight"),
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: "pointer",
    transition: [
      "background-color",
      "border-color",
      "color",
      "box-shadow",
    ]
      .map((p) => `${p} ${t("duration.fast")} ${t("easing.standard")}`)
      .join(", "),
    _focusVisible: {
      outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
      outlineOffset: t("focus.ring-offset"),
    },
    _disabled: {
      opacity: t("opacity.disabled"),
      cursor: "not-allowed",
    },
    _loading: {
      cursor: "wait",
    },
    "part:icon": {
      display: "inline-flex",
      flexShrink: "0",
      width: "1em",
      height: "1em",
    },
    "part:spinner": {
      display: "inline-block",
      flexShrink: "0",
      width: "1em",
      height: "1em",
      borderRadius: t("radius.full"),
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "currentColor transparent currentColor currentColor",
      animation: "prism-spin 0.7s linear infinite",
    },
  },
  variants: {
    variant: {
      primary: tone("primary"),
      secondary: tone("secondary"),
      destructive: tone("destructive"),
      outline: {
        background: "transparent",
        color: t("color.fg"),
        borderColor: t("color.border-strong"),
        _hover: { background: t("color.ghost-hover") },
        _active: { background: t("color.ghost-active") },
      },
      ghost: {
        background: "transparent",
        color: t("color.fg"),
        borderColor: "transparent",
        _hover: { background: t("color.ghost-hover") },
        _active: { background: t("color.ghost-active") },
      },
      link: {
        background: "transparent",
        color: t("color.link"),
        borderColor: "transparent",
        textDecorationLine: "underline",
        textUnderlineOffset: "0.25em",
        _hover: { color: t("color.link-hover") },
      },
    },
    size: {
      xs: size("xs", "2", "xs", "sm"),
      sm: size("sm", "3", "sm", "md"),
      md: size("md", "4", "sm", "md"),
      lg: size("lg", "5", "md", "lg"),
      xl: size("xl", "6", "lg", "lg"),
    },
    fullWidth: {
      true: { width: "100%" },
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
