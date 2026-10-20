import { defineRecipe, token as t } from "@defied/prism-style-engine";

const size = (
  fontSize: "display" | "3xl" | "2xl" | "xl" | "lg" | "md",
  leading: "tight" | "snug",
  weight: "semibold" | "bold",
  letterSpacing: string,
) => ({
  fontSize: t(`text.${fontSize}`),
  lineHeight: t(`leading.${leading}`),
  fontWeight: t(`weight.${weight}`),
  letterSpacing,
});

export default defineRecipe({
  name: "heading",
  base: {
    margin: "0",
    fontFamily: t("font.sans"),
    color: t("color.fg"),
    textWrap: "balance",
  },
  variants: {
    size: {
      display: size("display", "tight", "bold", "-0.025em"),
      xl: size("3xl", "tight", "bold", "-0.02em"),
      lg: size("2xl", "tight", "semibold", "-0.015em"),
      md: size("xl", "snug", "semibold", "-0.01em"),
      sm: size("lg", "snug", "semibold", "0"),
      xs: size("md", "snug", "semibold", "0"),
    },
  },
  defaultVariants: { size: "lg" },
});
