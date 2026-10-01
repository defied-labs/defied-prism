import { defineRecipe, token as t } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "code",
  base: {
    fontFamily: t("font.mono"),
    fontSize: "0.875em",
    color: t("color.fg"),
    background: t("color.muted"),
    borderRadius: t("radius.sm"),
    paddingBlock: "0.125em",
    paddingInline: "0.3em",
    overflowWrap: "break-word",
  },
});
