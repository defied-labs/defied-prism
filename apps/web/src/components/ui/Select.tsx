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
  type ButtonHTMLAttributes,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  useCollection,
  useCollectionItem,
  useComposedRefs,
  useControllableState,
  useIsomorphicLayoutEffect,
  useField,
  usePresence,
  useFieldControlProps,
  type Collection,
  type CollectionRecord,
} from "@defied-prism/react";
import { nextIndex, onDismiss, slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import {
  TYPEAHEAD_TIMEOUT,
  selectKeyAction,
  typeaheadIndex,
  type SelectItemRecord,
} from "@defied-prism/core/components/select";
import { tailwindSlots } from "@defied-prism/core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "relative flex flex-col gap-prism-1-5 font-prism-sans text-prism-fg",
    "variants": {}
  },
  "trigger": {
    "base": "box-border w-full flex items-center justify-between gap-prism-2 text-prism-fg bg-prism-bg [font-family:inherit] leading-prism-normal text-start cursor-pointer [border-width:1px] border-solid border-prism-border-strong [transition:border-color_var(--prism-duration-fast)_var(--prism-easing-standard)] enabled:not-aria-disabled:hover:border-prism-fg focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:0] aria-invalid:border-prism-danger-solid disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed [&_[data-part=icon]]:shrink-0 [&_[data-part=icon]]:text-prism-muted-fg [&_[data-part=icon]]:text-prism-xs",
    "variants": {
      "size": {
        "sm": "min-h-(--prism-control-sm) px-prism-2 text-prism-sm rounded-prism-md",
        "md": "min-h-(--prism-control-md) px-prism-3 text-prism-sm rounded-prism-md",
        "lg": "min-h-(--prism-control-lg) px-prism-4 text-prism-md rounded-prism-lg"
      }
    }
  },
  "value": {
    "base": "overflow-hidden [text-overflow:ellipsis] whitespace-nowrap [&_[data-part=placeholder]]:text-prism-muted-fg",
    "variants": {}
  },
  "listbox": {
    "base": "absolute z-(--prism-z-dropdown) [top:100%] [left:0] [right:0] mt-prism-1 box-border p-prism-1 [max-height:16rem] overflow-y-auto rounded-prism-md [border-width:1px] border-solid border-prism-border bg-prism-bg shadow-prism-lg [transform-origin:top] [animation:prism-roll-in_var(--prism-duration-normal)_var(--prism-easing-emphasized)] data-[state=closed]:pointer-events-none data-[state=closed]:[animation:prism-roll-out_var(--prism-duration-fast)_var(--prism-easing-exit)_forwards]",
    "variants": {}
  },
  "option": {
    "base": "flex items-center py-prism-1-5 px-prism-2 rounded-prism-sm text-prism-sm cursor-pointer select-none data-highlighted:bg-prism-muted aria-selected:font-prism-semibold aria-disabled:opacity-(--prism-opacity-disabled) aria-disabled:cursor-not-allowed",
    "variants": {}
  },
  "group": {
    "base": "",
    "variants": {}
  },
  "label": {
    "base": "py-prism-1-5 px-prism-2 text-prism-muted-fg text-prism-xs font-prism-semibold",
    "variants": {}
  },
  "separator": {
    "base": "[height:1px] my-prism-1 bg-prism-border",
    "variants": {}
  }
});

type Size = "sm" | "md" | "lg";

type ItemEntry = CollectionRecord<{ id: string; value: string; textValue?: string; disabled?: boolean }> &
  SelectItemRecord;

interface SelectContextValue {
  value: string | null;
  open: boolean;
  highlighted: string | null;
  /** Registered items in DOM order. */
  items: ItemEntry[];
  selected: ItemEntry | undefined;
  disabled: boolean | undefined;
  required: boolean | undefined;
  placeholder: string;
  variants: { size: Size };
  listboxId: string;
  rootRef: RefObject<HTMLDivElement | null>;
  labelling: { label?: string; labelledBy?: string };
  setLabelling: (labelling: { label?: string; labelledBy?: string }) => void;
  setValue: (value: string) => void;
  setHighlighted: (value: string | null) => void;
  openAt: (value: string | null) => void;
  close: () => void;
  collection: Collection<ItemEntry>;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(part: string): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) throw new Error(`<${part}> must be used within <Select>`);
  return context;
}

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Selected value (controlled). */
  value?: string | null;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** Submits the selected value with forms through a hidden input. */
  name?: string;
  disabled?: boolean;
  /** Marks the selection as required (aria-required). */
  required?: boolean;
  size?: Size;
  /** Shown by `SelectValue` when nothing is selected. */
  placeholder?: string;
  /** Start with the list open. */
  defaultOpen?: boolean;
}

