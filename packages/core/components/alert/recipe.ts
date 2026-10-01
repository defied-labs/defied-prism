import { defineRecipe, token as t } from "@defied-prism/style-engine";

type Status = "neutral" | "info" | "success" | "warning" | "danger";

const status = (s: Status) => ({
  background: t(`color.${s}-bg`),
  color: t(`color.${s}-fg`),
  borderColor: t(`color.${s}-border`),
});

export default defineRecipe({
  name: "alert",
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: t("space.3"),
    paddingBlock: t("space.3"),
    paddingInline: t("space.4"),
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: t("radius.lg"),
    fontFamily: t("font.sans"),
    fontSize: t("text.sm"),
    lineHeight: t("leading.normal"),
  },
  slots: {
    icon: {
      display: "inline-flex",
      flexShrink: "0",
      width: "1.25em",
      height: "1.25em",
      marginTop: "0.125em",
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
    action: {
      display: "flex",
      alignItems: "center",
      gap: t("space.2"),
      flexShrink: "0",
    },
    // Styled by IconButton; the slot only keeps it from shrinking
    close: {
      flexShrink: "0",
    },
  },
  variants: {
    status: {
      neutral: status("neutral"),
      info: status("info"),
      success: status("success"),
      warning: status("warning"),
      danger: status("danger"),
    },
  },
  defaultVariants: { status: "neutral" },
});
