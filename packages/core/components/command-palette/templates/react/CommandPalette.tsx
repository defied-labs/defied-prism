import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  useCollection,
  useCollectionItem,
  useComposedRefs,
  useControllableState,
  useIsomorphicLayoutEffect,
  type Collection,
  type CollectionRecord,
} from "@defied-prism/react";
import {
  hideOthers,
  lockScroll,
  nextIndex,
  onDismiss,
  slotClass,
  trapFocus,
  variantData,
  type StyleSlots,
} from "@defied-prism/core";
import {
  filterCommands,
  firstEnabled,
  isApplePlatform,
  matchesCommand,
  matchesShortcut,
  isTypingShortcut,
  parseShortcut,
  type CommandItem as CommandItemData,
} from "@defied-prism/core/components/command-palette";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

export type { CommandItemData };

type Size = "sm" | "md" | "lg";

type ItemRecord = CollectionRecord<{
  /** DOM id of the option element. */
  id: string;
  value: string;
  textValue?: string;
  keywords?: readonly string[];
  disabled?: boolean;
  group?: string;
  /** The item's latest `onSelect`. */
  run: RefObject<(() => void) | undefined>;
}>;

interface PaletteContextValue {
  variants: { size: Size };
  label: string;
  listboxId: string;
  query: string;
  setQuery: (query: string) => void;
  hasResults: boolean;
  highlightedId: string | null;
  setHighlighted: (id: string) => void;
  isItemVisible: (id: string) => boolean;
  isGroupVisible: (group: string) => boolean;
  collection: Collection<ItemRecord>;
  choose: (id: string) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);
const GroupContext = createContext<string | undefined>(undefined);

