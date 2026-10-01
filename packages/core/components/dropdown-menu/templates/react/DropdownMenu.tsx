import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Slot, useComposedRefs, useControllableState } from "@defied-prism/react";
import { nextIndex, onDismiss, slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import {
  TYPEAHEAD_TIMEOUT,
  isTypeaheadKey,
  typeaheadIndex,
} from "@defied-prism/core/components/dropdown-menu";
import { Button, type ButtonProps } from "./Button";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

type FocusTarget = "first" | "last";

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerId: string;
  triggerRef: MutableRefObject<HTMLElement | null>;
  /** Which item to focus when the menu opens. */
  focusTarget: MutableRefObject<FocusTarget>;
  /** Set while Space toggles a checkable item, which keeps the menu open. */
  keepOpen: MutableRefObject<boolean>;
  close: (focusTrigger: boolean) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(part: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`<${part}> must be used inside <DropdownMenu>.`);
  return context;
}

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Positioning root: the menu is placed relative to it. */
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ open: openProp, defaultOpen = false, onOpenChange, className, children, ...props }, ref) => {
    const [open, setOpen] = useControllableState({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    const id = useId();
    const triggerRef = useRef<HTMLElement | null>(null);
    const focusTarget = useRef<FocusTarget>("first");
    const keepOpen = useRef(false);

    const close = (focusTrigger: boolean) => {
      setOpen(false);
      if (focusTrigger) triggerRef.current?.focus();
    };

    return (
      <MenuContext.Provider
        value={{
          open,
          setOpen,
          contentId: `${id}-menu`,
          triggerId: `${id}-trigger`,
          triggerRef,
          focusTarget,
          keepOpen,
          close,
        }}
      >
        <div
          {...props}
          ref={ref}
          data-slot="dropdown-menu"
          data-state={open ? "open" : "closed"}
          className={slotClass(slots, "root", {}, className)}
        >
          {children}
        </div>
      </MenuContext.Provider>
    );
  },
);
DropdownMenu.displayName = "DropdownMenu";

export interface DropdownMenuTriggerProps extends ButtonProps {
  /** Render your own element (a link, an icon, a menu item) instead of a Prism Button. */
  asChild?: boolean;
}

/** The menu button. Enter, Space and ArrowDown open on the first item; ArrowUp on the last. */
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  (
    { asChild = false, variant = "outline", size, fullWidth, loading, children, onClick, onKeyDown, ...props },
    ref,
  ) => {
    const menu = useMenu("DropdownMenuTrigger");
    const composedRef = useComposedRefs<HTMLButtonElement>(
      ref,
      menu.triggerRef as MutableRefObject<HTMLButtonElement | null>,
    );
    const triggerProps = {
      id: menu.triggerId,
      ...props,
      "aria-haspopup": "menu",
      "aria-expanded": menu.open,
      "aria-controls": menu.open ? menu.contentId : undefined,
      "data-state": menu.open ? "open" : "closed",
      // Enter and Space activate the button, which opens on the first item
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        menu.focusTarget.current = "first";
        menu.setOpen(!menu.open);
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          menu.focusTarget.current = event.key === "ArrowDown" ? "first" : "last";
          menu.setOpen(true);
        }
      },
    } as ButtonProps;

    if (asChild) {
      return (
        <Slot ref={composedRef as Ref<HTMLElement>} {...(triggerProps as HTMLAttributes<HTMLElement>)}>
          {children as ReactElement}
        </Slot>
      );
    }
    return (
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={loading}
        data-slot="dropdown-menu-trigger"
        {...triggerProps}
        ref={composedRef}
      >
        {children}
      </Button>
    );
  },
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment with the trigger. */
  align?: "start" | "end";
}

const isDisabledItem = (item: HTMLElement) => item.getAttribute("aria-disabled") === "true";
const itemLabel = (item: HTMLElement) => item.dataset.textValue ?? item.textContent ?? "";

/**
 * The menu (role="menu"). Items get real focus: arrows, Home/End and
 * typeahead move it; Escape and Tab close; outside clicks close.
 */
