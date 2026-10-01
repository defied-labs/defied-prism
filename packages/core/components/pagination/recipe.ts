import { defineRecipe, token as t } from "@defied-prism/style-engine";

const control = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: t("space.1"),
  boxSizing: "border-box",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "transparent",
  borderRadius: t("radius.md"),
  background: "transparent",
  color: t("color.fg"),
  fontFamily: "inherit",
  fontWeight: t("weight.medium"),
  lineHeight: t("leading.tight"),
  textDecorationLine: "none",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: `background-color ${t("duration.fast")} ${t("easing.standard")}`,
  _current: { borderColor: t("color.border-strong"), background: t("color.bg-subtle") },
  _hoverAny: { background: t("color.ghost-hover") },
  _focusVisible: {
    outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
    outlineOffset: t("focus.ring-offset"),
  },
  _disabled: { opacity: t("opacity.disabled"), cursor: "not-allowed", background: "transparent" },
  _ariaDisabled: { opacity: t("opacity.disabled"), cursor: "not-allowed", background: "transparent" },
} as const;

const sized = (height: string, pad: string, font: string) => {
  const box = { minHeight: height, minWidth: height, paddingInline: pad, fontSize: font };
  return {
    "slot:link": box,
    "slot:previous": box,
    "slot:next": box,
    "slot:ellipsis": { minWidth: height, fontSize: font },
  };
};

export default defineRecipe({
  name: "pagination",
  base: { fontFamily: t("font.sans"), color: t("color.fg") },
  slots: {
    list: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: t("space.1"),
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    item: { display: "inline-flex" },
    link: control,
    previous: control,
    next: control,
    ellipsis: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: t("color.muted-fg"),
    },
  },
  variants: {
    size: {
      sm: sized(t("control.sm"), t("space.2"), t("text.xs")),
      md: sized(t("control.md"), t("space.3"), t("text.sm")),
    },
  },
  defaultVariants: { size: "md" },
});
