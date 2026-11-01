<script setup lang="ts">
import { computed, normalizeClass, provide, ref, useAttrs, useId, watch } from "vue";
import { useCollection, useControllableState } from "@defied/prism-vue";
import { nextIndex, slotClass, variantData } from "@defied/prism-core";
import {
  filterCommands,
  firstEnabled,
  isApplePlatform,
  isTypingShortcut,
  matchesCommand,
  matchesShortcut,
  parseShortcut,
  type CommandItem as CommandItemData,
} from "@defied/prism-core/components/command-palette";
import { Dialog, DialogContent } from "../dialog";
import { slots } from "./styles";
import { CommandPaletteKey, type ItemRecord, type Size } from "./context";

export interface CommandPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  /** Close after a command is chosen (default true). */
  closeOnSelect?: boolean;
  /** Accessible name of the dialog and list (default "Command palette"). */
  label?: string;
  /** Custom matcher; defaults to text + keywords, case- and accent-insensitive. */
  filter?: (item: CommandItemData, query: string) => boolean;
  /** Global shortcut that toggles the palette, e.g. "mod+k" (mod = Meta on macOS, Ctrl elsewhere). */
  shortcut?: string;
  size?: Size;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  open: undefined,
  defaultOpen: false,
  closeOnSelect: true,
  label: "Command palette",
  filter: undefined,
  shortcut: undefined,
  size: "md",
});
const emit = defineEmits<{
  "update:open": [open: boolean];
  openChange: [open: boolean];
  /** The chosen command's value (after the item's own `select`). */
  select: [value: string];
}>();

const attrs = useAttrs();
const open = useControllableState({
  value: () => props.open,
  defaultValue: props.defaultOpen,
  onChange: (next) => {
    emit("update:open", next);
    emit("openChange", next);
  },
});
const query = ref("");
const highlighted = ref<string | null>(null);

const listboxId = `${useId()}-listbox`;
const inputRef = ref<HTMLInputElement | null>(null);
const variants = computed(() => ({ size: props.size }));

// Items register through context, in any structure; kept in DOM order
const collection = useCollection<ItemRecord>();
const records = collection.items;
const ordered = computed(() => filterCommands(records.value, query.value, props.filter ?? matchesCommand));
const visibleIds = computed(() => new Set(ordered.value.map((r) => r.id)));
const blank = computed(() => !query.value.trim());

// Unregistered items (first render) show while the query is blank
const isItemVisible = (id: string) => {
  void records.value;
  return collection.get(id) ? visibleIds.value.has(id) : blank.value;
};
const isGroupVisible = (group: string) => {
  const members = records.value.filter((r) => r.group === group);
  return members.length === 0 ? blank.value : members.some((r) => visibleIds.value.has(r.id));
};

// Highlight the first enabled match whenever the matches change
watch(
  () => ordered.value.map((r) => r.id).join("\n"),
  () => {
    const first = firstEnabled(ordered.value);
    highlighted.value = first === -1 ? null : ordered.value[first]!.id;
  },
  { immediate: true },
);

// Start fresh each time the palette opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) query.value = "";
  },
  { flush: "sync" },
);

// Optional global shortcut toggles the palette
watch(
  () => props.shortcut,
  (shortcut, _, onCleanup) => {
    if (!shortcut || typeof document === "undefined") return;
    const parsed = parseShortcut(shortcut);
    const apple = isApplePlatform(navigator.platform || navigator.userAgent);
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !matchesShortcut(event, parsed, apple)) return;
      if (isTypingShortcut(parsed, event.target as HTMLElement | null)) return;
      event.preventDefault();
      open.value = !open.value;
    };
    document.addEventListener("keydown", handler);
    onCleanup(() => document.removeEventListener("keydown", handler));
  },
  { immediate: true },
);

// Keep the highlighted command in view
watch(
  highlighted,
  (id) => {
    if (id) document.getElementById(id)?.scrollIntoView?.({ block: "nearest" });
  },
  { flush: "post" },
);

function choose(id: string) {
  const record = collection.get(id);
  if (!record || record.disabled) return;
  record.run();
  emit("select", record.value);
  if (props.closeOnSelect) open.value = false;
}

function onInputKeyDown(event: KeyboardEvent) {
  const list = ordered.value;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowUp":
    case "Home":
    case "End": {
      if (list.length === 0) return;
      event.preventDefault();
      const current = list.findIndex((r) => r.id === highlighted.value);
      const next =
        current === -1 && (event.key === "ArrowDown" || event.key === "ArrowUp")
          ? firstEnabled(list, event.key === "ArrowUp")
          : nextIndex(event.key, Math.max(current, 0), list.length, {
              orientation: "vertical",
              isDisabled: (i) => !!list[i]!.disabled,
            });
      if (next !== null && next !== -1) highlighted.value = list[next]!.id;
      break;
    }
    case "Enter": {
      const id = highlighted.value;
      if (id && visibleIds.value.has(id)) {
        event.preventDefault();
        choose(id);
      }
      break;
    }
  }
}

provide(CommandPaletteKey, {
  variants,
  label: computed(() => props.label),
  listboxId,
  query,
  hasResults: computed(() => ordered.value.length > 0),
  highlightedId: computed(() =>
    highlighted.value && visibleIds.value.has(highlighted.value) ? highlighted.value : null,
  ),
  setHighlighted: (id) => {
    highlighted.value = id;
  },
  isItemVisible,
  isGroupVisible,
  collection,
  choose,
  onInputKeyDown,
  inputRef,
});

// Read in the render, so attribute changes re-render the content
const contentAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    role: "dialog" as const,
    "aria-label": attrs["aria-labelledby"]
      ? undefined
      : ((attrs["aria-label"] as string | undefined) ?? props.label),
    "data-slot": "command-palette-content",
    ...variantData(variants.value),
    class: slotClass(slots, "content", variants.value, normalizeClass(className)),
  };
};

const overlayProps = () => ({
  "data-slot": "command-palette-overlay",
  class: slotClass(slots, "overlay", variants.value),
});
const initialFocus = () => inputRef.value;
function setOpen(next: boolean) {
  open.value = next;
}
</script>

<!-- The modal shell (teleport, presence, focus trap, Escape, outside click,
     scroll lock, inert background) is the registry Dialog, restyled here -->
<template>
  <Dialog :open="open" @update:open="setOpen">
    <DialogContent
      v-bind="contentAttrs()"
      unstyled
      :size="props.size"
      :initial-focus="initialFocus"
      :overlay-props="overlayProps()"
    >
      <slot />
    </DialogContent>
  </Dialog>
</template>
