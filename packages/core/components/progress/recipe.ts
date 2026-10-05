import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

type Status = "neutral" | "info" | "success" | "warning" | "danger";

const status = (s: Status) => ({
  "slot:indicator": { background: t(`color.${s}-solid`) },
});

export default defineRecipe({
  name: "progress",
  base: {
    position: "relative",
    display: "block",
    width: "100%",
    overflow: "hidden",
    borderRadius: t("radius.full"),
    background: t("color.muted"),
  },
  slots: {
    indicator: {
      display: "block",
      height: "100%",
      borderRadius: "inherit",
      transition: `width ${t("duration.normal")} ${t("easing.standard")}`,
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
    size: {
      sm: { height: t("space.1") },
      md: { height: t("space.2") },
      lg: { height: t("space.3") },
    },
    // Indeterminate: a partial bar sweeping across the track. Duration
    // tokens collapse to 0ms under reduced motion.
    indeterminate: {
      true: {
        "slot:indicator": {
          animation: `prism-indeterminate calc(${t("duration.slow")} * 4) ${t("easing.standard")} infinite`,
        },
      },
    },
  },
  defaultVariants: { status: "info", size: "md" },
});
