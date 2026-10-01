import { defineRecipe, token as t } from "@defied-prism/style-engine";

// density sets custom properties on the table; head and cell read them.
const density = (block: "1" | "2" | "3", inline: "2" | "3" | "4") => ({
  "--table-pad-block": t(`space.${block}`),
  "--table-pad-inline": t(`space.${inline}`),
});

const cellBase = {
  paddingBlock: "var(--table-pad-block)",
  paddingInline: "var(--table-pad-inline)",
  textAlign: "start",
  verticalAlign: "middle",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: t("color.border"),
};

export default defineRecipe({
  name: "table",
  base: {
    width: "100%",
    borderCollapse: "collapse",
    captionSide: "bottom",
    fontFamily: t("font.sans"),
    fontSize: t("text.sm"),
    lineHeight: t("leading.normal"),
    color: t("color.fg"),
  },
  slots: {
    scroll: {
      position: "relative",
      width: "100%",
      overflowX: "auto",
      borderRadius: t("radius.sm"),
      _focusVisible: {
        outline: `${t("focus.ring-width")} solid ${t("color.ring")}`,
        outlineOffset: t("focus.ring-offset"),
      },
    },
    caption: {
      marginTop: t("space.3"),
      color: t("color.muted-fg"),
      textAlign: "start",
    },
    header: {},
    body: {},
    footer: {
      background: t("color.bg-subtle"),
      fontWeight: t("weight.medium"),
    },
    row: {
      transitionProperty: "background-color",
      transitionDuration: t("duration.fast"),
      transitionTimingFunction: t("easing.standard"),
      // Stripes: only body rows see --table-stripe (set by `striped`)
      _even: { background: "var(--table-stripe, transparent)" },
      _hoverAny: { background: t("color.muted") },
    },
    head: {
      ...cellBase,
      fontWeight: t("weight.semibold"),
      color: t("color.muted-fg"),
      whiteSpace: "nowrap",
    },
    cell: cellBase,
  },
  variants: {
    density: {
      compact: density("1", "2"),
      normal: density("2", "3"),
      relaxed: density("3", "4"),
    },
    striped: {
      true: { "slot:body": { "--table-stripe": t("color.bg-subtle") } },
    },
  },
  defaultVariants: { density: "normal" },
});
