import { defineRecipe, token as t } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "input",
  base: {
    display: "block",
    boxSizing: "border-box",
    color: t("color.fg"),
    fontFamily: t("font.sans"),
    lineHeight: t("leading.normal"),
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: t("color.border-strong"),
    transition: `border-color ${t("duration.fast")} ${t("easing.standard")}`,
    _placeholder: { color: t("color.muted-fg") },
    _hover: { borderColor: t("color.fg") },
    _focusVisible: {
      outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
      outlineOffset: "0",
    },
    _invalid: { borderColor: t("color.danger-solid") },
    _disabled: {
      opacity: t("opacity.disabled"),
      cursor: "not-allowed",
    },
  },
  variants: {
    variant: {
      outlined: { background: t("color.bg") },
      filled: { background: t("color.muted") },
    },
    size: {
      sm: {
        minHeight: t("control.sm"),
        paddingInline: t("space.2"),
        fontSize: t("text.sm"),
        borderRadius: t("radius.md"),
      },
      md: {
        minHeight: t("control.md"),
        paddingInline: t("space.3"),
        fontSize: t("text.sm"),
        borderRadius: t("radius.md"),
      },
      lg: {
        minHeight: t("control.lg"),
        paddingInline: t("space.4"),
        fontSize: t("text.md"),
        borderRadius: t("radius.lg"),
      },
    },
    fullWidth: {
      true: { width: "100%" },
    },
  },
  defaultVariants: { variant: "outlined", size: "md" },
});
