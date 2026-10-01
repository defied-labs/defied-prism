import { defineRecipe, token as t } from "@defied-prism/style-engine";

const size = (value: string) => ({ "slot:indicator": { width: value, height: value } });

export default defineRecipe({
  name: "spinner",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  slots: {
    indicator: {
      display: "inline-block",
      flexShrink: "0",
      borderRadius: t("radius.full"),
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "currentColor transparent currentColor currentColor",
      // Essential motion: the spin is the only loading cue, so it does not
      // collapse under reduced motion (same as Button's spinner part).
      animation: "prism-spin 0.7s linear infinite",
    },
    // Visually hidden, still announced
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
    size: {
      xs: size("0.75rem"),
      sm: size("1rem"),
      md: size("1.5rem"),
      lg: size("2rem"),
    },
  },
  defaultVariants: { size: "md" },
});
