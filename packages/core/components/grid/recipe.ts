import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

const cols = (n: number) => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` });

export default defineRecipe({
  name: "grid",
  base: { display: "grid", minWidth: "0" },
  variants: {
    columns: {
      one: cols(1),
      two: cols(2),
      three: cols(3),
      four: cols(4),
      six: cols(6),
      twelve: cols(12),
      // As many columns of at least 16rem as fit
      auto: { gridTemplateColumns: "repeat(auto-fit, minmax(min(16rem, 100%), 1fr))" },
    },
    gap: {
      none: { gap: "0" },
      xs: { gap: t("space.1") },
      sm: { gap: t("space.2") },
      md: { gap: t("space.4") },
      lg: { gap: t("space.6") },
      xl: { gap: t("space.8") },
    },
  },
  defaultVariants: { columns: "one", gap: "md" },
});
