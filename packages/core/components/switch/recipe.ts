import { defineRecipe, token as t } from "@defied/prism-style-engine";

// --prism-switch-on is 1 while the root is aria-checked, 0 otherwise: the
// track color and thumb position (child slots) interpolate from it.
const on = "var(--prism-switch-on, 0)";

export default defineRecipe({
  name: "switch",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: t("space.2"),
    padding: "0",
    borderWidth: "0",
    borderRadius: t("radius.full"),
    background: "transparent",
    color: t("color.fg"),
    fontFamily: t("font.sans"),
    lineHeight: t("leading.tight"),
    cursor: "pointer",
    "--prism-switch-on": "0",
    _checked: { "--prism-switch-on": "1" },
    _focusVisible: {
      outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
      outlineOffset: t("focus.ring-offset"),
    },
    _disabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
  },
  slots: {
    track: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0",
      boxSizing: "border-box",
      padding: "2px",
      borderRadius: t("radius.full"),
      background: `color-mix(in srgb, ${t("color.primary")} calc(${on} * 100%), ${t("color.border-strong")})`,
      transition: `background-color ${t("duration.fast")} ${t("easing.standard")}`,
    },
    thumb: {
      display: "block",
      borderRadius: t("radius.full"),
      background: t("color.bg"),
      boxShadow: t("shadow.sm"),
      transform: `translateX(calc(${on} * var(--prism-switch-travel)))`,
      transition: `transform ${t("duration.fast")} ${t("easing.standard")}`,
    },
  },
  variants: {
    size: {
      sm: {
        fontSize: t("text.sm"),
        "slot:track": { width: "2rem", height: "1.125rem" },
        "slot:thumb": {
          width: "0.875rem",
          height: "0.875rem",
          "--prism-switch-travel": "0.875rem",
        },
      },
      md: {
        fontSize: t("text.md"),
        "slot:track": { width: "2.75rem", height: "1.5rem" },
        "slot:thumb": {
          width: "1.25rem",
          height: "1.25rem",
          "--prism-switch-travel": "1.25rem",
        },
      },
    },
  },
  defaultVariants: { size: "md" },
});
