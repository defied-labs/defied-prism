<script setup lang="ts" generic="Row">
import { computed, normalizeClass, ref, useAttrs, useId, type VNodeChild } from "vue";
import { useControllableState, useOverflow } from "@defied/prism-vue";
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
import type { DataTableColumn } from "./types";

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
const slots: StyleSlots = {{STYLE_SLOTS}};

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
function onRowChange(key: RowKey, event: Event) {
  commit(toggleRow(selected.value, key, (event.currentTarget as HTMLInputElement).checked));
}
function headerSort(column: DataTableColumn<Row>) {
  const direction = ariaSort(sort.value, column.id);
  return column.sortable && direction !== "none" ? direction : undefined;
}

const scrollRef = ref<HTMLDivElement | null>(null);
const tableRef = ref<HTMLTableElement | null>(null);
const overflowing = useOverflow(scrollRef);
const captionId = `${useId()}-caption`;

defineExpose({ table: tableRef });

// Read in the render, so attribute changes re-render the table
const scrollAttrs = (hasCaption: boolean) => {
  const base = { ...variantData(variants()), "data-slot": "data-table-scroll", class: cls("scroll") };
  if (!overflowing.value) return base;
  return {
    ...base,
    role: "region",
    tabindex: 0,
    ...(hasCaption && !props.scrollLabel
      ? { "aria-labelledby": captionId }
      : { "aria-label": props.scrollLabel ?? (attrs["aria-label"] as string | undefined) ?? "Table" }),
  };
};
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
  <!-- Wide tables scroll inside their container instead of spilling over
       the page; only then is the container a named, focusable region. -->
  <div ref="scrollRef" v-bind="scrollAttrs(caption != null || !!$slots.caption)">
    <table ref="tableRef" v-bind="rootAttrs()">
      <caption
        v-if="caption != null || $slots.caption"
        :id="captionId"
        data-slot="data-table-caption"
        v-bind="variantData(variants())"
        :class="cls('caption')"
      >
        <slot name="caption">{{ caption }}</slot>
      </caption>
      <thead>
        <tr>
          <th
            v-if="selectable"
            scope="col"
            data-slot="data-table-header-cell"
            v-bind="variantData(variants())"
            :class="cls('headerCell')"
          >
            <input
              type="checkbox"
              data-slot="data-table-checkbox"
              v-bind="variantData(variants())"
              :class="cls('checkbox')"
              :aria-label="selectAllLabel"
              :checked="allState === true"
              :indeterminate="allState === 'indeterminate'"
              :disabled="selectableKeys.length === 0"
              @change="commit(toggleAll(selected, selectableKeys))"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.id"
            scope="col"
            :aria-sort="headerSort(column)"
            data-slot="data-table-header-cell"
            v-bind="variantData(variants())"
            :class="cls('headerCell')"
          >
            <button
              v-if="column.sortable"
              type="button"
              data-slot="data-table-sort-button"
              v-bind="variantData(variants())"
              :class="cls('sortButton')"
              @click="onSort(column.id)"
            >
              <Content :value="column.header" />
              <span data-part="sort-icon" aria-hidden="true">{{ sortIcon(ariaSort(sort, column.id)) }}</span>
            </button>
            <Content v-else :value="column.header" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0" data-slot="data-table-row" v-bind="variantData(variants())" :class="cls('row')">
          <td
            :colspan="columns.length + (selectable ? 1 : 0)"
            data-slot="data-table-cell"
            v-bind="variantData(variants())"
            :class="cls('cell')"
          >
            <slot name="empty">{{ empty }}</slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="{ row, index, key } in rows"
            :key="key"
            :aria-selected="selectable ? selected.has(key) : undefined"
            data-slot="data-table-row"
            v-bind="variantData(variants())"
            :class="cls('row')"
          >
            <td v-if="selectable" data-slot="data-table-cell" v-bind="variantData(variants())" :class="cls('cell')">
              <input
                type="checkbox"
                data-slot="data-table-checkbox"
                v-bind="variantData(variants())"
                :class="cls('checkbox')"
                :aria-label="getRowLabel(row, index)"
                :checked="selected.has(key)"
                :disabled="!canSelect(row)"
                @change="onRowChange(key, $event)"
              />
            </td>
            <template v-for="column in columns" :key="column.id">
              <th
                v-if="column.rowHeader"
                scope="row"
                data-slot="data-table-row-header"
                v-bind="variantData(variants())"
                :class="cls('rowHeader')"
              >
                <slot :name="`cell-${column.id}`" :row="row" :value="column.accessor(row)" :index="index">
                  <Content :value="column.cell ? column.cell(row, column.accessor(row)) : column.accessor(row)" />
                </slot>
              </th>
              <td v-else data-slot="data-table-cell" v-bind="variantData(variants())" :class="cls('cell')">
                <slot :name="`cell-${column.id}`" :row="row" :value="column.accessor(row)" :index="index">
                  <Content :value="column.cell ? column.cell(row, column.accessor(row)) : column.accessor(row)" />
                </slot>
              </td>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