/**
 * A select-only combobox (WAI-ARIA APG): a button-like combobox that opens
 * a listbox. Focus stays on the combobox; the highlighted option is conveyed
 * with aria-activedescendant. Tab selects the highlighted option and moves on.
 *
 * `SelectContent` stays mounted (hidden) while closed, so items register and
 * the trigger can show the selected item's text at any time.
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      name,
      disabled: disabledProp,
      required: requiredProp,
      size = "md",
      placeholder = "Select…",
      defaultOpen = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useControllableState<string | null>({
      value: valueProp,
      defaultValue,
      onChange: (next) => {
        if (next !== null) onValueChange?.(next);
      },
    });
    const [open, setOpen] = useState(defaultOpen);
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [labelling, setLabelling] = useState<{ label?: string; labelledBy?: string }>({});
    // Field supplies disabled/required when the Select doesn't
    const { disabled, required } = useFieldControlProps({
      disabled: disabledProp,
      required: requiredProp,
    });

    const collection = useCollection<ItemEntry>();
    const { items } = collection;
    const selected = items.find((item) => item.value === value);

    // defaultOpen: highlight the selection (or the first option) once items exist
    const pendingOpen = useRef(defaultOpen);
    useIsomorphicLayoutEffect(() => {
      if (!pendingOpen.current || items.length === 0) return;
      pendingOpen.current = false;
      const first = items.find((item) => !item.disabled);
      setHighlighted((selected && !selected.disabled ? selected : first)?.value ?? null);
    }, [items]);

    const rootRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, rootRef);
    const listboxId = `${useId()}-listbox`;
    const variants = { size };

    const close = useCallback(() => {
      setOpen(false);
      setHighlighted(null);
    }, []);
    const openAt = useCallback((next: string | null) => {
      setOpen(true);
      setHighlighted(next);
    }, []);

    // Escape and outside clicks close the list (without closing an outer dialog)
    useEffect(() => {
      if (!open) return;
      return onDismiss({ inside: () => [rootRef.current], onDismiss: close });
    }, [open, close]);

    // Keep the highlighted option in view
    useEffect(() => {
      if (!open || highlighted === null) return;
      items.find((item) => item.value === highlighted)?.node?.scrollIntoView?.({ block: "nearest" });
    }, [open, highlighted]);

    const context: SelectContextValue = {
      value,
      open,
      highlighted,
      items,
      selected,
      disabled,
      required,
      placeholder,
      variants,
      listboxId,
      rootRef,
      labelling,
      setLabelling,
      setValue,
      setHighlighted,
      openAt,
      close,
      collection,
    };

    return (
      <SelectContext.Provider value={context}>
        <div
          {...props}
          ref={composedRef}
          data-slot="select"
          data-state={open ? "open" : "closed"}
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          {children}
          {name && <input type="hidden" name={name} value={value ?? ""} disabled={disabled} />}
        </div>
      </SelectContext.Provider>
    );
  },
);
Select.displayName = "Select";

export interface SelectTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "role" | "disabled" | "aria-invalid"> {
  "aria-invalid"?: boolean | "true" | "false";
}

/** The combobox button. Renders `<SelectValue />` unless given children. */
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      id: idProp,
      className,
      children,
      onClick,
      onKeyDown,
      onBlur,
      "aria-describedby": describedByProp,
      "aria-invalid": invalidProp,
      ...props
    },
    ref,
  ) => {
    const ctx = useSelectContext("SelectTrigger");
    const { items, open, value, selected, highlighted, variants } = ctx;
    const generatedId = useId();
    const control = useFieldControlProps({
      id: idProp,
      disabled: ctx.disabled,
      required: ctx.required,
      "aria-describedby": describedByProp,
      "aria-invalid": invalidProp,
    });
    const typeahead = useRef<{ buffer: string; timer?: ReturnType<typeof setTimeout> }>({
      buffer: "",
    });
    useEffect(() => () => clearTimeout(typeahead.current.timer), []);

    // The listbox is named like the trigger
    const label = props["aria-label"];
    const labelledBy = props["aria-labelledby"];
    const { setLabelling } = ctx;
    useEffect(() => {
      setLabelling({ label, labelledBy });
    }, [label, labelledBy, setLabelling]);

    const enabled = items.filter((item) => !item.disabled);
    const highlightedIndex = items.findIndex((item) => item.value === highlighted);
    const highlightedItem = items[highlightedIndex];
    const selectedOrFirst = selected && !selected.disabled ? selected : enabled[0];

    const choose = (item: ItemEntry | undefined) => {
      if (!item || item.disabled) return;
      ctx.setValue(item.value);
      ctx.close();
    };

    const search = (key: string, current: number) => {
      const state = typeahead.current;
      clearTimeout(state.timer);
      state.buffer += key;
      state.timer = setTimeout(() => {
        state.buffer = "";
      }, TYPEAHEAD_TIMEOUT);
      const index = typeaheadIndex(
        items.map((item) => item.textValue),
        current,
        state.buffer,
        { isDisabled: (i) => items[i]!.disabled },
      );
      return index === null ? undefined : items[index];
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const typing = typeahead.current.buffer !== "";
      switch (selectKeyAction(event, open, typing)) {
        case "open":
          event.preventDefault();
          ctx.openAt(selectedOrFirst?.value ?? null);
          break;
        case "openFirst":
          event.preventDefault();
          ctx.openAt(enabled[0]?.value ?? null);
          break;
        case "openLast":
          event.preventDefault();
          ctx.openAt(enabled[enabled.length - 1]?.value ?? null);
          break;
        case "navigate": {
          event.preventDefault();
          const next =
            highlightedIndex === -1
              ? selectedOrFirst
                ? items.indexOf(selectedOrFirst)
                : -1
              : nextIndex(event.key, highlightedIndex, items.length, {
                  orientation: "vertical",
                  loop: false,
                  isDisabled: (i) => items[i]!.disabled,
                });
          if (next !== null && next !== -1) ctx.setHighlighted(items[next]!.value);
          break;
        }
        case "select":
          event.preventDefault();
          choose(highlightedItem);
          if (!highlightedItem) ctx.close();
          break;
        case "selectAndBlur":
          // Tab keeps its default: focus moves on
          choose(highlightedItem);
          ctx.close();
          break;
        case "typeahead": {
          event.preventDefault();
          if (open) {
            const match = search(event.key, highlightedIndex);
            if (match) ctx.setHighlighted(match.value);
          } else {
            const match = search(event.key, items.findIndex((item) => item.value === value));
            if (match) ctx.setValue(match.value);
          }
          break;
        }
        // "close" (Escape) is handled by the dismiss layer
      }
    };

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (open) ctx.close();
      else ctx.openAt(selectedOrFirst?.value ?? null);
    };

    const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
      onBlur?.(event);
      if (!ctx.rootRef.current?.contains(event.relatedTarget as Node)) ctx.close();
    };

    return (
      <button
        {...props}
        ref={ref}
        id={control.id ?? `${generatedId}-trigger`}
        type="button"
        role="combobox"
        disabled={control.disabled}
        aria-required={control.required || undefined}
        aria-describedby={control["aria-describedby"]}
        aria-invalid={control["aria-invalid"]}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? ctx.listboxId : undefined}
        aria-activedescendant={open && highlightedItem ? highlightedItem.id : undefined}
        data-state={open ? "open" : "closed"}
        data-slot="select-trigger"
        {...variantData(variants)}
        className={slotClass(slots, "trigger", variants, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        {children ?? <SelectValue />}
        <span aria-hidden="true" data-part="icon">
          {"▾"}
        </span>
      </button>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  /** Overrides the Select's placeholder. */
  placeholder?: ReactNode;
}

/** The selected item's text, or the placeholder. */
export const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { selected, variants, ...ctx } = useSelectContext("SelectValue");
    return (
      <span
        {...props}
        ref={ref}
        data-slot="select-value"
        {...variantData(variants)}
        className={slotClass(slots, "value", variants, className)}
      >
        {selected ? (
          selected.textValue
        ) : (
          <span data-part="placeholder">{placeholder ?? ctx.placeholder}</span>
        )}
      </span>
    );
  },
);
SelectValue.displayName = "SelectValue";

