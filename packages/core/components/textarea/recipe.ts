import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "textarea",
  base: {
    display: "block",
    boxSizing: "border-box",
    minWidth: "0",
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
    _disabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
  },
  variants: {
    variant: {
      outlined: { background: t("color.bg") },
      filled: { background: t("color.muted") },
    },
    size: {
      sm: {
        minHeight: "4rem",
        paddingInline: t("space.2"),
        paddingBlock: t("space.1"),
        fontSize: t("text.sm"),
        borderRadius: t("radius.md"),
      },
      md: {
        minHeight: "5rem",
        paddingInline: t("space.3"),
        paddingBlock: t("space.2"),
        fontSize: t("text.sm"),
        borderRadius: t("radius.md"),
      },
      lg: {
        minHeight: "6rem",
        paddingInline: t("space.4"),
        paddingBlock: t("space.3"),
        fontSize: t("text.md"),
        borderRadius: t("radius.lg"),
      },
    },
    resize: {
      none: { resize: "none" },
      vertical: { resize: "vertical" },
      both: { resize: "both" },
    },
    fullWidth: {
      true: { width: "100%" },
    },
  },
  defaultVariants: { variant: "outlined", size: "md", resize: "vertical" },
});
