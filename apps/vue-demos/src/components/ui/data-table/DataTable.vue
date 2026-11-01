<script setup lang="ts" generic="Row">
import { computed, normalizeClass, ref, useAttrs, type ComponentPublicInstance, type VNodeChild } from "vue";
import { useControllableState } from "@defied/prism-vue";
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
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../table";
import type { DataTableColumn } from "./types";
import styles from "./DataTable.module.css";

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  data: Row[];
  /** Stable key for each row; defaults to its index in `data`. */
  getRowId?: (row: Row, index: number) => RowKey;
  /** Visible caption (also names the table). A `#caption` slot works too. */
  caption?: string;
  /**
   * Name of the scroll region that appears when the table is wider than its
   * container. Defaults to the caption, then `aria-label`, then "Table".
   */
  scrollLabel?: string;
  size?: "sm" | "md";
  /** Current sort (controlled, `v-model:sort`); `null` = unsorted. */
  sort?: SortState | null;
  defaultSort?: SortState | null;
  /** When false, a third activation flips back to ascending instead of clearing. */
  allowUnsorted?: boolean;
  /** Sort data in the table. Set false to sort on the server from `sort-change`. */
  manualSorting?: boolean;
  /** Locale for string collation. */
  locale?: string;
  /** Adds a checkbox column. */
  selectable?: boolean;
  /** Selected row keys (controlled, `v-model:selected`). */
  selected?: RowKey[];
  defaultSelected?: RowKey[];
  isRowSelectable?: (row: Row) => boolean;
  /** Accessible name of a row's checkbox; defaults to "Select row N". */
  getRowLabel?: (row: Row, index: number) => string;
  selectAllLabel?: string;
  /** Shown in a single row when `data` is empty. An `#empty` slot works too. */
  empty?: string;
}

// Filled in by `prism add` from the component's recipe.
const slots: StyleSlots = { "root": { base: styles["root"], variants: {} }, "scroll": { base: styles["scroll"], variants: {} }, "caption": { base: styles["caption"], variants: {} }, "headerCell": { base: styles["headerCell"], variants: {} }, "sortButton": { base: styles["sortButton"], variants: {} }, "row": { base: styles["row"], variants: {} }, "cell": { base: styles["cell"], variants: {} }, "rowHeader": { base: styles["rowHeader"], variants: {} }, "checkbox": { base: styles["checkbox"], variants: {} } };

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DataTableProps<Row>>(), {
  getRowId: (_row: unknown, index: number) => index,
  caption: undefined,
  scrollLabel: undefined,
  size: "md",
  sort: undefined,
  defaultSort: null,
  allowUnsorted: true,
  manualSorting: false,
  locale: undefined,
  selectable: false,
  selected: undefined,
  defaultSelected: () => [],
  isRowSelectable: undefined,
  getRowLabel: (_row: unknown, index: number) => `Select row ${index + 1}`,
  selectAllLabel: "Select all rows",
  empty: "No results.",
});

const emit = defineEmits<{
  "update:sort": [sort: SortState | null];
  sortChange: [sort: SortState | null];
  "update:selected": [selected: RowKey[]];
  selectedChange: [selected: RowKey[]];
}>();

const attrs = useAttrs();
const variants = () => ({ size: props.size });

const sort = useControllableState<SortState | null>({
  value: () => props.sort,
  defaultValue: props.defaultSort,
  onChange: (next) => {
    emit("update:sort", next);
    emit("sortChange", next);
  },
});
const selectedList = useControllableState<RowKey[]>({
  value: () => props.selected,
  defaultValue: props.defaultSelected,
  onChange: (next) => {
    emit("update:selected", next);
    emit("selectedChange", next);
  },
});
const selected = computed(() => new Set(selectedList.value));

const rows = computed(() => {
  const keyed = props.data.map((row, index) => ({ row, index, key: props.getRowId(row, index) }));
  if (props.manualSorting) return keyed;
  return sortRows(
    keyed,
    sort.value,
    props.columns.map((c) => ({
      id: c.id,
      compare: c.compare,
      accessor: (k: (typeof keyed)[number]) => c.accessor(k.row),
    })),
    props.locale,
  );
});

const canSelect = (row: Row) => !props.isRowSelectable || props.isRowSelectable(row);
const selectableKeys = computed(() => rows.value.filter((r) => canSelect(r.row)).map((r) => r.key));
const allState = computed(() => selectAllState(selected.value, selectableKeys.value));
const commit = (next: Set<RowKey>) => {
  selectedList.value = [...next];
};

function onSort(id: string) {
  sort.value = nextSort(sort.value, id, { allowUnsorted: props.allowUnsorted });
}
function onRowChange(key: RowKey, checked: boolean) {
  commit(toggleRow(selected.value, key, checked));
}
function headerSort(column: DataTableColumn<Row>) {
  const direction = ariaSort(sort.value, column.id);
  return column.sortable && direction !== "none" ? direction : undefined;
}

