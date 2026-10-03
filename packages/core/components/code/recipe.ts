import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "code",
  base: {
    fontFamily: t("font.mono"),
    fontSize: "0.85em",
    fontWeight: t("weight.medium"),
    lineHeight: "inherit",
    color: t("color.fg"),
    // A soft pill that reads in running text without shouting
    background: t("color.muted"),
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: t("color.border"),
    borderRadius: t("radius.md"),
    paddingBlock: "0.1em",
    paddingInline: "0.4em",
    whiteSpace: "break-spaces",
    overflowWrap: "anywhere",
    boxDecorationBreak: "clone",
  },
});
