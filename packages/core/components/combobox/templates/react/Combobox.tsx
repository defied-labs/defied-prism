import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  useCollection,
  useCollectionItem,
  useComposedRefs,
  useField,
  useFieldControlProps,
  useIsomorphicLayoutEffect,
  useMachine,
  type Collection,
  type CollectionRecord,
} from "@defied-prism/react";
import { nextIndex, onDismiss, slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import {
  ComboboxEvents,
  createComboboxMachineDefinition,
  filterOptions,
  matchesQuery,
  type ComboboxEvent,
  type ComboboxOption,
} from "@defied-prism/core/components/combobox";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

type Size = "sm" | "md" | "lg";

/** What a filter sees of each item. */
export interface ComboboxItemData {
  value: string;
  textValue: string;
  disabled: boolean;
}

/** Decides whether an item matches the typed query. */
export type ComboboxFilter = (item: ComboboxItemData, query: string) => boolean;

type ItemEntry = CollectionRecord<{
  id: string;
  value: string;
  textValue?: string;
  disabled?: boolean;
  groupId: string | null;
}> &
  ComboboxItemData;

type Labelling = { label?: string; labelledBy?: string };

interface ComboboxContextValue {
  open: boolean;
  inputValue: string;
  highlighted: string | null;
  selected: string | null;
  /** Registered items that pass the filter, in DOM order. */
  visible: ItemEntry[];
  visibleValues: Set<string>;
  visibleGroups: Set<string>;
  showList: boolean;
  disabled: boolean | undefined;
  required: boolean | undefined;
  variants: { size: Size };
  listboxId: string;
  rootRef: RefObject<HTMLDivElement | null>;
  labelling: Labelling;
  setLabelling: (labelling: Labelling) => void;
  send: (event: ComboboxEvent) => void;
  type: (value: string) => void;
  choose: (item: ItemEntry | undefined) => void;
  collection: Collection<ItemEntry>;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext(part: string): ComboboxContextValue {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`<${part}> must be used within <Combobox>`);
  return context;
}

export interface ComboboxProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Selected item value (controlled). */
  value?: string | null;
  /** Initially selected item value (uncontrolled). */
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Text in the input (controlled). */
  inputValue?: string;
  /** Called as the user types, and with the item's text when one is selected. */
  onInputValueChange?: (inputValue: string) => void;
  /**
   * Which items match the typed text. Defaults to a case- and
   * accent-insensitive "contains" on each item's text. Pass `false` to show
   * every item (e.g. results already filtered by a server).
   */
  filter?: ComboboxFilter | false;
  /** Submits the selected value with forms through a hidden input. */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  size?: Size;
  /** Start with the list open. */
  defaultOpen?: boolean;
}

const defaultFilter: ComboboxFilter = (item, query) =>
  matchesQuery({ value: item.value, label: item.textValue }, query);

/**
 * An editable combobox with list autocomplete (WAI-ARIA APG). Focus stays in
 * `ComboboxInput`; the highlighted item is conveyed with
 * aria-activedescendant. `ComboboxContent` stays mounted (hidden while
 * closed) so items register and the input can show the selected item's text.
 */
