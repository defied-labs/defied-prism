import { defineRecipe, token as t } from "@defied-labs/prism-style-engine";

const item = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: t("space.2"),
  paddingBlock: t("space.1-5"),
  paddingInlineEnd: t("space.2"),
  borderRadius: t("radius.sm"),
  fontSize: t("text.sm"),
  lineHeight: t("leading.normal"),
  cursor: "pointer",
  userSelect: "none",
  outline: "none",
  _highlighted: { background: t("color.muted") },
  _focusVisible: { boxShadow: `inset 0 0 0 ${t("focus.ring-width")} ${t("color.ring")}` },
  _ariaDisabled: { opacity: t("opacity.disabled"), cursor: "not-allowed" },
} as const;

// Checkbox and radio items reserve room for their check indicator
const checkable = {
  ...item,
  paddingInlineStart: t("space.6"),
  "part:indicator": {
    position: "absolute",
    left: t("space.1-5"),
    display: "inline-flex",
    fontSize: t("text.xs"),
  },
} as const;

export default defineRecipe({
  name: "dropdown-menu",
  base: {
    position: "relative",
    display: "inline-flex",
  },
  slots: {
    content: {
      position: "absolute",
      zIndex: t("z.dropdown"),
      top: "100%",
      marginTop: t("space.1"),
      boxSizing: "border-box",
      minWidth: "10rem",
      padding: t("space.1"),
      borderRadius: t("radius.md"),
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: t("color.border"),
      background: t("color.bg"),
      color: t("color.fg"),
      boxShadow: t("shadow.lg"),
      fontFamily: t("font.sans"),
      // Unrolls down from the trigger; rolls back up on close
      transformOrigin: "top",
      animation: `prism-roll-in ${t("duration.normal")} ${t("easing.emphasized")}`,
      _closed: {
        pointerEvents: "none",
        animation: `prism-roll-out ${t("duration.fast")} ${t("easing.exit")} forwards`,
      },
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
    },
    item: { ...item, paddingInlineStart: t("space.2") },
    checkboxItem: checkable,
    radioItem: checkable,
    group: {},
    label: {
      paddingBlock: t("space.1-5"),
      paddingInline: t("space.2"),
      color: t("color.muted-fg"),
      fontSize: t("text.xs"),
      fontWeight: t("weight.semibold"),
    },
    separator: {
      height: "1px",
      marginBlock: t("space.1"),
      marginInline: `calc(-1 * ${t("space.1")})`,
      background: t("color.border"),
    },
  },
  variants: {
    align: {
      start: { "slot:content": { left: "0" } },
      end: { "slot:content": { right: "0" } },
    },
  },
  defaultVariants: { align: "start" },
});