function usePalette(part: string): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <CommandPalette>`);
  return ctx;
}

export interface CommandPaletteProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "role"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the chosen command's value (after the item's own `onSelect`). */
  onSelect?: (value: string) => void;
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

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onSelect,
      closeOnSelect = true,
      label = "Command palette",
      filter = matchesCommand,
      shortcut,
      size = "md",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useControllableState({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const [query, setQuery] = useState("");
    const [highlightedId, setHighlighted] = useState<string | null>(null);

    const baseId = useId();
    const listboxId = `${baseId}-listbox`;

    const contentRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const composedRef = useComposedRefs(ref, contentRef);
    const variants = useMemo(() => ({ size }), [size]);

    // Items register through context, in any structure; kept in DOM order
    const collection = useCollection<ItemRecord>();
    const records = collection.items;
    const ordered = useMemo(() => filterCommands(records, query, filter), [records, query, filter]);
    const visibleIds = useMemo(() => new Set(ordered.map((r) => r.id)), [ordered]);
    const blank = !query.trim();

    const isItemVisible = useCallback(
      // Unregistered items (first render) show while the query is blank
      (id: string) => (collection.get(id) ? visibleIds.has(id) : blank),
      [collection, visibleIds, blank],
    );
    const isGroupVisible = useCallback(
      (group: string) => {
        const members = records.filter((r) => r.group === group);
        return members.length === 0 ? blank : members.some((r) => visibleIds.has(r.id));
      },
      [records, visibleIds, blank],
    );

    // Highlight the first enabled match whenever the matches change
    const orderedKey = ordered.map((r) => r.id).join("\n");
    useEffect(() => {
      const first = firstEnabled(ordered);
      setHighlighted(first === -1 ? null : ordered[first]!.id);
    }, [orderedKey]);

    // Start fresh each time the palette opens
    useIsomorphicLayoutEffect(() => {
      if (open) setQuery("");
    }, [open]);

    const setOpenRef = useRef(setOpen);
    setOpenRef.current = setOpen;
    const openRef = useRef(open);
    openRef.current = open;

    useEffect(() => {
      const content = contentRef.current;
      const portal = portalRef.current;
      if (!open || !content || !portal) return;
      const cleanups = [
        lockScroll(),
        hideOthers(portal),
        onDismiss({
          inside: () => [content],
          onDismiss: () => setOpenRef.current(false),
        }),
        trapFocus(content, { initialFocus: inputRef.current }),
      ];
      return () => {
        for (const cleanup of cleanups.reverse()) cleanup();
      };
    }, [open]);

    // Optional global shortcut toggles the palette
    useEffect(() => {
      if (!shortcut || typeof document === "undefined") return;
      const parsed = parseShortcut(shortcut);
      const apple = isApplePlatform(navigator.platform || navigator.userAgent);
      const handler = (event: globalThis.KeyboardEvent) => {
        if (event.defaultPrevented || !matchesShortcut(event, parsed, apple)) return;
        if (isTypingShortcut(parsed, event.target as HTMLElement | null)) return;
        event.preventDefault();
        setOpenRef.current(!openRef.current);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [shortcut]);

    // Keep the highlighted command in view
    useEffect(() => {
      if (highlightedId) document.getElementById(highlightedId)?.scrollIntoView?.({ block: "nearest" });
    }, [highlightedId]);

    const choose = (id: string) => {
      const record = collection.get(id);
      if (!record || record.disabled) return;
      record.run.current?.();
      onSelect?.(record.value);
      if (closeOnSelect) setOpen(false);
    };

    const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Home":
        case "End": {
          if (ordered.length === 0) return;
          event.preventDefault();
          const current = ordered.findIndex((r) => r.id === highlightedId);
          const next =
            current === -1 && (event.key === "ArrowDown" || event.key === "ArrowUp")
              ? firstEnabled(ordered, event.key === "ArrowUp")
              : nextIndex(event.key, Math.max(current, 0), ordered.length, {
                  orientation: "vertical",
                  isDisabled: (i) => !!ordered[i]!.disabled,
                });
          if (next !== null && next !== -1) setHighlighted(ordered[next]!.id);
          break;
        }
        case "Enter": {
          if (highlightedId && visibleIds.has(highlightedId)) {
            event.preventDefault();
            choose(highlightedId);
          }
          break;
        }
      }
    };

    const hasResults = ordered.length > 0;
    const ctx: PaletteContextValue = {
      variants,
      label,
      listboxId,
      query,
      setQuery,
      hasResults,
      highlightedId: highlightedId && visibleIds.has(highlightedId) ? highlightedId : null,
      setHighlighted,
      isItemVisible,
      isGroupVisible,
      collection,
      choose,
      onInputKeyDown,
      inputRef,
    };

    if (!open || typeof document === "undefined") return null;

    return createPortal(
      <PaletteContext.Provider value={ctx}>
        <div ref={portalRef}>
          <div
            aria-hidden="true"
            data-state="open"
            data-slot="command-palette-overlay"
            {...variantData(variants)}
            className={slotClass(slots, "overlay", variants)}
          />
          <div
            {...props}
            ref={composedRef}
            role="dialog"
            aria-modal="true"
            aria-label={props["aria-labelledby"] ? undefined : (props["aria-label"] ?? label)}
            tabIndex={-1}
            data-state="open"
            data-slot="command-palette-content"
            {...variantData(variants)}
            className={slotClass(slots, "content", variants, className)}
          >
            {children}
          </div>
        </div>
      </PaletteContext.Provider>,
      document.body,
    );
  },
);
CommandPalette.displayName = "CommandPalette";

export interface CommandInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "size"> {}

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ placeholder = "Type a command or search…", className, onChange, onKeyDown, ...props }, ref) => {
    const ctx = usePalette("CommandInput");
    const composedRef = useComposedRefs(ref, ctx.inputRef);
    return (
      <input
        aria-label="Search commands"
        {...props}
        ref={composedRef}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={ctx.hasResults}
        aria-controls={ctx.listboxId}
        aria-activedescendant={ctx.highlightedId ?? undefined}
        placeholder={placeholder}
        value={ctx.query}
        data-slot="command-palette-input"
        {...variantData(ctx.variants)}
        className={slotClass(slots, "input", ctx.variants, className)}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) ctx.setQuery(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) ctx.onInputKeyDown(event);
        }}
      />
    );
  },
);
CommandInput.displayName = "CommandInput";

export interface CommandListProps extends HTMLAttributes<HTMLDivElement> {}

/** The listbox. Stays mounted when nothing matches so `aria-controls` stays valid. */
export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(({ className, ...props }, ref) => {
  const ctx = usePalette("CommandList");
  return (
    <div
      aria-label={props["aria-labelledby"] ? undefined : ctx.label}
      {...props}
      ref={ref}
      id={ctx.listboxId}
      role="listbox"
      data-slot="command-palette-listbox"
      {...variantData(ctx.variants)}
      className={slotClass(slots, "listbox", ctx.variants, className)}
    />
  );
});
CommandList.displayName = "CommandList";

export interface CommandEmptyProps extends HTMLAttributes<HTMLDivElement> {}

/** Shown (as a live status) only when nothing matches. Place it next to `CommandList`, not inside. */
export const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children = "No results", ...props }, ref) => {
    const ctx = usePalette("CommandEmpty");
    if (ctx.hasResults) return null;
    return (
      <div
        {...props}
        ref={ref}
        role="status"
        data-slot="command-palette-empty"
        {...variantData(ctx.variants)}
        className={slotClass(slots, "empty", ctx.variants, className)}
      >
        {children}
      </div>
    );
  },
);
CommandEmpty.displayName = "CommandEmpty";

export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
  heading?: ReactNode;
}

/** A labelled group of items; not rendered while none of its items match. */
export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, className, children, ...props }, ref) => {
    const ctx = usePalette("CommandGroup");
    const key = useId();
    const labelId = `${key}-label`;
    const content = <GroupContext.Provider value={key}>{children}</GroupContext.Provider>;
    // Items stay mounted (and registered) while the group is hidden
    if (!ctx.isGroupVisible(key)) return content;
    return (
      <div
        {...props}
        ref={ref}
        role="group"
        aria-labelledby={heading != null ? labelId : undefined}
        data-slot="command-palette-group"
        {...variantData(ctx.variants)}
        className={slotClass(slots, "group", ctx.variants, className)}
      >
        {heading != null && (
          <div
            id={labelId}
            data-slot="command-palette-group-label"
            {...variantData(ctx.variants)}
            className={slotClass(slots, "groupLabel", ctx.variants)}
          >
            {heading}
          </div>
        )}
        {content}
      </div>
    );
  },
);
CommandGroup.displayName = "CommandGroup";

export interface CommandItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  /** Searchable text; defaults to the rendered text content. */
  textValue?: string;
  /** Extra search terms (aliases, descriptions). */
  keywords?: readonly string[];
  disabled?: boolean;
  /** Runs when this command is chosen, before the palette's `onSelect`. */
  onSelect?: () => void;
}

export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  (
    { value, textValue, keywords, disabled = false, onSelect, className, onClick, onMouseDown, onPointerMove, ...props },
    ref,
  ) => {
    const ctx = usePalette("CommandItem");
    const group = useContext(GroupContext);
    const id = useId();
    const elementRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, elementRef);
    const onSelectRef = useRef(onSelect);
    onSelectRef.current = onSelect;

    // Text is remembered by value while the item is filtered out (not rendered)
    useCollectionItem(
      ctx.collection,
      { id, value, textValue, keywords, disabled, group, run: onSelectRef },
      elementRef,
    );

    if (!ctx.isItemVisible(id)) return null;
    const highlighted = ctx.highlightedId === id;

    return (
      <div
        {...props}
        ref={composedRef}
        id={id}
        role="option"
        aria-selected={highlighted}
        aria-disabled={disabled || undefined}
        data-highlighted={highlighted ? "" : undefined}
        data-value={value}
        data-slot="command-palette-item"
        {...variantData(ctx.variants)}
        className={slotClass(slots, "item", ctx.variants, className)}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          // Keep focus in the input while clicking
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (!event.defaultPrevented && !disabled && !highlighted) ctx.setHighlighted(id);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) ctx.choose(id);
        }}
      />
    );
  },
);
CommandItem.displayName = "CommandItem";

export interface CommandSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

/** Decorative divider; hidden while searching. */
export const CommandSeparator = forwardRef<HTMLDivElement, CommandSeparatorProps>(({ className, ...props }, ref) => {
  const ctx = usePalette("CommandSeparator");
  if (ctx.query.trim()) return null;
  return (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      data-slot="command-palette-separator"
      {...variantData(ctx.variants)}
      className={slotClass(slots, "separator", ctx.variants, className)}
    />
  );
});
CommandSeparator.displayName = "CommandSeparator";
