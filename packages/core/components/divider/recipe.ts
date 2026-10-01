import { defineRecipe, token as t } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "divider",
  base: {
    flexShrink: "0",
    margin: "0",
    borderWidth: "0",
    background: t("color.border"),
  },
  variants: {
    orientation: {
      horizontal: { width: "100%", height: "1px", alignSelf: "auto" },
      vertical: { width: "1px", height: "auto", alignSelf: "stretch" },
    },
  },
  defaultVariants: { orientation: "horizontal" },
});
