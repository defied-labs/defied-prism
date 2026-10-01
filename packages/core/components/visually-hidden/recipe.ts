import { defineRecipe } from "@defied-prism/style-engine";

export default defineRecipe({
  name: "visually-hidden",
  base: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: "0",
  },
  variants: {
    // Skip links: back in the flow while focused
    focusable: {
      true: {
        _focus: {
          position: "static",
          width: "auto",
          height: "auto",
          margin: "0",
          overflow: "visible",
          clipPath: "none",
          whiteSpace: "normal",
        },
      },
    },
  },
});
