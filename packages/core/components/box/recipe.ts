import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "box",
  base: { boxSizing: "border-box", minWidth: "0" },
  variants: {
    padding: {
      none: { padding: "0" },
      sm: { padding: t("space.2") },
      md: { padding: t("space.4") },
      lg: { padding: t("space.6") },
    },
    background: {
      none: { background: "transparent" },
      subtle: { background: t("color.bg-subtle"), color: t("color.fg") },
      muted: { background: t("color.muted"), color: t("color.fg") },
    },
  },
  defaultVariants: { padding: "none", background: "none" },
});
