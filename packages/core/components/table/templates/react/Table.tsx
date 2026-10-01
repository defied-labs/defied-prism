import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { useOverflow } from "@defied-prism/react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = {{STYLE_SLOTS}};

type TableVariants = { density: "compact" | "normal" | "relaxed"; striped?: boolean };

interface TableContextValue {
  variants: TableVariants;
  captionId: string;
  setHasCaption: (has: boolean) => void;
}

const TableContext = createContext<TableContextValue>({
  variants: { density: "normal" },
  captionId: "",
  setHasCaption: () => {},
});
/** Index of a row inside TableBody (-1 elsewhere), for striping. */

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  density?: TableVariants["density"];
  /** Alternate body row backgrounds. */
  striped?: boolean;
  /**
   * Accessible name of the scroll region when the table overflows
   * horizontally. Defaults to the `TableCaption`, then the table's
   * `aria-label`, then "Table".
   */
  scrollLabel?: string;
}

/**
 * A semantic `<table>` inside a horizontal scroll container. When (and only
 * when) the table is wider than its container, the container becomes a
 * focusable, named `role="region"`, so keyboard users can scroll it with the
 * arrow keys and screen readers announce it. When it fits, the container is a
 * plain div and adds no tab stop.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ density = "normal", striped = false, scrollLabel, className, ...props }, ref) => {
    const variants: TableVariants = { density, striped };
    const captionId = `${useId()}-caption`;
    const [hasCaption, setHasCaption] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const overflowing = useOverflow(scrollRef);

    const name = scrollLabel ?? props["aria-label"] ?? "Table";
    const region = overflowing
      ? {
          role: "region",
          tabIndex: 0,
          ...(hasCaption && !scrollLabel ? { "aria-labelledby": captionId } : { "aria-label": name }),
        }
      : {};

    return (
      <TableContext.Provider value={{ variants, captionId, setHasCaption }}>
        <div
          ref={scrollRef}
          {...region}
          data-slot="table-scroll"
          {...variantData(variants)}
          className={slotClass(slots, "scroll", variants)}
        >
          <table
            {...props}
            ref={ref}
            data-slot="table"
            {...variantData(variants)}
            className={slotClass(slots, "root", variants, className)}
          />
        </div>
      </TableContext.Provider>
    );
  },
);
Table.displayName = "Table";

/** Names the table (and its scroll region). Render it first inside Table. */
export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => {
    const { variants, captionId, setHasCaption } = useContext(TableContext);
    useEffect(() => {
      setHasCaption(true);
      return () => setHasCaption(false);
    }, [setHasCaption]);
    return (
      <caption
        id={captionId}
        {...props}
        ref={ref}
        data-slot="table-caption"
        {...variantData(variants)}
        className={slotClass(slots, "caption", variants, className)}
      />
    );
  },
);
TableCaption.displayName = "TableCaption";

type SectionProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<HTMLTableSectionElement, SectionProps>(({ className, ...props }, ref) => {
  const { variants } = useContext(TableContext);
  return (
    <thead
      {...props}
      ref={ref}
      data-slot="table-header"
      {...variantData(variants)}
      className={slotClass(slots, "header", variants, className)}
    />
  );
});
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, SectionProps>(
  ({ className, ...props }, ref) => {
    const { variants } = useContext(TableContext);
    return (
      <tbody
        {...props}
        ref={ref}
        data-slot="table-body"
        {...variantData(variants)}
        className={slotClass(slots, "body", variants, className)}
      />
    );
  },
);
TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<HTMLTableSectionElement, SectionProps>(({ className, ...props }, ref) => {
  const { variants } = useContext(TableContext);
  return (
    <tfoot
      {...props}
      ref={ref}
      data-slot="table-footer"
      {...variantData(variants)}
      className={slotClass(slots, "footer", variants, className)}
    />
  );
});
TableFooter.displayName = "TableFooter";

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    const { variants } = useContext(TableContext);
    return (
      <tr
        {...props}
        ref={ref}
        data-slot="table-row"
        {...variantData(variants)}
        className={slotClass(slots, "row", variants, className)}
      />
    );
  },
);
TableRow.displayName = "TableRow";

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Defaults to "col"; use "row" for row headers in the body. */
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ scope = "col", className, ...props }, ref) => {
    const { variants } = useContext(TableContext);
    return (
      <th
        {...props}
        scope={scope}
        ref={ref}
        data-slot="table-head"
        {...variantData(variants)}
        className={slotClass(slots, "head", variants, className)}
      />
    );
  },
);
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    const { variants } = useContext(TableContext);
    return (
      <td
        {...props}
        ref={ref}
        data-slot="table-cell"
        {...variantData(variants)}
        className={slotClass(slots, "cell", variants, className)}
      />
    );
  },
);
TableCell.displayName = "TableCell";
