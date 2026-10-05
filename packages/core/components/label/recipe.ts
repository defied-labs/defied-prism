import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

export default defineRecipe({
  name: "label",
  base: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: t("space.1"),
    fontFamily: t("font.sans"),
    fontWeight: t("weight.medium"),
    lineHeight: t("leading.tight"),
    color: t("color.fg"),
    "part:required-indicator": { color: t("color.danger-fg") },
  },
  variants: {
    size: {
      sm: { fontSize: t("text.xs") },
      md: { fontSize: t("text.sm") },
    },
    dimmed: {
      true: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
    },
  },
  defaultVariants: { size: "md" },
});
