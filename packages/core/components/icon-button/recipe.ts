import { defineRecipe, token as t } from "@defied-prism/style-engine";

const tone = (name: "primary" | "secondary" | "destructive") => ({
  background: t(`color.${name}`),
  color: t(`color.${name}-fg`),
  borderColor: "transparent",
  _hover: { background: t(`color.${name}-hover`) },
  _active: { background: t(`color.${name}-active`) },
});

const size = (
  box: "xs" | "sm" | "md" | "lg" | "xl",
  fontSize: "sm" | "md" | "lg" | "xl",
  radius: "sm" | "md" | "lg",
) => ({
  width: t(`control.${box}`),
  height: t(`control.${box}`),
  fontSize: t(`text.${fontSize}`),
  borderRadius: t(`radius.${radius}`),
});

export default defineRecipe({
  name: "icon-button",
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    boxSizing: "border-box",
    padding: "0",
    borderWidth: "1px",
    borderStyle: "solid",
    lineHeight: "1",
    userSelect: "none",
    cursor: "pointer",
    transition: ["background-color", "border-color", "color", "box-shadow"]
      .map((p) => `${p} ${t("duration.fast")} ${t("easing.standard")}`)
      .join(", "),
    _focusVisible: {
      outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
      outlineOffset: t("focus.ring-offset"),
    },
    _disabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
    _loading: { cursor: "wait" },
    "part:icon": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "1.25em",
      height: "1.25em",
    },
    "part:spinner": {
      display: "inline-block",
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
        // Icons follow their context (an alert's status color, a toolbar)
        color: "inherit",
        borderColor: "transparent",
        _hover: { background: t("color.ghost-hover") },
        _active: { background: t("color.ghost-active") },
      },
    },
    size: {
      xs: size("xs", "sm", "sm"),
      sm: size("sm", "sm", "md"),
      md: size("md", "md", "md"),
      lg: size("lg", "lg", "lg"),
      xl: size("xl", "xl", "lg"),
    },
  },
  defaultVariants: { variant: "ghost", size: "md" },
});