export type SelectContentProps = HTMLAttributes<HTMLDivElement>;

/** The listbox. Always mounted (hidden while closed) so items can register. */
export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, listboxId, labelling, variants } = useSelectContext("SelectContent");
    const field = useField();
    const labelledBy =
      labelling.labelledBy ?? (field && !labelling.label ? field.labelId : undefined);
    const listboxRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, listboxRef);
    // Stays visible with data-state="closed" while the exit animation plays
    const { present, state } = usePresence(open, listboxRef);
    return (
      <div
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : labelling.label}
        {...props}
        ref={composedRef}
        id={listboxId}
        role="listbox"
        tabIndex={-1}
        hidden={!present}
        data-state={state}
        data-slot="select-listbox"
        {...variantData(variants)}
        className={slotClass(slots, "listbox", variants, className)}
      >
        {children}
      </div>
    );
  },
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  value: string;
  disabled?: boolean;
  /** Text for typeahead and the trigger; defaults to the item's text content. */
  textValue?: string;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (
    { value, disabled = false, textValue, id: idProp, className, children, onClick, onPointerMove, onMouseDown, ...props },
    ref,
  ) => {
    const ctx = useSelectContext("SelectItem");
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const nodeRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, nodeRef);
    const { variants } = ctx;
    useCollectionItem(ctx.collection, { id, value, disabled, textValue }, nodeRef);

    const isHighlighted = ctx.highlighted === value;
    return (
      <div
        {...props}
        ref={composedRef}
        id={id}
        role="option"
        aria-selected={ctx.value === value}
        aria-disabled={disabled || undefined}
        data-highlighted={isHighlighted ? "" : undefined}
        data-slot="select-option"
        {...variantData(variants)}
        className={slotClass(slots, "option", variants, className)}
        // Keep focus on the combobox while clicking an option
        onMouseDown={(event) => {
          onMouseDown?.(event);
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (!event.defaultPrevented && !disabled && !isHighlighted) ctx.setHighlighted(value);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          ctx.setValue(value);
          ctx.close();
        }}
      >
        {children}
      </div>
    );
  },
);
SelectItem.displayName = "SelectItem";

