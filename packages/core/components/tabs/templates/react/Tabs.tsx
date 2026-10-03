import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { useComposedRefs, useControllableState } from "@defied/prism-react";
import { nextIndex, slotClass, variantData, type StyleSlots } from "@defied/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

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

type Box = { x: number; y: number; width: number; height: number };

/** A tab's box within the list, or null before layout (or in tests). */
function measure(list: HTMLElement | null, value: string | null | undefined): Box | null {
  if (!list || value == null) return null;
  const tab = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).find(
    (el) => el.dataset.value === value,
  );
  if (!tab || (!tab.offsetWidth && !tab.offsetHeight)) return null;
  return { x: tab.offsetLeft, y: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight };
}

const boxStyle = (box: Box): CSSProperties => ({
  width: box.width,
  height: box.height,
  transform: `translate(${box.x}px, ${box.y}px)`,
});

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

export const TabList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, children, onKeyDown, onPointerOver, onPointerLeave, ...props }, ref) => {
    const { value, orientation, activationMode, select, variants } = useTabs("TabList");
    const listRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, listRef);

    // Thumbs that slide between tabs: the selected indicator, and a subtle
    // highlight that follows the pointer and returns to the selection
    const [hovered, setHovered] = useState<string | null>(null);
    const [boxes, setBoxes] = useState<{ selected: Box | null; hovered: Box | null }>({
      selected: null,
      hovered: null,
    });
    useIsomorphicLayoutEffect(() => {
      const list = listRef.current;
      const update = () =>
        setBoxes({ selected: measure(list, value), hovered: measure(list, hovered ?? value) });
      update();
      const view = list?.ownerDocument.defaultView;
      if (!list || !view || !("ResizeObserver" in view)) return;
      const observer = new view.ResizeObserver(update);
      observer.observe(list);
      list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab));
      return () => observer.disconnect();
    }, [value, hovered]);

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

    const thumb = (name: string) => ({
      "aria-hidden": true,
      "data-slot": `tabs-${name}`,
      ...variantData(variants),
      className: slotClass(slots, name, variants),
    });

    return (
      <div
        {...props}
        ref={composedRef}
        role="tablist"
        aria-orientation={orientation}
        data-slot="tabs-list"
        {...variantData(variants)}
        className={slotClass(slots, "list", variants, className)}
        // Once measured, the indicator replaces the selected tab's own styling
        style={boxes.selected ? { ...style, "--prism-tabs-selected": "transparent" } as CSSProperties : style}
        onKeyDown={handleKeyDown}
        onPointerOver={(event) => {
          onPointerOver?.(event);
          const tab = (event.target as Element).closest<HTMLButtonElement>('[role="tab"]');
          if (tab && !tab.disabled && tab.dataset.value) setHovered(tab.dataset.value);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setHovered(null);
        }}
      >
        {boxes.hovered && (
          <span
            {...thumb("highlight")}
            data-state={hovered !== null ? "open" : "closed"}
            style={boxStyle(boxes.hovered)}
          />
        )}
        {boxes.selected && <span {...thumb("indicator")} style={boxStyle(boxes.selected)} />}
        {children}
      </div>
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
