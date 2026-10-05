import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

export default defineRecipe({
  name: "checkbox",
  // root: the native <input type="checkbox">, restyled as the box
  base: {
    appearance: "none",
    boxSizing: "border-box",
    display: "block",
    flexShrink: "0",
    margin: "0",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: t("color.border-strong"),
    borderRadius: t("radius.sm"),
    background: t("color.bg"),
    cursor: "pointer",
    transition: `border-color ${t("duration.fast")} ${t("easing.standard")}`,
    _hover: { borderColor: t("color.fg") },
    _focusVisible: {
      outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
      outlineOffset: t("focus.ring-offset"),
    },
    _invalid: { borderColor: t("color.danger-solid") },
    _disabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
  },
  slots: {
    label: {
      display: "inline-flex",
      alignItems: "center",
      gap: t("space.2"),
      color: t("color.fg"),
      fontFamily: t("font.sans"),
      lineHeight: t("leading.tight"),
    },
    control: {
      position: "relative",
      display: "inline-flex",
      flexShrink: "0",
      // Rendered only when checked or indeterminate; covers the box
      "part:indicator": {
        position: "absolute",
        inset: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: t("radius.sm"),
        background: t("color.primary"),
        color: t("color.primary-fg"),
        pointerEvents: "none",
        animation: `prism-scale-in ${t("duration.fast")} ${t("easing.emphasized")}`,
      },
      // The tick / dash path (pathLength 1) draws itself once the box has filled
      "part:mark": {
        "--prism-draw-length": "1",
        strokeDasharray: "1",
        animation: ["prism-draw", t("duration.normal"), t("easing.emphasized"), t("duration.fast"), "both"].join(" "),
      },
    },
  },
  variants: {
    size: {
      sm: {
        width: "1rem",
        height: "1rem",
        "slot:label": { fontSize: t("text.sm") },
      },
      md: {
        width: "1.25rem",
        height: "1.25rem",
        "slot:label": { fontSize: t("text.md") },
      },
    },
  },
  defaultVariants: { size: "md" },
});
