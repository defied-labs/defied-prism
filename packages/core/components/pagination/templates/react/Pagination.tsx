import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { useControllableState } from "@defied-labs/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied-labs/prism-core";
import { clampPage, paginationRange } from "@defied-labs/prism-core/components/pagination";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Total number of pages. */
  count: number;
  /** Current page, 1-based (controlled). */
  page?: number;
  /** Initial page (uncontrolled, default 1). */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page (default 1). */
  siblings?: number;
  /** Pages always shown at the start and end (default 1). */
  boundaries?: number;
  size?: "sm" | "md";
  /** Render pages as links to these URLs instead of buttons. */
  getHref?: (page: number) => string;
  /** Accessible name of a page control (default "Page N"). */
  getPageLabel?: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
  /** Visible content of the previous / next controls. */
  previousContent?: ReactNode;
  nextContent?: ReactNode;
}

type Kind = "link" | "previous" | "next";

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      count,
      page: pageProp,
      defaultPage = 1,
      onPageChange,
      siblings = 1,
      boundaries = 1,
      size = "md",
      getHref,
      getPageLabel = (page) => `Page ${page}`,
      previousLabel = "Previous page",
      nextLabel = "Next page",
      previousContent = <span aria-hidden="true">‹</span>,
      nextContent = <span aria-hidden="true">›</span>,
      className,
      "aria-label": ariaLabel = "Pagination",
      ...props
    },
    ref,
  ) => {
    const [rawPage, setPage] = useControllableState({
      value: pageProp,
      defaultValue: defaultPage,
      onChange: onPageChange,
    });
    const page = clampPage(rawPage, count);
    const variants = { size };
    const items = paginationRange({ page, count, siblings, boundaries });

    const go = (target: number) => {
      const next = clampPage(target, count);
      if (next !== page) setPage(next);
    };

    const control = (
      kind: Kind,
      target: number,
      label: string,
      content: ReactNode,
      options: { current?: boolean; disabled?: boolean } = {},
    ) => {
      const common = {
        "aria-label": label,
        "aria-current": options.current ? ("page" as const) : undefined,
        "data-slot": `pagination-${kind}`,
        ...variantData(variants),
        className: slotClass(slots, kind, variants),
      };
      if (getHref) {
        // Links can't be disabled: drop the href so they stop being links
        return options.disabled ? (
          <a {...common} role="link" aria-disabled="true">
            {content}
          </a>
        ) : (
          <a
            {...common}
            href={getHref(target)}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              // Let modified clicks open new tabs; plain clicks update state too
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
              go(target);
            }}
          >
            {content}
          </a>
        );
      }
      return (
        <button type="button" {...common} disabled={options.disabled} onClick={() => go(target)}>
          {content}
        </button>
      );
    };

    const itemProps = {
      "data-slot": "pagination-item",
      ...variantData(variants),
      className: slotClass(slots, "item", variants),
    };

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        data-slot="pagination"
        {...variantData(variants)}
        className={slotClass(slots, "root", variants, className)}
      >
        <ul
          data-slot="pagination-list"
          {...variantData(variants)}
          className={slotClass(slots, "list", variants)}
        >
          <li {...itemProps}>
            {control("previous", page - 1, previousLabel, previousContent, {
              disabled: page <= 1,
            })}
          </li>
          {items.map((item) =>
            typeof item === "number" ? (
              <li key={item} {...itemProps}>
                {control("link", item, getPageLabel(item), item, { current: item === page })}
              </li>
            ) : (
              <li key={item} {...itemProps}>
                <span
                  aria-hidden="true"
                  data-slot="pagination-ellipsis"
                  {...variantData(variants)}
                  className={slotClass(slots, "ellipsis", variants)}
                >
                  …
                </span>
              </li>
            ),
          )}
          <li {...itemProps}>
            {control("next", page + 1, nextLabel, nextContent, { disabled: page >= count })}
          </li>
        </ul>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";