// Table renders the scroll container (a named, focusable region only when the
// table overflows); its root element is that container, the <table> inside it.
const tableComponent = ref<ComponentPublicInstance | null>(null);
const tableRef = computed(
  () => ((tableComponent.value?.$el as HTMLElement | undefined)?.querySelector("table") ?? null) as HTMLTableElement | null,
);

defineExpose({ table: tableRef });

// Read in the render, so attribute changes re-render the table
const rootAttrs = () => {
  const { class: className, ...rest } = attrs;
  return {
    ...rest,
    ...variantData(variants()),
    "data-slot": "data-table",
    class: slotClass(slots, "root", variants(), normalizeClass(className)),
  };
};
function cls(slot: string) {
  return slotClass(slots, slot, variants());
}
const sortIcon = (direction: string) =>
  direction === "ascending" ? "▲" : direction === "descending" ? "▼" : "↕";

// Renders `header`/`cell` content: a string or VNodes.
const Content = (p: { value: unknown }) => p.value as VNodeChild;
</script>

<template>
  <Table
    ref="tableComponent"
    v-bind="rootAttrs()"
    :density="size === 'sm' ? 'compact' : 'normal'"
    :scroll-label="scrollLabel"
  >
    <TableCaption
      v-if="caption != null || $slots.caption"
      data-slot="data-table-caption"
      v-bind="variantData(variants())"
      :class="cls('caption')"
    >
      <slot name="caption">{{ caption }}</slot>
    </TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead
          v-if="selectable"
          data-slot="data-table-header-cell"
          v-bind="variantData(variants())"
          :class="cls('headerCell')"
        >
          <Checkbox
            data-slot="data-table-checkbox"
            v-bind="variantData(variants())"
            :size="size"
            :class="cls('checkbox')"
            :aria-label="selectAllLabel"
            :checked="allState === true"
            :indeterminate="allState === 'indeterminate'"
            :disabled="selectableKeys.length === 0"
            @checked-change="commit(toggleAll(selected, selectableKeys))"
          />
        </TableHead>
        <TableHead
          v-for="column in columns"
          :key="column.id"
          :aria-sort="headerSort(column)"
          data-slot="data-table-header-cell"
          v-bind="variantData(variants())"
          :class="cls('headerCell')"
        >
          <Button
            v-if="column.sortable"
            variant="ghost"
            :size="size === 'sm' ? 'xs' : 'sm'"
            data-slot="data-table-sort-button"
            :class="cls('sortButton')"
            @click="onSort(column.id)"
          >
            <Content :value="column.header" />
            <span data-part="sort-icon" aria-hidden="true">{{ sortIcon(ariaSort(sort, column.id)) }}</span>
          </Button>
          <Content v-else :value="column.header" />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="rows.length === 0" data-slot="data-table-row" v-bind="variantData(variants())" :class="cls('row')">
        <TableCell
          :colspan="columns.length + (selectable ? 1 : 0)"
          data-slot="data-table-cell"
          v-bind="variantData(variants())"
          :class="cls('cell')"
        >
          <slot name="empty">{{ empty }}</slot>
        </TableCell>
      </TableRow>
      <template v-else>
        <TableRow
          v-for="{ row, index, key } in rows"
          :key="key"
          :aria-selected="selectable ? selected.has(key) : undefined"
          data-slot="data-table-row"
          v-bind="variantData(variants())"
          :class="cls('row')"
        >
          <TableCell v-if="selectable" data-slot="data-table-cell" v-bind="variantData(variants())" :class="cls('cell')">
            <Checkbox
              data-slot="data-table-checkbox"
              v-bind="variantData(variants())"
              :size="size"
              :class="cls('checkbox')"
              :aria-label="getRowLabel(row, index)"
              :checked="selected.has(key)"
              :disabled="!canSelect(row)"
              @checked-change="onRowChange(key, $event)"
            />
          </TableCell>
          <template v-for="column in columns" :key="column.id">
            <TableHead
              v-if="column.rowHeader"
              scope="row"
              data-slot="data-table-row-header"
              v-bind="variantData(variants())"
              :class="cls('rowHeader')"
            >
              <slot :name="`cell-${column.id}`" :row="row" :value="column.accessor(row)" :index="index">
                <Content :value="column.cell ? column.cell(row, column.accessor(row)) : column.accessor(row)" />
              </slot>
            </TableHead>
            <TableCell v-else data-slot="data-table-cell" v-bind="variantData(variants())" :class="cls('cell')">
              <slot :name="`cell-${column.id}`" :row="row" :value="column.accessor(row)" :index="index">
                <Content :value="column.cell ? column.cell(row, column.accessor(row)) : column.accessor(row)" />
              </slot>
            </TableCell>
          </template>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
