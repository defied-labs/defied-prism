import {
  forwardRef,
  useMemo,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  type TableHTMLAttributes,
} from "react";
import { useControllableState } from "@defied/prism-react";
import { slotClass, variantData, type StyleSlots } from "@defied/prism-core";
import {
  ariaSort,
  nextSort,
  selectAllState,
  sortRows,
  toggleAll,
  toggleRow,
  type RowKey,
  type SortState,
} from "@defied/prism-core/components/data-table";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { tailwindSlots } from "@defied/prism-core/tailwind";

export type { RowKey, SortState };

export interface DataTableColumn<Row> {
  /** Unique column id; also the sort key. */
  id: string;
  header: ReactNode;
  /** Cell value; used for sorting and, without `cell`, for display. */
  accessor: (row: Row) => unknown;
  /** Custom cell content. */
  cell?: (row: Row, value: unknown) => ReactNode;
  sortable?: boolean;
  /** Ascending comparator on accessor values. */
  compare?: (a: unknown, b: unknown) => number;
  /** Render this column's cells as row headers (<th scope="row">). */
  rowHeader?: boolean;
}

export interface DataTableProps<Row>
  extends Omit<TableHTMLAttributes<HTMLTableElement>, "children"> {
  columns: DataTableColumn<Row>[];
  data: Row[];
  /** Stable key for each row; defaults to its index in `data`. */
  getRowId?: (row: Row, index: number) => RowKey;
  /** Visible caption (also names the table). */
  caption?: ReactNode;
  /**
   * Name of the scroll region that appears when the table is wider than its
   * container. Defaults to the caption, then `aria-label`, then "Table".
   */
  scrollLabel?: string;
  size?: "sm" | "md";
  /** Current sort (controlled); `null` = unsorted. */
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** When false, a third activation flips back to ascending instead of clearing. */
  allowUnsorted?: boolean;
  /** Sort data in the table. Set false to sort on the server from `onSortChange`. */
  manualSorting?: boolean;
  /** Locale for string collation. */
  locale?: string;
  /** Adds a checkbox column. */
  selectable?: boolean;
  /** Selected row keys (controlled). */
  selected?: RowKey[];
  defaultSelected?: RowKey[];
  onSelectedChange?: (selected: RowKey[]) => void;
  isRowSelectable?: (row: Row) => boolean;
  /** Accessible name of a row's checkbox; defaults to "Select row N". */
  getRowLabel?: (row: Row, index: number) => string;
  selectAllLabel?: string;
  /** Shown in a single row when `data` is empty. */
  empty?: ReactNode;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = tailwindSlots({
  "root": {
    "base": "",
    "variants": {}
  },
  "scroll": {
    "base": "",
    "variants": {}
  },
  "caption": {
    "base": "[caption-side:top] [margin-top:0] py-prism-2",
    "variants": {}
  },
  "headerCell": {
    "base": "border-b-prism-border-strong",
    "variants": {}
  },
  "sortButton": {
    "base": "[&_[data-part=sort-icon]]:text-prism-xs [&_[data-part=sort-icon]]:text-prism-muted-fg",
    "variants": {}
  },
  "row": {
    "base": "aria-selected:bg-prism-muted",
    "variants": {}
  },
  "cell": {
    "base": "",
    "variants": {}
  },
  "rowHeader": {
    "base": "font-prism-medium text-prism-fg [white-space:normal]",
    "variants": {}
  },
  "checkbox": {
    "base": "",
    "variants": {}
  }
});

const EMPTY: RowKey[] = [];

function DataTableInner<Row>(
  {
    columns,
    data,
    getRowId = (_row, index) => index,
    caption,
    scrollLabel,
    size = "md",
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    allowUnsorted = true,
    manualSorting = false,
    locale,
    selectable = false,
    selected: selectedProp,
    defaultSelected = EMPTY,
    onSelectedChange,
    isRowSelectable,
    getRowLabel = (_row, index) => `Select row ${index + 1}`,
    selectAllLabel = "Select all rows",
    empty = "No results.",
    className,
    ...props
  }: DataTableProps<Row>,
  ref: ForwardedRef<HTMLTableElement>,
) {
  const variants = { size };
  const [sort, setSort] = useControllableState<SortState | null>({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
  });
  const [selectedList, setSelectedList] = useControllableState<RowKey[]>({
    value: selectedProp,
    defaultValue: defaultSelected,
    onChange: onSelectedChange,
  });
  const selected = useMemo(() => new Set(selectedList), [selectedList]);

  const rows = useMemo(() => {
    const keyed = data.map((row, index) => ({ row, index, key: getRowId(row, index) }));
    if (manualSorting) return keyed;
    return sortRows(
      keyed,
      sort,
      columns.map((c) => ({ id: c.id, compare: c.compare, accessor: (k: (typeof keyed)[number]) => c.accessor(k.row) })),
      locale,
    );
    // getRowId is usually an inline function; keys only change with data
  }, [data, columns, sort, manualSorting, locale]);

  const selectableKeys = rows.filter((r) => !isRowSelectable || isRowSelectable(r.row)).map((r) => r.key);
  const allState = selectAllState(selected, selectableKeys);
  const commit = (next: Set<RowKey>) => setSelectedList([...next]);

  const variantAttrs = variantData(variants);
  const headerCellClass = slotClass(slots, "headerCell", variants);
  const rowClass = slotClass(slots, "row", variants);
  const cellClass = slotClass(slots, "cell", variants);
  const rowHeaderClass = slotClass(slots, "rowHeader", variants);
  const checkboxClass = slotClass(slots, "checkbox", variants);
  const checkboxSize = size === "sm" ? "sm" : "md";

  return (
    // Table owns the scroll container: wide tables scroll inside it, and only
    // then is it a named, focusable region (named by the caption by default).
    <Table
      {...props}
      ref={ref}
      density={size === "sm" ? "compact" : "normal"}
      scrollLabel={scrollLabel}
      data-slot="data-table"
      {...variantAttrs}
      className={slotClass(slots, "root", variants, className)}
    >
      {caption != null && (
        <TableCaption data-slot="data-table-caption" {...variantAttrs} className={slotClass(slots, "caption", variants)}>
          {caption}
        </TableCaption>
      )}
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead data-slot="data-table-header-cell" {...variantAttrs} className={headerCellClass}>
              <Checkbox
                data-slot="data-table-checkbox"
                {...variantAttrs}
                size={checkboxSize}
                className={checkboxClass}
                aria-label={selectAllLabel}
                checked={allState === true}
                indeterminate={allState === "indeterminate"}
                disabled={selectableKeys.length === 0}
                onCheckedChange={() => commit(toggleAll(selected, selectableKeys))}
              />
            </TableHead>
          )}
          {columns.map((column) => {
            const direction = ariaSort(sort, column.id);
            return (
              <TableHead
                key={column.id}
                aria-sort={column.sortable && direction !== "none" ? direction : undefined}
                data-slot="data-table-header-cell"
                {...variantAttrs}
                className={headerCellClass}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size={size === "sm" ? "xs" : "sm"}
                    data-slot="data-table-sort-button"
                    className={slotClass(slots, "sortButton", variants)}
                    onClick={() => setSort(nextSort(sort, column.id, { allowUnsorted }))}
                  >
                    {column.header}
                    <span data-part="sort-icon" aria-hidden="true">
                      {direction === "ascending" ? "▲" : direction === "descending" ? "▼" : "↕"}
                    </span>
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow data-slot="data-table-row" {...variantAttrs} className={rowClass}>
            <TableCell
              colSpan={columns.length + (selectable ? 1 : 0)}
              data-slot="data-table-cell"
              {...variantAttrs}
              className={cellClass}
            >
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          rows.map(({ row, index, key }) => {
            const isSelected = selectable && selected.has(key);
            const canSelect = !isRowSelectable || isRowSelectable(row);
            return (
              <TableRow
                key={key}
                aria-selected={selectable ? isSelected : undefined}
                data-slot="data-table-row"
                {...variantAttrs}
                className={rowClass}
              >
                {selectable && (
                  <TableCell data-slot="data-table-cell" {...variantAttrs} className={cellClass}>
                    <Checkbox
                      data-slot="data-table-checkbox"
                      {...variantAttrs}
                      size={checkboxSize}
                      className={checkboxClass}
                      aria-label={getRowLabel(row, index)}
                      checked={isSelected}
                      disabled={!canSelect}
                      onCheckedChange={(next) => commit(toggleRow(selected, key, next))}
                    />
                  </TableCell>
                )}
                {columns.map((column) => {
                  const value = column.accessor(row);
                  const content = column.cell ? column.cell(row, value) : (value as ReactNode);
                  return column.rowHeader ? (
                    <TableHead
                      key={column.id}
                      scope="row"
                      data-slot="data-table-row-header"
                      {...variantAttrs}
                      className={rowHeaderClass}
                    >
                      {content}
                    </TableHead>
                  ) : (
                    <TableCell key={column.id} data-slot="data-table-cell" {...variantAttrs} className={cellClass}>
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

/** Generic over the row type: `<DataTable<User> columns={…} data={users} />`. */
export const DataTable = forwardRef(DataTableInner) as (<Row>(
  props: DataTableProps<Row> & { ref?: ForwardedRef<HTMLTableElement> },
) => ReactElement) & { displayName?: string };

DataTable.displayName = "DataTable";