export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      inputValue: inputValueProp,
      onInputValueChange,
      filter = defaultFilter,
      name,
      disabled: disabledProp,
      required: requiredProp,
      size = "md",
      defaultOpen = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const initialSelected = valueProp !== undefined ? valueProp : defaultValue;
    const { state, send } = useMachine(() =>
      createComboboxMachineDefinition({
        selected: initialSelected,
        inputValue: inputValueProp ?? "",
        open: defaultOpen,
      }),
    );
    const { highlighted, selected } = state.data;
    const inputValue = inputValueProp ?? state.data.inputValue;
    const open = state.status === "open";
    const [labelling, setLabelling] = useState<Labelling>({});
    const { disabled, required } = useFieldControlProps({
      disabled: disabledProp,
      required: requiredProp,
    });

    const collection = useCollection<ItemEntry>();
    const { items } = collection;
    const labelOf = (value: string | null | undefined) =>
      items.find((item) => item.value === value)?.textValue ?? "";

    const visible = useMemo(() => {
      if (filter === false) return items;
      const byValue = new Map(items.map((item) => [item.value, item]));
      return filterOptions(
        items.map((item) => ({ value: item.value, label: item.textValue, disabled: item.disabled })),
        { inputValue, selected },
        (option: ComboboxOption, query) => filter(byValue.get(option.value)!, query),
      ).map((option) => byValue.get(option.value)!);
    }, [items, inputValue, selected, filter]);
    const visibleValues = useMemo(() => new Set(visible.map((item) => item.value)), [visible]);
    const visibleGroups = useMemo(
      () => new Set(visible.flatMap((item) => (item.groupId ? [item.groupId] : []))),
      [visible],
    );

    // The input shows the initial selection's text once its item registers
    const pendingLabel = useRef(initialSelected != null && inputValueProp === undefined);
    useIsomorphicLayoutEffect(() => {
      if (!pendingLabel.current) return;
      const label = labelOf(state.data.selected);
      if (!label) return;
      pendingLabel.current = false;
      if (state.data.inputValue === "") send(ComboboxEvents.sync(state.data.selected, label));
    }, [items]);

    // Follow a controlled value
    useEffect(() => {
      if (valueProp === undefined || valueProp === selected) return;
      send(ComboboxEvents.sync(valueProp, inputValueProp ?? labelOf(valueProp)));
    }, [valueProp]);

    // Follow a controlled input value
    useEffect(() => {
      if (inputValueProp === undefined || inputValueProp === state.data.inputValue) return;
      send(ComboboxEvents.sync(state.data.selected, inputValueProp));
    }, [inputValueProp]);

    const rootRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, rootRef);
    const listboxId = `${useId()}-listbox`;
    const variants = { size };

    // Escape and outside clicks close the list (without closing an outer dialog)
    useEffect(() => {
      if (!open) return;
      return onDismiss({
        inside: () => [rootRef.current],
        onDismiss: () => send(ComboboxEvents.close()),
      });
    }, [open, send]);

    // Keep the highlighted item in view
    useEffect(() => {
      if (!highlighted) return;
      items.find((item) => item.value === highlighted)?.node?.scrollIntoView?.({ block: "nearest" });
    }, [highlighted]);

    const type = (next: string) => {
      send(ComboboxEvents.input(next));
      onInputValueChange?.(next);
      if (next === "" && selected !== null && selected !== undefined) onValueChange?.(null);
    };

    const choose = (item: ItemEntry | undefined) => {
      if (!item || item.disabled) return;
      send(ComboboxEvents.select({ value: item.value, label: item.textValue }));
      if (item.textValue !== inputValue) onInputValueChange?.(item.textValue);
      if (item.value !== selected) onValueChange?.(item.value);
    };

    const context: ComboboxContextValue = {
      open,
      inputValue,
      highlighted,
      selected,
      visible,
      visibleValues,
      visibleGroups,
      showList: open && visible.length > 0,
      disabled,
      required,
      variants,
      listboxId,
      rootRef,
      labelling,
      setLabelling,
      send,
      type,
      choose,
      collection,
    };

    return (
      <ComboboxContext.Provider value={context}>
        <div
          {...props}
          ref={composedRef}
          data-slot="combobox"
          data-state={open ? "open" : "closed"}
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          {children}
          {name && <input type="hidden" name={name} value={selected ?? ""} disabled={disabled} />}
        </div>
      </ComboboxContext.Provider>
    );
  },
);
Combobox.displayName = "Combobox";

export interface ComboboxInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "size" | "role" | "type" | "disabled" | "required" | "aria-invalid"
  > {
  "aria-invalid"?: boolean | "true" | "false";
}

