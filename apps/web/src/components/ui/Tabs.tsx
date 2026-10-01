import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { useComposedRefs, useControllableState } from "@defied-prism/react";
import { nextIndex, slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import { tailwindSlots } from "@defied-prism/core/tailwind";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "flex gap-prism-3 font-prism-sans",
    "variants": {
      "orientation": {
        "horizontal": "flex-col",
        "vertical": "flex-row"
      }
    }
  },
  "list": {
    "base": "flex gap-prism-1",
    "variants": {
      "orientation": {
        "horizontal": "flex-row",
        "vertical": "flex-col"
      },
      "variant": {
        "line": "[box-shadow:inset_0_-1px_0_0_var(--prism-color-border)]",
        "pills": "[box-shadow:none]"
      }
    }
  },
  "trigger": {
    "base": "inline-flex items-center justify-center gap-prism-2 [border-width:0] bg-transparent text-prism-muted-fg [font-family:inherit] font-prism-medium leading-prism-tight whitespace-nowrap cursor-pointer [transition:color_var(--prism-duration-fast)_var(--prism-easing-standard),_background-color_var(--prism-duration-fast)_var(--prism-easing-standard),_box-shadow_var(--prism-duration-fast)_var(--prism-easing-standard)] enabled:not-aria-disabled:hover:text-prism-fg aria-selected:text-prism-fg focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)] disabled:opacity-(--prism-opacity-disabled) disabled:cursor-not-allowed",
    "variants": {
      "orientation": {
        "horizontal": "[--prism-tabs-indicator:inset_0_-2px_0_0]",
        "vertical": "[--prism-tabs-indicator:inset_2px_0_0_0]"
      },
      "variant": {
        "line": "[border-radius:0] aria-selected:[box-shadow:var(--prism-tabs-indicator)_var(--prism-color-primary)]",
        "pills": "rounded-prism-md aria-selected:bg-prism-muted"
      },
      "size": {
        "sm": "min-h-(--prism-control-sm) px-prism-3 text-prism-sm",
        "md": "min-h-(--prism-control-md) px-prism-4 text-prism-sm"
      }
    }
  },
  "panel": {
    "base": "rounded-prism-sm focus-visible:[outline:var(--prism-focus-ring-width)_solid_var(--prism-color-ring)] focus-visible:[outline-offset:var(--prism-focus-ring-offset)]",
    "variants": {}
  }
});

type Orientation = "horizontal" | "vertical";

interface TabsContextValue {
  value: string | undefined;
  select: (value: string) => void;
  baseId: string;
  orientation: Orientation;
  activationMode: "automatic" | "manual";
  variants: { orientation: Orientation; variant: string; size: string };
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${part}> must be used inside <Tabs>.`);
  return context;
}

const idFor = (baseId: string, kind: "tab" | "panel", value: string) =>
  `${baseId}-${kind}-${value.replace(/\s+/g, "-")}`;

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "dir"> {
  /** Selected tab (controlled). */
  value?: string;
  /** Initially selected tab (uncontrolled). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
  /** automatic: arrow keys select; manual: arrow keys move focus, Enter/Space select. */
  activationMode?: "automatic" | "manual";
  variant?: "line" | "pills";
  size?: "sm" | "md";
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      activationMode = "automatic",
      variant = "line",
      size = "md",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [value, select] = useControllableState<string | undefined>({
      value: valueProp,
      defaultValue,
      onChange: (next) => next !== undefined && onValueChange?.(next),
    });
    const variants = { orientation, variant, size };

    return (
      <TabsContext.Provider
        value={{ value, select, baseId: useId(), orientation, activationMode, variants }}
      >
        <div
          {...props}
          ref={ref}
          data-slot="tabs"
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

export const TabList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, ...props }, ref) => {
    const { value, orientation, activationMode, select, variants } = useTabs("TabList");
    const listRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, listRef);

    // With no selected tab, keep the first enabled tab reachable by keyboard
    useEffect(() => {
      const tabs = Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
      );
      if (tabs.some((tab) => tab.tabIndex === 0)) return;
      const first = tabs.find((tab) => !tab.disabled);
      if (first) first.tabIndex = 0;
    }, [value]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
      );
      const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (current === -1) return;
      const next = nextIndex(event.key, current, tabs.length, {
        orientation,
        isDisabled: (i) => tabs[i]!.disabled,
      });
      if (next === null) return;
      event.preventDefault();
      const tab = tabs[next]!;
      tab.focus();
      if (activationMode === "automatic" && tab.dataset.value) select(tab.dataset.value);
    };

    return (
      <div
        {...props}
        ref={composedRef}
        role="tablist"
        aria-orientation={orientation}
        data-slot="tabs-list"
        {...variantData(variants)}
        className={slotClass(slots, "list", variants, className)}
        onKeyDown={handleKeyDown}
      />
    );
  },
);
TabList.displayName = "TabList";

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ value, className, disabled, onClick, ...props }, ref) => {
    const tabs = useTabs("Tab");
    const selected = tabs.value === value;

    return (
      <button
        {...props}
        ref={ref}
        type="button"
        role="tab"
        id={idFor(tabs.baseId, "tab", value)}
        aria-selected={selected}
        aria-controls={idFor(tabs.baseId, "panel", value)}
        // Roving tabindex: only the selected tab is in the tab order
        tabIndex={selected ? 0 : -1}
        disabled={disabled}
        data-value={value}
        data-state={selected ? "active" : "inactive"}
        data-slot="tabs-trigger"
        {...variantData(tabs.variants)}
        className={slotClass(slots, "trigger", tabs.variants, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !disabled) tabs.select(value);
        }}
      />
    );
  },
);
Tab.displayName = "Tab";

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, className, ...props }, ref) => {
    const tabs = useTabs("TabPanel");
    const selected = tabs.value === value;

    return (
      <div
        {...props}
        ref={ref}
        role="tabpanel"
        id={idFor(tabs.baseId, "panel", value)}
        aria-labelledby={idFor(tabs.baseId, "tab", value)}
        tabIndex={0}
        hidden={!selected}
        data-state={selected ? "active" : "inactive"}
        data-slot="tabs-panel"
        {...variantData(tabs.variants)}
        className={slotClass(slots, "panel", tabs.variants, className)}
      />
    );
  },
);
TabPanel.displayName = "TabPanel";
