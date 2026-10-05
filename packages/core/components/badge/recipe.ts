import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

type Status = "neutral" | "info" | "success" | "warning" | "danger";

// The status dimension sets custom properties; the variant dimension reads
// them (one owner per property, like tabs' cross-dimension styling).
const status = (s: Status) => ({
  "--badge-bg": t(`color.${s}-bg`),
  "--badge-fg": t(`color.${s}-fg`),
  "--badge-border": t(`color.${s}-border`),
  "--badge-solid": t(`color.${s}-solid`),
});

const size = (fontSize: "xs" | "sm", paddingInline: "1-5" | "2", minHeight: string) => ({
  fontSize: t(`text.${fontSize}`),
  paddingInline: t(`space.${paddingInline}`),
  minHeight,
});

export default defineRecipe({
  name: "badge",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: t("space.1"),
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: t("radius.full"),
    fontFamily: t("font.sans"),
    fontWeight: t("weight.medium"),
    lineHeight: t("leading.tight"),
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    "part:icon": {
      display: "inline-flex",
      flexShrink: "0",
      width: "1em",
      height: "1em",
    },
  },
  variants: {
    status: {
      neutral: status("neutral"),
      info: status("info"),
      success: status("success"),
      warning: status("warning"),
      danger: status("danger"),
    },
    variant: {
      subtle: {
        background: "var(--badge-bg)",
        color: "var(--badge-fg)",
        borderColor: "var(--badge-border)",
      },
      solid: {
        background: "var(--badge-solid)",
        color: t("color.solid-fg"),
        borderColor: "transparent",
      },
      outline: {
        background: "transparent",
        color: "var(--badge-fg)",
        borderColor: "var(--badge-border)",
      },
    },
    size: {
      sm: size("xs", "1-5", "1.25rem"),
      md: size("sm", "2", "1.5rem"),
    },
  },
  defaultVariants: { status: "neutral", variant: "subtle", size: "md" },
});
