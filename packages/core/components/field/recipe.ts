import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "field",
  base: {
    display: "flex",
    gap: t("space.1-5"),
    fontFamily: t("font.sans"),
    minWidth: "0",
  },
  slots: {
    // Looks come from the registry Label; this slot is a hook for Field-specific overrides
    label: {},
    description: {
      margin: "0",
      fontSize: t("text.xs"),
      lineHeight: t("leading.normal"),
      color: t("color.muted-fg"),
    },
    error: {
      margin: "0",
      fontSize: t("text.xs"),
      lineHeight: t("leading.normal"),
      color: t("color.danger-fg"),
    },
    group: {
      display: "flex",
      flexDirection: "column",
      gap: t("space.4"),
      minWidth: "0",
      margin: "0",
      padding: "0",
      borderWidth: "0",
      fontFamily: t("font.sans"),
    },
    legend: {
      padding: "0",
      marginBottom: t("space.2"),
      fontSize: t("text.md"),
      fontWeight: t("weight.semibold"),
      lineHeight: t("leading.tight"),
      color: t("color.fg"),
    },
  },
  variants: {
    orientation: {
      vertical: { flexDirection: "column" },
      horizontal: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: t("space.3") },
    },
  },
  defaultVariants: { orientation: "vertical" },
});
