import { defineRecipe, token as t } from "@defied/prism-style-engine";

const focusRing = {
  outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
  outlineOffset: t("focus.ring-offset"),
};

// Annotated: several token references in one template outgrow TypeScript's union limit
const morph: string = `${t("duration.normal")} ${t("easing.emphasized")}`;
const fast: string = `${t("duration.fast")} ${t("easing.standard")}`;
// The mobile panel slides in slowly, as on defied.dev; collapses under reduced motion
const slide: string = `calc(${t("duration.slow")} * 2)`;

export default defineRecipe({
  name: "header",
  base: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: t("space.4"),
    width: "100%",
    paddingInline: t("space.4"),
    paddingBlock: t("space.3"),
    borderStyle: "solid",
    borderColor: t("color.border"),
    background: `color-mix(in oklab, ${t("color.bg")} 70%, transparent)`,
    backdropFilter: "blur(12px)",
    color: t("color.fg"),
    fontFamily: t("font.sans"),
    lineHeight: t("leading.normal"),
    // A backdrop filter would make the full-screen nav fixed to the header, not the viewport
    _open: { backdropFilter: "none" },
  },
  slots: {
    brand: {
      display: "inline-flex",
      alignItems: "center",
      gap: t("space.2"),
      flexShrink: "0",
      borderRadius: t("radius.sm"),
      color: "inherit",
      fontSize: t("text.lg"),
      fontWeight: t("weight.semibold"),
      textDecorationLine: "none",
      _focusVisible: focusRing,
    },
    nav: {
      position: "relative",
      flex: "1 1 auto",
      minWidth: "0",
      // Collapsed: a full-screen panel that slides in from the inline end
      _vertical: {
        position: "fixed",
        inset: "0",
        zIndex: t("z.overlay"),
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: t("space.8"),
        paddingInline: t("space.6"),
        paddingBlock: t("space.12"),
        overflowY: "auto",
        background: t("color.bg"),
        transform: "translateX(var(--prism-header-panel-x, 100%))",
        visibility: "var(--prism-header-panel-visibility, hidden)",
        transition: `transform ${slide} ${t("easing.standard")}, visibility 0s linear var(--prism-header-panel-delay, ${slide})`,
      },
      _open: {
        "--prism-header-panel-x": "0%",
        "--prism-header-panel-visibility": "visible",
        "--prism-header-panel-delay": "0s",
      },
    },
    list: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: t("space.6"),
      margin: "0",
      padding: "0",
      listStyle: "none",
      _vertical: { flexDirection: "column", gap: t("space.4") },
    },
    item: {
      position: "relative",
      _vertical: { display: "flex", flexDirection: "column", alignItems: "center", position: "static" },
    },
    trigger: {
      paddingInline: "0",
      paddingBlock: t("space.1"),
      borderWidth: "0",
      borderRadius: t("radius.sm"),
      background: "transparent",
      color: t("color.fg"),
      fontFamily: "inherit",
      fontSize: t("text.md"),
      lineHeight: "inherit",
      cursor: "pointer",
      transition: `opacity ${fast}`,
      _hoverAny: { opacity: "0.9" },
      _focusVisible: focusRing,
      _vertical: { fontSize: t("text.3xl"), fontWeight: t("weight.bold"), textTransform: "uppercase" },
    },
    // Positions a menu under its trigger; the padding bridges the gap so the pointer can cross it
    content: {
      position: "absolute",
      top: "100%",
      left: "50%",
      zIndex: t("z.dropdown"),
      translate: "-50% 0",
      paddingTop: t("space.8"),
      animation: `prism-fade-in ${morph}`,
      _vertical: { position: "static", translate: "none", paddingTop: t("space.2") },
    },
    panel: {
      boxSizing: "border-box",
      display: "grid",
      gridTemplateColumns: "repeat(var(--prism-header-columns, 1), max-content)",
      gap: `${t("space.4")} ${t("space.10")}`,
      padding: t("space.4"),
      fontSize: t("text.sm"),
      _vertical: { gridTemplateColumns: "minmax(0, 1fr)", justifyItems: "center", gap: t("space.2"), padding: "0" },
    },
    // The one surface behind every menu: it moves and resizes from menu to menu
    viewport: {
      position: "absolute",
      zIndex: t("z.dropdown"),
      boxSizing: "border-box",
      borderRadius: "1rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: t("color.border"),
      background: t("color.bg"),
      boxShadow: t("shadow.lg"),
      pointerEvents: "none",
      opacity: "0",
      scale: "0.85",
      translate: `0 ${t("space.2")}`,
      transitionProperty: "left, top, width, height, opacity, scale, translate",
      transitionDuration: t("duration.normal"),
      transitionTimingFunction: t("easing.emphasized"),
      _open: { opacity: "1", scale: "1", translate: "0 0" },
      _vertical: { display: "none" },
    },
    link: {
      display: "flex",
      alignItems: "flex-start",
      gap: t("space.2"),
      borderRadius: t("radius.sm"),
      color: t("color.muted-fg"),
      textDecorationLine: "none",
      transition: `color ${fast}`,
      _hoverAny: { color: t("color.fg") },
      _current: { color: t("color.fg") },
      _focusVisible: focusRing,
      "part:media": {
        display: "block",
        flexShrink: "0",
        overflow: "hidden",
        borderRadius: t("radius.md"),
        boxShadow: t("shadow.lg"),
      },
      "part:body": { display: "flex", flexDirection: "column", gap: t("space.1") },
      "part:title": { color: t("color.fg"), fontSize: t("text.xl"), fontWeight: t("weight.bold"), lineHeight: t("leading.tight") },
      "part:description": { maxWidth: "10rem", fontSize: t("text.sm"), lineHeight: t("leading.snug") },
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: t("space.4"),
      flexShrink: "0",
      marginInlineStart: "auto",
    },
    toggle: {
      flexShrink: "0",
    },
    close: {
      alignSelf: "center",
      width: "90%",
    },
  },
  variants: {
    variant: {
      // Full width, ruled off from the page below
      bar: {
        borderWidth: "0 0 1px 0",
        borderRadius: "0",
        maxWidth: "none",
        marginInline: "0",
        marginBlockStart: "0",
        boxShadow: "none",
      },
      // A rounded, centered bar that floats over the page (defied.dev)
      floating: {
        borderWidth: "1px",
        borderRadius: "1rem",
        maxWidth: "64rem",
        marginInline: "auto",
        marginBlockStart: t("space.5"),
        boxShadow: t("shadow.md"),
      },
    },
    position: {
      // Still the positioning context for the nav
      static: { position: "relative" },
      sticky: { position: "sticky", top: "0", insetInline: "auto", zIndex: t("z.sticky") },
      fixed: { position: "fixed", top: "0", insetInline: "0", zIndex: t("z.sticky") },
    },
  },
  defaultVariants: { variant: "bar", position: "sticky" },
});
