import { defineRecipe, token as t } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "form",
  base: {
    display: "flex",
    flexDirection: "column",
    gap: t("space.6"),
    fontFamily: t("font.sans"),
  },
});
