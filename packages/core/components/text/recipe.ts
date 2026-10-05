import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

export default defineRecipe({
  name: "text",
  base: { margin: "0", fontFamily: t("font.sans") },
  variants: {
    size: {
      lg: { fontSize: t("text.lg") },
      md: { fontSize: t("text.md") },
      sm: { fontSize: t("text.sm") },
      xs: { fontSize: t("text.xs") },
    },
    tone: {
      body: { color: t("color.fg"), lineHeight: t("leading.normal") },
      // Introductory copy: softer color, roomier leading
      lead: { color: t("color.muted-fg"), lineHeight: "1.625" },
      muted: { color: t("color.muted-fg"), lineHeight: t("leading.normal") },
      success: { color: t("color.success-fg"), lineHeight: t("leading.normal") },
      warning: { color: t("color.warning-fg"), lineHeight: t("leading.normal") },
      danger: { color: t("color.danger-fg"), lineHeight: t("leading.normal") },
    },
    weight: {
      regular: { fontWeight: t("weight.regular") },
      medium: { fontWeight: t("weight.medium") },
      semibold: { fontWeight: t("weight.semibold") },
      bold: { fontWeight: t("weight.bold") },
    },
    truncate: {
      true: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
  },
  defaultVariants: { size: "md", tone: "body", weight: "regular" },
});
