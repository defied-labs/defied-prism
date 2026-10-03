<script setup lang="ts">
import { normalizeClass, provide, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-prism/core";
import { slots } from "./styles";
import { CardKey, type CardVariants } from "./context";

export interface CardProps {
  variant?: CardVariants["variant"];
  /**
   * Block-link pattern: clicks on the card's non-interactive area activate its
   * `CardLink` (usually inside `CardTitle`). The link stays the only focusable
   * target and names the destination; other buttons/links inside the card
   * keep working on their own. The card itself never gets a role or tabindex,
   * so there is no nested-interactive trap. Text selection doesn't navigate.
   */
  interactive?: boolean;
}

/** Elements whose own clicks must not be redirected to the card's link. */
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [tabindex], [contenteditable="true"]';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CardProps>(), { variant: "outlined", interactive: false });

const attrs = useAttrs();
const variants = (): CardVariants => ({ variant: props.variant, interactive: props.interactive });
provide(CardKey, variants);

function handleClick(event: MouseEvent) {
  const onClick = attrs.onClick as ((event: MouseEvent) => void) | ((event: MouseEvent) => void)[] | undefined;
  for (const handler of [onClick].flat()) handler?.(event);
  if (!props.interactive || event.defaultPrevented) return;
  const target = event.target as Element;
  const root = event.currentTarget as HTMLElement;
  const interactiveAncestor = target.closest(INTERACTIVE);
  if (interactiveAncestor && root.contains(interactiveAncestor)) return;
  const selection = root.ownerDocument.defaultView?.getSelection?.();
  if (selection && selection.toString().length > 0) return;
  const link = root.querySelector<HTMLElement>('[data-slot="card-link"]');
  if (!link) return;
  const { ctrlKey, metaKey, shiftKey, altKey, button } = event;
  link.dispatchEvent(
    new window.MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey, metaKey, shiftKey, altKey, button }),
  );
}

// Read in the render, so attribute changes re-render the card
const rootAttrs = () => {
  const { class: className, onClick: _onClick, ...rest } = attrs;
  return {
    ...rest,
    "data-slot": "card",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
    onClick: handleClick,
  };
};
</script>

<template>
  <!-- <Card><CardHeader><CardTitle>…</CardTitle><CardDescription>…</CardDescription></CardHeader><CardContent>…</CardContent><CardFooter>…</CardFooter></Card> -->
  <div v-bind="rootAttrs()"><slot /></div>
</template>
