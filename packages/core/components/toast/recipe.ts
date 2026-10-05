import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

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
  // Toasts slide in from, and back out to, the edge the toaster sits on
  "slot:item": {
    "--prism-slide-x": inline === "start" ? "calc(-100% - 1rem)" : inline === "end" ? "calc(100% + 1rem)" : "0",
    "--prism-slide-y": inline !== "center" ? "0" : block === "top" ? "calc(-100% - 1rem)" : "calc(100% + 1rem)",
  },
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
    // Wraps each toast; collapses its row on exit so the others glide into place
    item: {
      display: "grid",
      gridTemplateRows: "1fr",
      animation: `prism-slide-in ${t("duration.normal")} ${t("easing.emphasized")}`,
      transition: [
        `grid-template-rows ${t("duration.normal")} ${t("easing.exit")}`,
        `margin ${t("duration.normal")} ${t("easing.exit")}`,
      ].join(", "),
      _closed: {
        gridTemplateRows: "0fr",
        // Swallow the region's gap too
        marginBlockStart: `calc(-1 * ${t("space.2")})`,
        "--prism-toast-events": "none",
        animation: [
          `prism-slide-out ${t("duration.normal")} ${t("easing.exit")} forwards`,
          `prism-fade-out ${t("duration.normal")} ${t("easing.exit")} forwards`,
        ].join(", "),
      },
    },
    toast: {
      position: "relative",
      overflow: "hidden",
      minHeight: "0",
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
      pointerEvents: "var(--prism-toast-events, auto)",
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
    // Empties over the toast's duration (set inline); pauses with its timer
    progress: {
      position: "absolute",
      insetInlineStart: "0",
      insetInlineEnd: "0",
      bottom: "0",
      height: "2px",
      background: "currentColor",
      opacity: "0.4",
      transformOrigin: "left",
      animationName: "prism-countdown",
      animationTimingFunction: "linear",
      animationFillMode: "forwards",
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
