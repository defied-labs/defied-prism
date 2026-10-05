import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

const size = (box: "sm" | "md" | "lg" | "xl" | "xs", text: "xs" | "sm" | "md" | "lg") => ({
  width: t(`control.${box}`),
  height: t(`control.${box}`),
  fontSize: t(`text.${text}`),
});

export default defineRecipe({
  name: "avatar",
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    overflow: "hidden",
    verticalAlign: "middle",
    background: t("color.muted"),
    color: t("color.muted-fg"),
    fontFamily: t("font.sans"),
    fontWeight: t("weight.medium"),
    lineHeight: "1",
    userSelect: "none",
  },
  slots: {
    // No display here: the image uses the `hidden` attribute until loaded.
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    fallback: {
      textTransform: "uppercase",
    },
  },
  variants: {
    size: {
      sm: size("xs", "xs"),
      md: size("md", "sm"),
      lg: size("lg", "md"),
      xl: size("xl", "lg"),
    },
    shape: {
      circle: { borderRadius: t("radius.full") },
      square: { borderRadius: t("radius.md") },
    },
  },
  defaultVariants: { size: "md", shape: "circle" },
});
