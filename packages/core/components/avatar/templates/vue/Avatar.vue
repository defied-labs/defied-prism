<script lang="ts">
import type { ImgHTMLAttributes } from "vue";

export type AvatarStatus = "loading" | "loaded" | "fallback";

/** "Ada Lovelace" -> "AL"; "Cher" -> "C". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0]!)[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1]!)[0] ?? "") : "";
  return first + last;
}

export interface AvatarProps {
  src?: string;
  /**
   * Required. The person's name: the avatar is exposed as `role="img"` with
   * this name, and the default initials come from it. Pass `""` when the
   * avatar is decorative (the name is printed next to it): it is then hidden
   * from assistive technology.
   */
  alt: string;
  /** Shown while the image loads or when it fails (or use the `fallback` slot). Defaults to initials of `alt`. */
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  /** Extra attributes for the `<img>`. */
  imageProps?: Omit<ImgHTMLAttributes, "src" | "alt">;
}
</script>

<script setup lang="ts">
import { normalizeClass, onMounted, ref, useAttrs, watch } from "vue";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

/**
 * The root carries the accessible name, so it is announced once whether the
 * image or the fallback is showing; the `<img>` and initials are presentational.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<AvatarProps>(), {
  src: undefined,
  fallback: undefined,
  size: "md",
  shape: "circle",
  imageProps: undefined,
});
const emit = defineEmits<{ statusChange: [status: AvatarStatus] }>();

const attrs = useAttrs();
const variants = () => ({ size: props.size, shape: props.shape });

const status = ref<AvatarStatus>(props.src ? "loading" : "fallback");
const imgRef = ref<HTMLImageElement | null>(null);

function update(next: AvatarStatus) {
  if (status.value === next) return;
  status.value = next;
  emit("statusChange", next);
}

// Reset on src change; pick up images that are already complete (cache).
function sync() {
  if (!props.src) return update("fallback");
  const img = imgRef.value;
  update(img?.complete && img.naturalWidth > 0 ? "loaded" : "loading");
}
onMounted(sync);
watch(() => props.src, sync, { flush: "post" });

// Read in the render, so attribute changes re-render the avatar
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  const a11y = props.alt === "" ? { "aria-hidden": "true" as const } : { role: "img", "aria-label": props.alt };
  return {
    ...a11y,
    ...rest,
    "data-slot": "avatar",
    "data-state": status.value,
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

const imageAttrs = () => {
  const { class: className, onLoad, onError, ...rest } = (props.imageProps ?? {}) as Record<string, unknown>;
  return {
    ...rest,
    src: props.src,
    alt: "",
    hidden: status.value !== "loaded",
    "data-slot": "avatar-image",
    ...variantData(variants()),
    class: slotClass(slots, "image", variants(), normalizeClass(className)),
    onLoad: (event: Event) => {
      (onLoad as ((event: Event) => void) | undefined)?.(event);
      update("loaded");
    },
    onError: (event: Event) => {
      (onError as ((event: Event) => void) | undefined)?.(event);
      update("fallback");
    },
  };
};

const fallbackAttrs = () => ({
  "aria-hidden": "true" as const,
  "data-slot": "avatar-fallback",
  ...variantData(variants()),
  class: slotClass(slots, "fallback", variants()),
});
</script>

<template>
  <span v-bind="rootAttrs()">
    <img v-if="props.src && status !== 'fallback'" :key="props.src" ref="imgRef" v-bind="imageAttrs()" />
    <span v-if="status !== 'loaded'" v-bind="fallbackAttrs()">
      <slot name="fallback">{{ props.fallback ?? getInitials(props.alt) }}</slot>
    </span>
  </span>
</template>
