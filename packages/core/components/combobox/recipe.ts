import { defineRecipe, token as t } from "@defied-prism/style-engine";

const popup = {
  position: "absolute",
  zIndex: t("z.dropdown"),
  top: "100%",
  left: "0",
  right: "0",
  marginTop: t("space.1"),
  boxSizing: "border-box",
  borderRadius: t("radius.md"),
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: t("color.border"),
  background: t("color.bg"),
  boxShadow: t("shadow.lg"),
  animation: `prism-fade-in ${t("duration.fast")} ${t("easing.standard")}`,
} as const;

export default defineRecipe({
  name: "combobox",
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: t("space.1-5"),
    fontFamily: t("font.sans"),
    color: t("color.fg"),
  },
  slots: {
    input: {
      boxSizing: "border-box",
      width: "100%",
      color: t("color.fg"),
      background: t("color.bg"),
      fontFamily: "inherit",
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
    listbox: {
      ...popup,
      padding: t("space.1"),
      maxHeight: "16rem",
      overflowY: "auto",
    },
    option: {
      display: "flex",
      alignItems: "center",
      paddingBlock: t("space.1-5"),
      paddingInline: t("space.2"),
      borderRadius: t("radius.sm"),
      fontSize: t("text.sm"),
      cursor: "pointer",
      userSelect: "none",
      _highlighted: { background: t("color.muted") },
      _selected: { fontWeight: t("weight.semibold") },
      _ariaDisabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
    },
    group: {},
    label: {
      paddingBlock: t("space.1-5"),
      paddingInline: t("space.2"),
      color: t("color.muted-fg"),
      fontSize: t("text.xs"),
      fontWeight: t("weight.semibold"),
    },
    empty: {
      ...popup,
      padding: t("space.2"),
      color: t("color.muted-fg"),
      fontSize: t("text.sm"),
    },
  },
  variants: {
    size: {
      sm: {
        "slot:input": {
          minHeight: t("control.sm"),
          paddingInline: t("space.2"),
          fontSize: t("text.sm"),
          borderRadius: t("radius.md"),
        },
      },
      md: {
        "slot:input": {
          minHeight: t("control.md"),
          paddingInline: t("space.3"),
          fontSize: t("text.sm"),
          borderRadius: t("radius.md"),
        },
      },
      lg: {
        "slot:input": {
          minHeight: t("control.lg"),
          paddingInline: t("space.4"),
          fontSize: t("text.md"),
          borderRadius: t("radius.lg"),
        },
      },
    },
  },
  defaultVariants: { size: "md" },
});
