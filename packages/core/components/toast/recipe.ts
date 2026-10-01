import { defineRecipe, token as t } from "@defied-prism/style-engine";

type Status = "neutral" | "info" | "success" | "warning" | "danger";

const status = (s: Status) => ({
  "slot:toast": {
    background: t(`color.${s}-bg`),
    color: t(`color.${s}-fg`),
    borderColor: t(`color.${s}-border`),
  },
});

const edge = t("space.4");
const position = (block: "top" | "bottom", inline: "start" | "center" | "end") => ({
  top: block === "top" ? edge : "auto",
  bottom: block === "bottom" ? edge : "auto",
  insetInlineStart: inline === "end" ? "auto" : inline === "center" ? "50%" : edge,
  insetInlineEnd: inline === "end" ? edge : "auto",
  transform: inline === "center" ? "translateX(-50%)" : "none",
  // Newest toast sits nearest the screen edge
  flexDirection: block === "top" ? "column-reverse" : "column",
});

const focusRing = {
  outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
  outlineOffset: t("focus.ring-offset"),
};

export default defineRecipe({
  name: "toast",
  base: {
    position: "fixed",
    zIndex: t("z.toast"),
    display: "flex",
    gap: t("space.2"),
    width: "max-content",
    maxWidth: "calc(100vw - 2rem)",
    margin: "0",
    padding: "0",
    pointerEvents: "none",
    fontFamily: t("font.sans"),
  },
  slots: {
    toast: {
      display: "flex",
      alignItems: "flex-start",
      gap: t("space.3"),
      width: "22rem",
      maxWidth: "100%",
      paddingBlock: t("space.3"),
      paddingInline: t("space.4"),
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: t("radius.lg"),
      boxShadow: t("shadow.lg"),
      fontSize: t("text.sm"),
      lineHeight: t("leading.normal"),
      pointerEvents: "auto",
      animation: `prism-scale-in ${t("duration.normal")} ${t("easing.emphasized")}`,
      _focusVisible: focusRing,
    },
    content: {
      display: "flex",
      flexDirection: "column",
      gap: t("space.1"),
      flexGrow: "1",
      minWidth: "0",
    },
    title: {
      fontWeight: t("weight.semibold"),
      lineHeight: t("leading.tight"),
    },
    description: {
      color: "inherit",
    },
    // Action and close are Prism Button / IconButton; the slots only lay them out
    action: {
      flexShrink: "0",
    },
    close: {
      flexShrink: "0",
    },
  },
  variants: {
    position: {
      "top-start": position("top", "start"),
      "top-center": position("top", "center"),
      "top-end": position("top", "end"),
      "bottom-start": position("bottom", "start"),
      "bottom-center": position("bottom", "center"),
      "bottom-end": position("bottom", "end"),
    },
    status: {
      neutral: status("neutral"),
      info: status("info"),
      success: status("success"),
      warning: status("warning"),
      danger: status("danger"),
    },
  },
  defaultVariants: { position: "bottom-end", status: "neutral" },
});
