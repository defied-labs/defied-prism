import { defineRecipe, token as t } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "skeleton",
  base: {
    display: "flex",
    flexDirection: "column",
    gap: t("space.2"),
  },
  slots: {
    shape: {
      display: "block",
      background: t("color.muted"),
      // Collapses under reduced motion with the duration tokens
      animation: `prism-pulse calc(${t("duration.slow")} * 5) ${t("easing.standard")} infinite`,
    },
    // Visually hidden loading label
    label: {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      borderWidth: "0",
    },
  },
  variants: {
    variant: {
      text: {
        "slot:shape": { width: "100%", height: "1em", borderRadius: t("radius.sm") },
      },
      rect: {
        "slot:shape": { width: "100%", height: "6rem", borderRadius: t("radius.md") },
      },
      circle: {
        "slot:shape": {
          width: t("control.md"),
          height: t("control.md"),
          borderRadius: t("radius.full"),
        },
      },
    },
  },
  defaultVariants: { variant: "text" },
});
