import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "stack",
  base: { display: "flex", flexDirection: "column", minWidth: "0" },
  variants: {
    gap: {
      none: { gap: "0" },
      xs: { gap: t("space.1") },
      sm: { gap: t("space.2") },
      md: { gap: t("space.4") },
      lg: { gap: t("space.6") },
      xl: { gap: t("space.8") },
    },
    align: {
      start: { alignItems: "flex-start" },
      center: { alignItems: "center" },
      end: { alignItems: "flex-end" },
      stretch: { alignItems: "stretch" },
    },
    justify: {
      start: { justifyContent: "flex-start" },
      center: { justifyContent: "center" },
      end: { justifyContent: "flex-end" },
      between: { justifyContent: "space-between" },
    },
  },
  defaultVariants: { gap: "md", align: "stretch", justify: "start" },
});
