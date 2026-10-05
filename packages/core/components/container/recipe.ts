import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

export default defineRecipe({
  name: "container",
  base: {
    boxSizing: "border-box",
    width: "100%",
    marginInline: "auto",
    paddingInline: t("space.4"),
  },
  variants: {
    size: {
      sm: { maxWidth: "40rem" },
      md: { maxWidth: "48rem" },
      lg: { maxWidth: "64rem" },
      xl: { maxWidth: "80rem" },
      full: { maxWidth: "none" },
    },
  },
  defaultVariants: { size: "lg" },
});
