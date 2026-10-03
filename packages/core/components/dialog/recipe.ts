import { defineRecipe, token as t } from "@defied-prism/style-engine";

const maxWidth = (width: string) => ({ "slot:content": { maxWidth: width } });

export default defineRecipe({
  name: "dialog",
  // Dialog's root is a context provider and renders no element
  base: {},
  slots: {
    overlay: {
      position: "fixed",
      inset: "0",
      zIndex: t("z.overlay"),
      background: t("color.overlay"),
      animation: `prism-fade-in ${t("duration.normal")} ${t("easing.standard")}`,
      _closed: { animation: `prism-fade-out ${t("duration.fast")} ${t("easing.exit")} forwards` },
    },
    content: {
      position: "fixed",
      zIndex: t("z.modal"),
      // Centred by margins, not a transform, so the zoom keyframes own transform
      inset: "0",
      margin: "auto",
      height: "fit-content",
      boxSizing: "border-box",
      width: `calc(100vw - 2 * ${t("space.4")})`,
      maxHeight: `calc(100dvh - 2 * ${t("space.4")})`,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: t("space.4"),
      padding: t("space.6"),
      borderRadius: t("radius.lg"),
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: t("color.border"),
      background: t("color.bg"),
      color: t("color.fg"),
      boxShadow: t("shadow.lg"),
      fontFamily: t("font.sans"),
      // Grows out of its trigger (--prism-zoom-* set inline) and shrinks back into it
      animation: `prism-zoom-in ${t("duration.normal")} ${t("easing.emphasized")}`,
      _closed: {
        animation: `prism-zoom-out ${t("duration.fast")} ${t("easing.exit")} forwards`,
        pointerEvents: "none",
      },
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
    },
    title: {
      margin: "0",
      fontSize: t("text.lg"),
      fontWeight: t("weight.semibold"),
      lineHeight: t("leading.tight"),
    },
    description: {
      margin: "0",
      color: t("color.muted-fg"),
      fontSize: t("text.sm"),
      lineHeight: t("leading.normal"),
    },
    footer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      gap: t("space.2"),
    },
  },
  variants: {
    size: {
      sm: maxWidth("24rem"),
      md: maxWidth("32rem"),
      lg: maxWidth("42rem"),
      xl: maxWidth("56rem"),
      full: maxWidth("none"),
    },
  },
  defaultVariants: { size: "md" },
});
