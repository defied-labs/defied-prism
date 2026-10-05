import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Slot } from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

type Size = "sm" | "md";

const BreadcrumbContext = createContext<{ size: Size } | null>(null);

function useVariants(part: string): { size: Size } {
  const context = useContext(BreadcrumbContext);
  if (!context) throw new Error(`<${part}> must be used inside <Breadcrumb>.`);
  return context;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  size?: Size;
  /** Separator between items (decorative, hidden from assistive tech). Default "/". */
  separator?: ReactNode;
  /** Collapse middle items behind an ellipsis button when there are more items than this. */
  maxItems?: number;
  /** Items kept before the ellipsis when collapsed (default 1). */
  itemsBeforeCollapse?: number;
  /** Items kept after the ellipsis when collapsed (default 1). */
  itemsAfterCollapse?: number;
  /** Accessible name of the ellipsis button; receives the number of hidden items. */
  expandLabel?: (hidden: number) => string;
}

/**
 * `<nav aria-label="Breadcrumb"><ol>`: pass `BreadcrumbItem`s as children;
 * separators are inserted between them.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      size = "md",
      separator = "/",
      maxItems,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      expandLabel = (hidden) => `Show ${hidden} more`,
      className,
      children,
      "aria-label": ariaLabel = "Breadcrumb",
      ...props
    },
    ref,
  ) => {
    const variants = { size };
    const [expanded, setExpanded] = useState(false);
    const listRef = useRef<HTMLOListElement>(null);
    const items = Children.toArray(children).filter(isValidElement) as ReactElement[];

    const collapse =
      !expanded &&
      maxItems !== undefined &&
      items.length > maxItems &&
      itemsBeforeCollapse + itemsAfterCollapse < items.length;

    const hidden = collapse ? items.length - itemsBeforeCollapse - itemsAfterCollapse : 0;

    // Move focus to the first revealed item so keyboard users continue from there
    const focusRevealed = useRef(false);
    useEffect(() => {
      if (!expanded || !focusRevealed.current) return;
      focusRevealed.current = false;
      const revealed = listRef.current?.querySelectorAll<HTMLElement>(
        '[data-slot="breadcrumb-item"]',
      )[itemsBeforeCollapse];
      revealed?.querySelector<HTMLElement>("a[href], button, [tabindex]")?.focus();
    }, [expanded, itemsBeforeCollapse]);

    const expand = () => {
      focusRevealed.current = true;
      setExpanded(true);
    };

    const visible: ReactNode[] = collapse
      ? [
          ...items.slice(0, itemsBeforeCollapse),
          <li
            key="__ellipsis"
            data-slot="breadcrumb-item"
            {...variantData(variants)}
            className={slotClass(slots, "item", variants)}
          >
            <button
              type="button"
              aria-label={expandLabel(hidden)}
              data-slot="breadcrumb-ellipsis"
              {...variantData(variants)}
              className={slotClass(slots, "ellipsis", variants)}
              onClick={expand}
            >
              <span aria-hidden="true">…</span>
            </button>
          </li>,
          ...items.slice(items.length - itemsAfterCollapse),
        ]
      : items;

    return (
      <BreadcrumbContext.Provider value={variants}>
        <nav
          {...props}
          ref={ref}
          aria-label={ariaLabel}
          data-slot="breadcrumb"
          {...variantData(variants)}
          className={slotClass(slots, "root", variants, className)}
        >
          <ol
            ref={listRef}
            data-slot="breadcrumb-list"
            {...variantData(variants)}
            className={slotClass(slots, "list", variants)}
          >
            {visible.flatMap((item, index) =>
              index === 0
                ? [item]
                : [
                    <li
                      key={`__separator-${index}`}
                      aria-hidden="true"
                      data-slot="breadcrumb-separator"
                      {...variantData(variants)}
                      className={slotClass(slots, "separator", variants)}
                    >
                      {separator}
                    </li>,
                    item,
                  ],
            )}
          </ol>
        </nav>
      </BreadcrumbContext.Provider>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => {
    const variants = useVariants("BreadcrumbItem");
    return (
      <li
        {...props}
        ref={ref}
        data-slot="breadcrumb-item"
        {...variantData(variants)}
        className={slotClass(slots, "item", variants, className)}
      />
    );
  },
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render your own link (e.g. a router Link) instead of a plain <a>. */
  asChild?: boolean;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    const variants = useVariants("BreadcrumbLink");
    const shared = {
      "data-slot": "breadcrumb-link",
      ...variantData(variants),
      className: slotClass(slots, "link", variants, className),
    };
    if (asChild) {
      return (
        <Slot {...(props as HTMLAttributes<HTMLElement>)} ref={ref} {...shared}>
          {children as ReactElement}
        </Slot>
      );
    }
    return (
      <a {...props} ref={ref} {...shared}>
        {children}
      </a>
    );
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

/** The current page: not a link, marked aria-current="page". */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const variants = useVariants("BreadcrumbPage");
    return (
      <span
        {...props}
        ref={ref}
        aria-current="page"
        data-slot="breadcrumb-page"
        {...variantData(variants)}
        className={slotClass(slots, "page", variants, className)}
      />
    );
  },
);
BreadcrumbPage.displayName = "BreadcrumbPage";
