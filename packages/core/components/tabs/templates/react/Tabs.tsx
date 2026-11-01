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
  /** Tab values in DOM order; empty until measured. */
  order: string[];
  /** Which way the last change moved: forward = to a later tab. */
  direction: "forward" | "backward" | undefined;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${part}> must be used inside <Tabs>.`);
  return context;
}

const idFor = (baseId: string, kind: "tab" | "panel", value: string) =>
  `${baseId}-${kind}-${value.replace(/\s+/g, "-")}`;

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

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
    const rootRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, rootRef);

    // Tab order drives where inactive panels wait (before or after the
    // selected one), so a change slides the panels the way the tabs moved
    const [order, setOrder] = useState<string[]>([]);
    const [direction, setDirection] = useState<"forward" | "backward">();
    const previous = useRef(value);
    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const next = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'))
        .filter((tab) => tab.closest('[data-slot="tabs"]') === root)
        .map((tab) => tab.dataset.value ?? "");
      setOrder((current) => (current.length === next.length && current.every((v, i) => v === next[i]) ? current : next));
      const from = previous.current == null ? -1 : next.indexOf(previous.current);
      const to = value == null ? -1 : next.indexOf(value);
      previous.current = value;
      if (from !== -1 && to !== -1 && from !== to) setDirection(to > from ? "forward" : "backward");
    });

    return (
      <TabsContext.Provider
        value={{ value, select, baseId: useId(), orientation, activationMode, variants, order, direction }}
      >
        <div
          {...props}
          ref={composedRef}
          data-slot="tabs"
          data-direction={direction}
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
  ({ value, className, style, ...props }, ref) => {
    const tabs = useTabs("TabPanel");
    const selected = tabs.value === value;
    const panelRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, panelRef);

    // Inactive panels stay in layout (all panels share one grid cell, so the
    // region keeps the size of the largest) but are invisible and inert
    useIsomorphicLayoutEffect(() => {
      panelRef.current?.toggleAttribute("inert", !selected);
    }, [selected]);

    // -1 waits before the selected panel, 1 after it
    const self = tabs.order.indexOf(value);
    const active = tabs.value == null ? -1 : tabs.order.indexOf(tabs.value);
    const offset = selected ? 0 : self !== -1 && active !== -1 && self < active ? -1 : 1;

    return (
      <div
        {...props}
        ref={composedRef}
        role="tabpanel"
        id={idFor(tabs.baseId, "panel", value)}
        aria-labelledby={idFor(tabs.baseId, "tab", value)}
        tabIndex={0}
        aria-hidden={selected ? undefined : true}
        data-state={selected ? "active" : "inactive"}
        data-direction={tabs.direction}
        data-slot="tabs-panel"
        style={{
          ...style,
          "--prism-tabs-offset": offset,
          ...(selected ? null : { visibility: "hidden" }),
        } as CSSProperties}
        {...variantData(tabs.variants)}
        className={slotClass(slots, "panel", tabs.variants, className)}
      />
    );
  },
);
TabPanel.displayName = "TabPanel";
