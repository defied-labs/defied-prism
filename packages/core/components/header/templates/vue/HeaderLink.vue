<script setup lang="ts">
import { inject, normalizeClass, useAttrs, useSlots, type AnchorHTMLAttributes } from "vue";
import { Slot } from "@defied/prism-vue";
import { slotClass } from "@defied/prism-core";
import { slots } from "./styles";
import { NavKey, useHeader } from "./context";

export interface HeaderLinkProps {
  /**
   * Render your own link (e.g. a router link) instead of an <a>. For a
   * product entry, put the `data-part` spans (media, body, title,
   * description) inside it yourself.
   */
  asChild?: boolean;
  /** Marks the link as the current page (`aria-current="page"`). */
  active?: boolean;
  /** A line under the title, for richer menu entries (products, docs); or use the `description` slot. */
  description?: string;
}

/**
 * A navigation link; following it closes the open menu and the collapsed
 * panel. The `image` slot puts a (decorative) image beside the title.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HeaderLinkProps>(), { asChild: false, active: false, description: undefined });
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const attrs = useAttrs();
const slotsIn = useSlots();
const header = useHeader("HeaderLink");
const nav = inject(NavKey, null);

const rich = () => Boolean(props.description || slotsIn.description || slotsIn.image);

function onClick(event: MouseEvent) {
  emit("click", event);
  if (event.defaultPrevented) return;
  nav?.select(null);
  header.setOpen(false);
}

const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    "aria-current": props.active ? "page" : (rest["aria-current"] as AnchorHTMLAttributes["aria-current"]),
    "data-slot": "header-link",
    class: slotClass(slots, "link", {}, normalizeClass(className)),
  };
};
</script>

<template>
  <Slot v-if="props.asChild" v-bind="rootAttrs()" @click="onClick"><slot /></Slot>
  <a v-else v-bind="rootAttrs()" @click="onClick">
    <template v-if="rich()">
      <span v-if="$slots.image" data-part="media"><slot name="image" /></span>
      <span data-part="body">
        <span data-part="title"><slot /></span>
        <span v-if="props.description || $slots.description" data-part="description">
          <slot name="description">{{ props.description }}</slot>
        </span>
      </span>
    </template>
    <slot v-else />
  </a>
</template>