export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  (
    {
      id: idProp,
      className,
      onChange,
      onKeyDown,
      onBlur,
      "aria-describedby": describedByProp,
      "aria-invalid": invalidProp,
      ...props
    },
    ref,
  ) => {
    const ctx = useComboboxContext("ComboboxInput");
    const { open, visible, highlighted, selected, showList, send, variants } = ctx;
    const generatedId = useId();
    const control = useFieldControlProps({
      id: idProp,
      disabled: ctx.disabled,
      required: ctx.required,
      "aria-describedby": describedByProp,
      "aria-invalid": invalidProp,
    });

    // The listbox is named like the input
    const label = props["aria-label"];
    const labelledBy = props["aria-labelledby"];
    const { setLabelling } = ctx;
    useEffect(() => {
      setLabelling({ label, labelledBy });
    }, [label, labelledBy, setLabelling]);

    const enabled = visible.filter((item) => !item.disabled);
    const highlightedItem = visible.find((item) => item.value === highlighted);

    const move = (key: string) => {
      const current = highlightedItem ? visible.indexOf(highlightedItem) : -1;
      const next =
        current === -1
          ? visible.findIndex((item) => !item.disabled) // first enabled
          : nextIndex(key, current, visible.length, {
              orientation: "vertical",
              isDisabled: (i) => visible[i]!.disabled,
            });
      if (next !== null && next !== -1) send(ComboboxEvents.highlight(visible[next]!.value));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          event.preventDefault();
          if (!open) {
            const initial = event.altKey
              ? null
              : event.key === "ArrowDown"
                ? (enabled.find((item) => item.value === selected) ?? enabled[0])?.value
                : enabled[enabled.length - 1]?.value;
            send(ComboboxEvents.open(initial ?? null));
          } else {
            move(event.key);
          }
          break;
        }
        case "Enter": {
          if (open && highlightedItem) {
            event.preventDefault();
            ctx.choose(highlightedItem);
          }
          break;
        }
      }
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
      if (!ctx.rootRef.current?.contains(event.relatedTarget as Node)) {
        send(ComboboxEvents.close());
      }
    };

    return (
      <input
        {...props}
        ref={ref}
        id={control.id ?? `${generatedId}-input`}
        type="text"
        role="combobox"
        autoComplete="off"
        disabled={control.disabled}
        aria-required={control.required || undefined}
        aria-describedby={control["aria-describedby"]}
        aria-invalid={control["aria-invalid"]}
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? ctx.listboxId : undefined}
        aria-activedescendant={showList && highlightedItem ? highlightedItem.id : undefined}
        data-state={open ? "open" : "closed"}
        data-slot="combobox-input"
        {...variantData(variants)}
        className={slotClass(slots, "input", variants, className)}
        value={ctx.inputValue}
        onChange={(event) => {
          onChange?.(event);
          ctx.type(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    );
  },
);
ComboboxInput.displayName = "ComboboxInput";

export type ComboboxContentProps = HTMLAttributes<HTMLDivElement>;

/** The listbox. Always mounted (hidden while closed or empty) so items can register. */
export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, children, ...props }, ref) => {
    const { showList, listboxId, labelling, variants } = useComboboxContext("ComboboxContent");
    const field = useField();
    const labelledBy =
      labelling.labelledBy ?? (field && !labelling.label ? field.labelId : undefined);
    return (
      <div
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : labelling.label}
        {...props}
        ref={ref}
        id={listboxId}
        role="listbox"
        hidden={!showList}
        data-state={showList ? "open" : "closed"}
        data-slot="combobox-listbox"
        {...variantData(variants)}
        className={slotClass(slots, "listbox", variants, className)}
      >
        {children}
      </div>
    );
  },
);
ComboboxContent.displayName = "ComboboxContent";

export interface ComboboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  value: string;
  disabled?: boolean;
  /** Text for filtering and the input; defaults to the item's text content. */
  textValue?: string;
}

