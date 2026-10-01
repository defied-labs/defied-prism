import { defineRecipe, token as t } from "@defied-prism/style-engine";

// The template sets --prism-slider-fraction (0-1) on the root.
const f = "var(--prism-slider-fraction, 0)";
const thumb = "var(--prism-slider-thumb)";

export default defineRecipe({
  name: "slider",
  // root: the focusable role="slider" element; track, range and thumb are presentational
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    flexShrink: "0",
    touchAction: "none",
    userSelect: "none",
    cursor: "pointer",
    _focusVisible: {
      outline: "none",
      "part:thumb": {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
    },
    _ariaDisabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
    "part:thumb": {
      position: "absolute",
      boxSizing: "border-box",
      width: thumb,
      height: thumb,
      borderRadius: t("radius.full"),
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: t("color.primary"),
      background: t("color.bg"),
      boxShadow: t("shadow.sm"),
      pointerEvents: "none",
    },
  },
  slots: {
    track: {
      position: "relative",
      flexGrow: "1",
      alignSelf: "stretch",
      overflow: "hidden",
      borderRadius: t("radius.full"),
      background: t("color.muted"),
    },
    range: {
      position: "absolute",
      background: t("color.primary"),
    },
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: "row",
        width: "100%",
        minWidth: "8rem",
        height: thumb,
        paddingBlock: `calc((${thumb} - var(--prism-slider-track)) / 2)`,
        paddingInline: "0",
        "slot:range": { top: "0", bottom: "0", left: "0", width: `calc(${f} * 100%)`, height: "auto" },
        "part:thumb": { left: `calc(${f} * (100% - ${thumb}))`, top: "0" },
      },
      vertical: {
        flexDirection: "column",
        width: thumb,
        minWidth: "0",
        height: "8rem",
        paddingInline: `calc((${thumb} - var(--prism-slider-track)) / 2)`,
        paddingBlock: "0",
        "slot:range": { left: "0", right: "0", bottom: "0", height: `calc(${f} * 100%)`, width: "auto" },
        "part:thumb": { top: `calc((1 - ${f}) * (100% - ${thumb}))`, left: "0" },
      },
    },
    size: {
      sm: { "--prism-slider-thumb": "1rem", "--prism-slider-track": "0.25rem" },
      md: { "--prism-slider-thumb": "1.25rem", "--prism-slider-track": "0.375rem" },
    },
  },
  defaultVariants: { orientation: "horizontal", size: "md" },
});
