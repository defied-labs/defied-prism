import {
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import { useComposedRefs } from "./hooks";

type AnyProps = Record<string, any>;

/**
 * Merges slot props onto the child's props: event handlers run the child's
 * first, then the slot's (unless the child prevented default); classNames
 * and styles combine; other child props win.
 */
export function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps, ...childProps };
  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof slotValue === "function" && typeof childValue === "function") {
      merged[key] = (event: { defaultPrevented?: boolean }, ...rest: unknown[]) => {
        childValue(event, ...rest);
        if (!event?.defaultPrevented) slotValue(event, ...rest);
      };
    } else if (key === "className" && slotValue && childValue) {
      merged[key] = `${slotValue} ${childValue}`;
    } else if (key === "style" && slotValue && childValue) {
      merged[key] = { ...slotValue, ...childValue };
    }
  }
  return merged;
}

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children: ReactElement;
}

/** Renders its single child with the slot's props and ref merged in (the `asChild` pattern). */
export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
  const childProps = (isValidElement(children) ? children.props : {}) as AnyProps;
  // React 19 exposes ref as a prop; React 18 on the element
  const childRef: Ref<HTMLElement> | undefined =
    childProps.ref ?? (children as unknown as { ref?: Ref<HTMLElement> }).ref;
  const composedRef = useComposedRefs(ref, childRef);

  if (!isValidElement(children)) return null;
  return cloneElement(children, { ...mergeProps(props, childProps), ref: composedRef } as AnyProps);
});
Slot.displayName = "Slot";
