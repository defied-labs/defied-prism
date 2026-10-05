import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

export default defineRecipe({
  name: "empty-state",
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginInline: "auto",
    fontFamily: t("font.sans"),
    color: t("color.fg"),
  },
  slots: {
    icon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: t("radius.full"),
      background: t("color.muted"),
      color: t("color.muted-fg"),
    },
    title: {
      margin: "0",
      fontWeight: t("weight.semibold"),
      lineHeight: t("leading.tight"),
    },
    description: {
      margin: "0",
      maxWidth: "36rem",
      color: t("color.muted-fg"),
      lineHeight: t("leading.normal"),
    },
    actions: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: t("space.2"),
    },
  },
  variants: {
    size: {
      sm: {
        gap: t("space.2"),
        paddingBlock: t("space.6"),
        paddingInline: t("space.4"),
        "slot:icon": { width: t("control.md"), height: t("control.md") },
        "slot:title": { fontSize: t("text.md") },
        "slot:description": { fontSize: t("text.sm") },
        "slot:actions": { marginTop: t("space.2") },
      },
      md: {
        gap: t("space.3"),
        paddingBlock: t("space.12"),
        paddingInline: t("space.6"),
        "slot:icon": { width: t("space.12"), height: t("space.12") },
        "slot:title": { fontSize: t("text.lg") },
        "slot:description": { fontSize: t("text.md") },
        "slot:actions": { marginTop: t("space.4") },
      },
    },
  },
  defaultVariants: { size: "md" },
});