const GroupContext = createContext<{ labelId: string; setHasLabel: (has: boolean) => void } | null>(
  null,
);

export type SelectGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "role">;

/** A labelled group of items; name it with `SelectLabel`. */
export const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ className, children, ...props }, ref) => {
    const { variants } = useSelectContext("SelectGroup");
    const labelId = `${useId()}-label`;
    const [hasLabel, setHasLabel] = useState(false);
    const group = useMemo(() => ({ labelId, setHasLabel }), [labelId]);
    return (
      <GroupContext.Provider value={group}>
        <div
          aria-labelledby={hasLabel ? labelId : undefined}
          {...props}
          ref={ref}
          role="group"
          data-slot="select-group"
          {...variantData(variants)}
          className={slotClass(slots, "group", variants, className)}
        >
          {children}
        </div>
      </GroupContext.Provider>
    );
  },
);
SelectGroup.displayName = "SelectGroup";

export type SelectLabelProps = HTMLAttributes<HTMLDivElement>;

/** A group's heading; names the surrounding `SelectGroup`. */
export const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => {
    const { variants } = useSelectContext("SelectLabel");
    const group = useContext(GroupContext);
    const setHasLabel = group?.setHasLabel;
    useIsomorphicLayoutEffect(() => {
      if (!setHasLabel) return;
      setHasLabel(true);
      return () => setHasLabel(false);
    }, [setHasLabel]);
    return (
      <div
        id={group?.labelId}
        {...props}
        ref={ref}
        role="presentation"
        data-slot="select-label"
        {...variantData(variants)}
        className={slotClass(slots, "label", variants, className)}
      />
    );
  },
);
SelectLabel.displayName = "SelectLabel";

export type SelectSeparatorProps = HTMLAttributes<HTMLDivElement>;

/** A visual divider between items (hidden from assistive technology). */
export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => {
    const { variants } = useSelectContext("SelectSeparator");
    return (
      <div
        {...props}
        ref={ref}
        aria-hidden="true"
        data-slot="select-separator"
        {...variantData(variants)}
        className={slotClass(slots, "separator", variants, className)}
      />
    );
  },
);
SelectSeparator.displayName = "SelectSeparator";
