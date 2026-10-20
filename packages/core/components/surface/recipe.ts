import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "surface",
  base: {
    boxSizing: "border-box",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: t("radius.lg"),
    color: t("color.fg"),
  },
  variants: {
    variant: {
      flat: { background: t("color.bg"), borderColor: "transparent", boxShadow: "none" },
      raised: { background: t("color.bg"), borderColor: t("color.border"), boxShadow: t("shadow.md") },
      outlined: { background: t("color.bg"), borderColor: t("color.border"), boxShadow: "none" },
      sunken: {
        background: t("color.bg-subtle"),
        borderColor: t("color.border"),
        boxShadow: "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
    },
    padding: {
      none: { padding: "0" },
      sm: { padding: t("space.3") },
      md: { padding: t("space.4") },
      lg: { padding: t("space.6") },
    },
  },
  defaultVariants: { variant: "outlined", padding: "md" },
});