export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = "start", className, children, onKeyDown, ...props }, ref) => {
    const menu = useMenu("DropdownMenuContent");
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, contentRef);
    const variants = { align };
    const typeahead = useRef<{ buffer: string; timer?: ReturnType<typeof setTimeout> }>({
      buffer: "",
    });

    const closeRef = useRef(menu.close);
    closeRef.current = menu.close;

    const items = () =>
      Array.from(contentRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);

    useEffect(() => {
      const content = contentRef.current;
      if (!menu.open || !content) return;
      const enabled = items().filter((item) => !isDisabledItem(item));
      const target = menu.focusTarget.current === "last" ? enabled[enabled.length - 1] : enabled[0];
      (target ?? content).focus();
      menu.focusTarget.current = "first";

      const state = typeahead.current;
      const off = onDismiss({
        inside: () => [content, menu.triggerRef.current],
        onDismiss: (reason) => closeRef.current(reason === "escape"),
      });
      return () => {
        off();
        clearTimeout(state.timer);
        state.buffer = "";
      };
    }, [menu.open]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const list = items();
      const current = list.indexOf(document.activeElement as HTMLElement);
      const active = list[current];
      const isDisabled = (i: number) => isDisabledItem(list[i]!);

      if (event.key === "Tab") {
        // Close. Tab continues from the trigger's place in the page;
        // Shift+Tab lands on the trigger itself.
        if (event.shiftKey) event.preventDefault();
        menu.triggerRef.current?.focus();
        menu.setOpen(false);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!active) return;
        menu.keepOpen.current = event.key === " " && active.getAttribute("role") !== "menuitem";
        active.click();
        menu.keepOpen.current = false;
        return;
      }
      const next = nextIndex(event.key, current, list.length, { orientation: "vertical", isDisabled });
      if (next !== null) {
        event.preventDefault();
        list[next]?.focus();
        return;
      }
      if (isTypeaheadKey(event)) {
        event.preventDefault();
        const state = typeahead.current;
        clearTimeout(state.timer);
        state.buffer += event.key;
        state.timer = setTimeout(() => {
          state.buffer = "";
        }, TYPEAHEAD_TIMEOUT);
        const match = typeaheadIndex(list.map(itemLabel), current, state.buffer, { isDisabled });
        if (match !== null) list[match]!.focus();
      }
    };

    // Stays mounted while closed so uncontrolled checkbox and radio state survives
    return (
      <div
        aria-labelledby={menu.triggerId}
        {...props}
        ref={composedRef}
        id={menu.contentId}
        role="menu"
        tabIndex={-1}
        hidden={!menu.open}
        data-state={menu.open ? "open" : "closed"}
        data-slot="dropdown-menu-content"
        {...variantData(variants)}
        className={slotClass(slots, "content", variants, className)}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

interface BaseItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  disabled?: boolean;
  /**
   * Called when the item is activated (click, Enter, Space). The menu then
   * closes and focus returns to the trigger, unless you call
   * `event.preventDefault()`.
   */
  onSelect?: (event: Event) => void;
  /** Text for typeahead when the item's content isn't plain text. */
  textValue?: string;
}

interface ItemImplProps extends BaseItemProps {
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  slot: "item" | "checkboxItem" | "radioItem";
  dataSlot: string;
  checked?: boolean;
  onActivate?: () => void;
}

const MenuItemImpl = forwardRef<HTMLDivElement, ItemImplProps>(
  (
    {
      role,
      slot,
      dataSlot,
      checked,
      onActivate,
      disabled = false,
      onSelect,
      textValue,
      className,
      children,
      onClick,
      onFocus,
      onBlur,
      onPointerMove,
      onPointerLeave,
      ...props
    },
    ref,
  ) => {
    const menu = useMenu("DropdownMenuItem");
    const [highlighted, setHighlighted] = useState(false);

    return (
      <div
        {...props}
        ref={ref}
        role={role}
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        aria-checked={checked}
        data-text-value={textValue}
        data-state={checked === undefined ? undefined : checked ? "checked" : "unchecked"}
        data-highlighted={highlighted ? "" : undefined}
        data-slot={dataSlot}
        className={slotClass(slots, slot, {}, className)}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          onActivate?.();
          const selectEvent = new Event("prism.menu.select", { cancelable: true });
          onSelect?.(selectEvent);
          if (!selectEvent.defaultPrevented && !menu.keepOpen.current) menu.close(true);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setHighlighted(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setHighlighted(false);
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus();
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (document.activeElement === event.currentTarget) {
            event.currentTarget.closest<HTMLElement>('[role="menu"]')?.focus();
          }
        }}
      >
        {children}
      </div>
    );
  },
);
MenuItemImpl.displayName = "MenuItemImpl";

