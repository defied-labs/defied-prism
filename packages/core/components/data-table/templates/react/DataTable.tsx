import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ChangeEvent,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  type TableHTMLAttributes,
} from "react";
import { useControllableState, useOverflow } from "@defied-prism/react";
import { slotClass, variantData, type StyleSlots } from "@defied-prism/core";
import {
  ariaSort,
  nextSort,
  selectAllState,
  sortRows,
  toggleAll,
  toggleRow,
  type RowKey,
  type SortState,
} from "@defied-prism/core/components/data-table";

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
const slots: StyleSlots = {{STYLE_SLOTS}};

const EMPTY: RowKey[] = [];

function SelectAll({
  state,
  label,
  disabled,
  className,
  onChange,
  variants,
}: {
  state: boolean | "indeterminate";
  label: string;
  disabled: boolean;
  className: string;
  onChange: () => void;
  variants: { size: "sm" | "md" };
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === "indeterminate";
  }, [state]);
  return (
    <input
      ref={ref}
      type="checkbox"
      data-slot="data-table-checkbox"
      {...variantData(variants)}
      className={className}
      aria-label={label}
      checked={state === true}
      disabled={disabled}
      onChange={onChange}
    />
  );
}

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

  const scrollRef = useRef<HTMLDivElement>(null);
  const overflowing = useOverflow(scrollRef);
  const captionId = `${useId()}-caption`;

  const headerCellClass = slotClass(slots, "headerCell", variants);
  const cellClass = slotClass(slots, "cell", variants);
  const rowHeaderClass = slotClass(slots, "rowHeader", variants);
  const checkboxClass = slotClass(slots, "checkbox", variants);

  return (
    // Wide tables scroll inside their container instead of spilling over
    // the page; only then is the container a named, focusable region.
    <div
      ref={scrollRef}
      {...(overflowing
        ? {
            role: "region",
            tabIndex: 0,
            ...(caption != null && !scrollLabel
              ? { "aria-labelledby": captionId }
              : { "aria-label": scrollLabel ?? props["aria-label"] ?? "Table" }),
          }
        : {})}
      data-slot="data-table-scroll"
      {...variantData(variants)}
      className={slotClass(slots, "scroll", variants)}
    >
    <table
      {...props}
      ref={ref}
      data-slot="data-table"
      {...variantData(variants)}
      className={slotClass(slots, "root", variants, className)}
    >
      {caption != null && (
        <caption id={captionId} data-slot="data-table-caption" {...variantData(variants)} className={slotClass(slots, "caption", variants)}>
          {caption}
        </caption>
      )}
      <thead>
        <tr>
          {selectable && (
            <th scope="col" data-slot="data-table-header-cell" {...variantData(variants)} className={headerCellClass}>
              <SelectAll
                state={allState}
                label={selectAllLabel}
                disabled={selectableKeys.length === 0}
                className={checkboxClass}
                onChange={() => commit(toggleAll(selected, selectableKeys))}
                variants={variants}
              />
            </th>
          )}
          {columns.map((column) => {
            const direction = ariaSort(sort, column.id);
            return (
              <th
                key={column.id}
                scope="col"
                aria-sort={column.sortable && direction !== "none" ? direction : undefined}
                data-slot="data-table-header-cell"
                {...variantData(variants)}
                className={headerCellClass}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    data-slot="data-table-sort-button"
                    {...variantData(variants)}
                    className={slotClass(slots, "sortButton", variants)}
                    onClick={() => setSort(nextSort(sort, column.id, { allowUnsorted }))}
                  >
                    {column.header}
                    <span data-part="sort-icon" aria-hidden="true">
                      {direction === "ascending" ? "▲" : direction === "descending" ? "▼" : "↕"}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr data-slot="data-table-row" {...variantData(variants)} className={slotClass(slots, "row", variants)}>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              data-slot="data-table-cell"
              {...variantData(variants)}
              className={cellClass}
            >
              {empty}
            </td>
          </tr>
        ) : (
          rows.map(({ row, index, key }) => {
            const isSelected = selectable && selected.has(key);
            const canSelect = !isRowSelectable || isRowSelectable(row);
            return (
              <tr
                key={key}
                aria-selected={selectable ? isSelected : undefined}
                data-slot="data-table-row"
                {...variantData(variants)}
                className={slotClass(slots, "row", variants)}
              >
                {selectable && (
                  <td data-slot="data-table-cell" {...variantData(variants)} className={cellClass}>
                    <input
                      type="checkbox"
                      data-slot="data-table-checkbox"
      {...variantData(variants)}
                      className={checkboxClass}
                      aria-label={getRowLabel(row, index)}
                      checked={isSelected}
                      disabled={!canSelect}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        commit(toggleRow(selected, key, event.currentTarget.checked))
                      }
                    />
                  </td>
                )}
                {columns.map((column) => {
                  const value = column.accessor(row);
                  const content = column.cell ? column.cell(row, value) : (value as ReactNode);
                  return column.rowHeader ? (
                    <th
                      key={column.id}
                      scope="row"
                      data-slot="data-table-row-header"
                      {...variantData(variants)}
                      className={rowHeaderClass}
                    >
                      {content}
                    </th>
                  ) : (
                    <td key={column.id} data-slot="data-table-cell" {...variantData(variants)} className={cellClass}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
    </div>
  );
}

/** Generic over the row type: `<DataTable<User> columns={…} data={users} />`. */
export const DataTable = forwardRef(DataTableInner) as (<Row>(
  props: DataTableProps<Row> & { ref?: ForwardedRef<HTMLTableElement> },
) => ReactElement) & { displayName?: string };

DataTable.displayName = "DataTable";
