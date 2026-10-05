<script setup lang="ts">
import { normalizeClass, provide, useAttrs } from "vue";
import { slotClass, variantData } from "@defied-labs/prism-core";
import { IconButton } from "../icon-button";
import { slots } from "./styles";
import { AlertKey, type AlertVariants } from "./context";

export interface AlertProps {
  status?: AlertVariants["status"];
  /**
   * Live-region politeness. By default an alert is `role="status"` (polite):
   * static page messages aren't interruptive, and messages rendered later are
   * still announced. Set `urgent` for important, time-sensitive information
   * (`role="alert"`, assertive) per the APG alert pattern.
   */
  urgent?: boolean;
  /** Renders a dismiss button (after the content) that calls this; `@dismiss` binds it. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. */
  dismissLabel?: string;
}

/**
 * `<Alert status="warning"><AlertIcon>…</AlertIcon><AlertContent><AlertTitle>…
 * </AlertTitle><AlertDescription>…</AlertDescription></AlertContent></Alert>`
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<AlertProps>(), {
  status: "neutral",
  urgent: false,
  onDismiss: undefined,
  dismissLabel: "Dismiss",
});

const attrs = useAttrs();
const variants = (): AlertVariants => ({ status: props.status });
provide(AlertKey, variants);

// Read in the render, so attribute changes re-render the alert
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    role: props.urgent ? "alert" : "status",
    ...rest,
    "data-slot": "alert",
    ...variantData(variants()),
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};

const closeAttrs = () => ({
  "aria-label": props.dismissLabel,
  "data-slot": "alert-close",
  ...variantData(variants()),
  class: slotClass(slots, "close", variants()),
});
</script>

<template>
  <div v-bind="rootAttrs()">
    <slot />
    <IconButton
      v-if="props.onDismiss"
      variant="ghost"
      size="sm"
      v-bind="closeAttrs()"
      @click="props.onDismiss()"
    >
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </IconButton>
  </div>
</template>