export type DropdownMenuItemProps = BaseItemProps;

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>((props, ref) => (
  <MenuItemImpl {...props} ref={ref} role="menuitem" slot="item" dataSlot="dropdown-menu-item" />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

function Indicator({ checked, children }: { checked: boolean; children: ReactNode }) {
  return (
    <span aria-hidden="true" data-part="indicator">
      {checked ? children : null}
    </span>
  );
}

export interface DropdownMenuCheckboxItemProps extends BaseItemProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** Toggles on activation. Enter toggles and closes; Space toggles and keeps the menu open. */
export const DropdownMenuCheckboxItem = forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ checked: checkedProp, defaultChecked = false, onCheckedChange, children, ...props }, ref) => {
    const [checked, setChecked] = useControllableState({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });
    return (
      <MenuItemImpl
        {...props}
        ref={ref}
        role="menuitemcheckbox"
        slot="checkboxItem"
        dataSlot="dropdown-menu-checkbox-item"
        checked={checked}
        onActivate={() => setChecked(!checked)}
      >
        <Indicator checked={checked}>{"✓"}</Indicator>
        {children}
      </MenuItemImpl>
    );
  },
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

interface GroupContextValue {
  labelId: string;
  setHasLabel: (value: boolean) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

interface RadioGroupContextValue {
  value: string | null;
  setValue: (value: string | null) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

interface GroupImplProps extends HTMLAttributes<HTMLDivElement> {
  forwardedRef: Ref<HTMLDivElement>;
}

function GroupImpl({ className, children, forwardedRef, ...props }: GroupImplProps) {
  const labelId = `${useId()}-label`;
  const [hasLabel, setHasLabel] = useState(false);
  return (
    <GroupContext.Provider value={{ labelId, setHasLabel }}>
      <div
        aria-labelledby={hasLabel ? labelId : undefined}
        {...props}
        ref={forwardedRef}
        role="group"
        data-slot="dropdown-menu-group"
        className={slotClass(slots, "group", {}, className)}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

/** Groups related items; a DropdownMenuLabel inside names the group. */
export const DropdownMenuGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <GroupImpl {...props} forwardedRef={ref} />,
);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

export interface DropdownMenuRadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
}

/** A group of mutually exclusive DropdownMenuRadioItems. */
export const DropdownMenuRadioGroup = forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  ({ value: valueProp, defaultValue = null, onValueChange, ...props }, ref) => {
    const [value, setValue] = useControllableState<string | null>({
      value: valueProp,
      defaultValue,
      onChange: (next) => {
        if (next !== null) onValueChange?.(next);
      },
    });
    return (
      <RadioGroupContext.Provider value={{ value, setValue }}>
        <GroupImpl {...props} forwardedRef={ref} />
      </RadioGroupContext.Provider>
    );
  },
);
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

export interface DropdownMenuRadioItemProps extends BaseItemProps {
  value: string;
}

export const DropdownMenuRadioItem = forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ value, children, ...props }, ref) => {
    const group = useContext(RadioGroupContext);
    if (!group) throw new Error("<DropdownMenuRadioItem> must be used inside <DropdownMenuRadioGroup>.");
    const checked = group.value === value;
    return (
      <MenuItemImpl
        {...props}
        ref={ref}
        role="menuitemradio"
        slot="radioItem"
        dataSlot="dropdown-menu-radio-item"
        checked={checked}
        onActivate={() => group.setValue(value)}
      >
        <Indicator checked={checked}>{"●"}</Indicator>
        {children}
      </MenuItemImpl>
    );
  },
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

/** Names the surrounding group (or labels a section of the menu). */
export const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const group = useContext(GroupContext);
    const setHasLabel = group?.setHasLabel;
    useEffect(() => {
      if (!setHasLabel) return;
      setHasLabel(true);
      return () => setHasLabel(false);
    }, [setHasLabel]);
    return (
      <div
        id={group?.labelId}
        {...props}
        ref={ref}
        data-slot="dropdown-menu-label"
        className={slotClass(slots, "label", {}, className)}
      />
    );
  },
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      role="separator"
      data-slot="dropdown-menu-separator"
      className={slotClass(slots, "separator", {}, className)}
    />
  ),
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
