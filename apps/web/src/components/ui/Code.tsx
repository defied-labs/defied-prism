import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, type StyleSlots } from "@defied/prism-core";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export type CodeProps = HTMLAttributes<HTMLElement>;

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "font-prism-mono [font-size:0.85em] font-prism-medium [line-height:inherit] text-prism-fg bg-prism-muted [border-width:1px] border-solid border-prism-border rounded-prism-md [padding-block:0.1em] [padding-inline:0.4em] [white-space:break-spaces] [overflow-wrap:anywhere] [box-decoration-break:clone]",
    "variants": {}
  }
});

/** Inline code. */
export const Code = forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => (
  <code {...props} ref={ref} data-slot="code" className={slotClass(slots, "root", {}, className)} />
));

Code.displayName = "Code";