const GroupContext = createContext<{
  id: string;
  labelId: string;
  setHasLabel: (has: boolean) => void;
} | null>(null);

export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  (
    { value, disabled = false, textValue, id: idProp, className, children, onClick, onPointerMove, onMouseDown, ...props },
    ref,
  ) => {
    const ctx = useComboboxContext("ComboboxItem");
    const groupId = useContext(GroupContext)?.id ?? null;
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const nodeRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, nodeRef);
    const { variants } = ctx;
    useCollectionItem(ctx.collection, { id, value, disabled, textValue, groupId }, nodeRef);

    const isHighlighted = ctx.highlighted === value;
    return (
      <div
        {...props}
        ref={composedRef}
        id={id}
        role="option"
        hidden={!ctx.visibleValues.has(value)}
        aria-selected={ctx.selected === value}
        aria-disabled={disabled || undefined}
        data-highlighted={isHighlighted ? "" : undefined}
        data-slot="combobox-option"
        {...variantData(variants)}
        className={slotClass(slots, "option", variants, className)}
        // Keep focus in the input while clicking an item
        onMouseDown={(event) => {
          onMouseDown?.(event);
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (!event.defaultPrevented && !disabled && !isHighlighted) {
            ctx.send(ComboboxEvents.highlight(value));
          }
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          ctx.choose(ctx.visible.find((item) => item.value === value));
        }}
      >
        {children}
      </div>
    );
  },
);
ComboboxItem.displayName = "ComboboxItem";

export type ComboboxGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "role">;

/** A labelled group of items, hidden when none of them match. */
export const ComboboxGroup = forwardRef<HTMLDivElement, ComboboxGroupProps>(
  ({ className, children, ...props }, ref) => {
    const { variants, visibleGroups } = useComboboxContext("ComboboxGroup");
    const id = useId();
    const labelId = `${id}-label`;
    const [hasLabel, setHasLabel] = useState(false);
    const group = useMemo(() => ({ id, labelId, setHasLabel }), [id, labelId]);
    return (
      <GroupContext.Provider value={group}>
        <div
          aria-labelledby={hasLabel ? labelId : undefined}
          {...props}
          ref={ref}
          role="group"
          hidden={!visibleGroups.has(id)}
          data-slot="combobox-group"
          {...variantData(variants)}
          className={slotClass(slots, "group", variants, className)}
        >
          {children}
        </div>
      </GroupContext.Provider>
    );
  },
);
ComboboxGroup.displayName = "ComboboxGroup";

export type ComboboxLabelProps = HTMLAttributes<HTMLDivElement>;

/** A group's heading; names the surrounding `ComboboxGroup`. */
export const ComboboxLabel = forwardRef<HTMLDivElement, ComboboxLabelProps>(
  ({ className, ...props }, ref) => {
    const { variants } = useComboboxContext("ComboboxLabel");
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
        data-slot="combobox-label"
        {...variantData(variants)}
        className={slotClass(slots, "label", variants, className)}
      />
    );
  },
);
ComboboxLabel.displayName = "ComboboxLabel";

export type ComboboxEmptyProps = Omit<HTMLAttributes<HTMLDivElement>, "role">;

/**
 * Announced when the list is open and nothing matches. Place it next to
 * `ComboboxContent`, not inside it (a listbox may only contain options).
 */
export const ComboboxEmpty = forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  ({ className, children = "No results", ...props }, ref) => {
    const { open, visible, variants } = useComboboxContext("ComboboxEmpty");
    if (!open || visible.length > 0) return null;
    return (
      <div
        {...props}
        ref={ref}
        role="status"
        data-slot="combobox-empty"
        {...variantData(variants)}
        className={slotClass(slots, "empty", variants, className)}
      >
        {children}
      </div>
    );
  },
);
ComboboxEmpty.displayName = "ComboboxEmpty";
