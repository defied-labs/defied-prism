import { forwardRef, type HTMLAttributes } from "react";
import { slotClass, type StyleSlots } from "@defied/prism-core";

export type CodeProps = HTMLAttributes<HTMLElement>;

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

/** Inline code. */
export const Code = forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => (
  <code {...props} ref={ref} data-slot="code" className={slotClass(slots, "root", {}, className)} />
));

Code.displayName = "Code";
