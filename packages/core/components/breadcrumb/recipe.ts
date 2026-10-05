import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

const focusRing = {
  outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
  outlineOffset: t("focus.ring-offset"),
};

export default defineRecipe({
  name: "breadcrumb",
  base: {
    fontFamily: t("font.sans"),
    color: t("color.muted-fg"),
    lineHeight: t("leading.normal"),
  },
  slots: {
    list: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      margin: "0",
      padding: "0",
      listStyle: "none",
    },
    item: {
      display: "inline-flex",
      alignItems: "center",
    },
    link: {
      color: "inherit",
      textDecorationLine: "none",
      borderRadius: t("radius.sm"),
      transition: `color ${t("duration.fast")} ${t("easing.standard")}`,
      _hoverAny: { color: t("color.fg"), textDecorationLine: "underline" },
      _focusVisible: focusRing,
    },
    page: {
      color: t("color.fg"),
      fontWeight: t("weight.medium"),
    },
    separator: {
      display: "inline-flex",
      alignItems: "center",
      color: t("color.muted-fg"),
    },
    ellipsis: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      paddingInline: t("space.1"),
      borderWidth: "0",
      borderRadius: t("radius.sm"),
      background: "transparent",
      color: "inherit",
      font: "inherit",
      cursor: "pointer",
      _hover: { color: t("color.fg") },
      _focusVisible: focusRing,
    },
  },
  variants: {
    size: {
      sm: { fontSize: t("text.xs"), "slot:list": { gap: t("space.1") } },
      md: { fontSize: t("text.sm"), "slot:list": { gap: t("space.1-5") } },
    },
  },
  defaultVariants: { size: "md" },
});
