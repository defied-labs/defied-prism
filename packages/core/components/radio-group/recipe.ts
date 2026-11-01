import { defineRecipe, token as t } from "@defied/prism-style-engine";

export default defineRecipe({
  name: "radio-group",
  base: {
    display: "flex",
    gap: t("space.3"),
    fontFamily: t("font.sans"),
  },
  slots: {
    item: {
      display: "inline-flex",
      alignItems: "center",
      gap: t("space.2"),
      color: t("color.fg"),
      lineHeight: t("leading.tight"),
    },
    control: {
      position: "relative",
      display: "inline-flex",
      flexShrink: "0",
      // Rendered only on the checked radio: the inner dot, fading in with the
      // radio's primary fill. No transform, so nothing can shift it off center;
      // sized as 50% of the ring so its offsets land on whole pixels (5px at
      // md, 4px at sm)
      "part:indicator": {
        position: "absolute",
        inset: "0",
        margin: "auto",
        width: "50%",
        height: "50%",
        borderRadius: t("radius.full"),
        background: t("color.primary-fg"),
        pointerEvents: "none",
        animation: `prism-fade-in ${t("duration.normal")} ${t("easing.standard")}`,
      },
    },
    radio: {
      appearance: "none",
      boxSizing: "border-box",
      display: "block",
      margin: "0",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: t("color.border-strong"),
      borderRadius: t("radius.full"),
      background: t("color.bg"),
      cursor: "pointer",
      transition: [`border-color ${t("duration.normal")} ${t("easing.standard")}`, `background-color ${t("duration.normal")} ${t("easing.standard")}`].join(", "),
      _hover: { borderColor: t("color.fg") },
      _checked: { borderColor: t("color.primary"), background: t("color.primary") },
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
      _invalid: { borderColor: t("color.danger-solid") },
      _disabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
    },
  },
  variants: {
    orientation: {
      horizontal: { flexDirection: "row", flexWrap: "wrap" },
      vertical: { flexDirection: "column", flexWrap: "nowrap" },
    },
    size: {
      sm: {
        "slot:item": { fontSize: t("text.sm") },
        "slot:control": { fontSize: t("text.sm") },
        "slot:radio": { width: "1rem", height: "1rem" },
      },
      md: {
        "slot:item": { fontSize: t("text.md") },
        "slot:control": { fontSize: t("text.md") },
        "slot:radio": { width: "1.25rem", height: "1.25rem" },
      },
    },
  },
  defaultVariants: { orientation: "vertical", size: "md" },
});
