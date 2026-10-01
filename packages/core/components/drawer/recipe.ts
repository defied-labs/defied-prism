import { defineRecipe, token as t } from "@defied-prism/style-engine";

// `size` sets the extent; `side` applies it as a width or a height
const extent = "var(--prism-drawer-size)";
const size = (value: string) => ({ "slot:content": { "--prism-drawer-size": value } });

export default defineRecipe({
  name: "drawer",
  // Drawer's root is a context provider and renders no element
  base: {},
  slots: {
    overlay: {
      position: "fixed",
      inset: "0",
      zIndex: t("z.overlay"),
      background: t("color.overlay"),
      animation: `prism-fade-in ${t("duration.normal")} ${t("easing.standard")}`,
    },
    content: {
      position: "fixed",
      zIndex: t("z.modal"),
      boxSizing: "border-box",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: t("space.4"),
      padding: t("space.6"),
      borderStyle: "solid",
      borderColor: t("color.border"),
      background: t("color.bg"),
      color: t("color.fg"),
      boxShadow: t("shadow.lg"),
      fontFamily: t("font.sans"),
      // Slides in from its edge; each side sets --prism-slide-x / -y
      animation: `prism-slide-in ${t("duration.normal")} ${t("easing.emphasized")}`,
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: `calc(-1 * ${t("focus.ring-width")})`,
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
      marginTop: "auto",
    },
  },
  variants: {
    side: {
      left: {
        "slot:content": { "--prism-slide-x": "-100%", inset: "0 auto 0 0", width: extent, maxWidth: "100vw", borderWidth: "0 1px 0 0" },
      },
      right: {
        "slot:content": { "--prism-slide-x": "100%", inset: "0 0 0 auto", width: extent, maxWidth: "100vw", borderWidth: "0 0 0 1px" },
      },
      top: {
        "slot:content": { "--prism-slide-y": "-100%", inset: "0 0 auto 0", height: extent, maxHeight: "100dvh", borderWidth: "0 0 1px 0" },
      },
      bottom: {
        "slot:content": { "--prism-slide-y": "100%", inset: "auto 0 0 0", height: extent, maxHeight: "100dvh", borderWidth: "1px 0 0 0" },
      },
    },
    size: {
      sm: size("20rem"),
      md: size("24rem"),
      lg: size("32rem"),
      full: size("100%"),
    },
  },
  defaultVariants: { side: "right", size: "md" },
});
