import { cloneVNode, defineComponent, normalizeClass, normalizeStyle, Comment, Fragment, type VNode } from "vue";

type AnyProps = Record<string, any>;

/** Vue's PatchFlags.FULL_PROPS (not exported from the public API). */
const FULL_PROPS = 16;

const isHandler = (key: string) => /^on[A-Z]/.test(key);

/**
 * Merges slot props onto the child's props: event handlers run the child's
 * first, then the slot's (unless the child prevented default); classes and
 * styles combine; other child props win. Same rules as the React adapter.
 */
export function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps, ...childProps };
  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (isHandler(key) && typeof slotValue === "function" && typeof childValue === "function") {
      merged[key] = (event: { defaultPrevented?: boolean }, ...rest: unknown[]) => {
        childValue(event, ...rest);
        if (!event?.defaultPrevented) slotValue(event, ...rest);
      };
    } else if (key === "class" && slotValue && childValue) {
      merged[key] = normalizeClass([slotValue, childValue]);
    } else if (key === "style" && slotValue && childValue) {
      merged[key] = normalizeStyle([slotValue, childValue]);
    }
  }
  return merged;
}

/** First real element in a slot's output, skipping comments and unwrapping fragments. */
function firstElement(nodes: VNode[] | undefined): VNode | null {
  for (const node of nodes ?? []) {
    if (node.type === Comment) continue;
    if (node.type === Fragment) {
      const inner = firstElement(node.children as VNode[]);
      if (inner) return inner;
      continue;
    }
    return node;
  }
  return null;
}

/** Renders its single child with the Slot's attributes merged in (the `asChild` pattern). */
export const Slot = defineComponent({
  name: "PrismSlot",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const child = firstElement(slots.default?.());
      if (!child) return null;
      // cloneVNode would merge classes and handlers itself; set the props we merged instead
      const vnode = cloneVNode(child);
      vnode.props = mergeProps(attrs, child.props ?? {});
      // Diff every prop on update: the compiled child only tracked its own
      vnode.patchFlag = FULL_PROPS;
      return vnode;
    };
  },
});
