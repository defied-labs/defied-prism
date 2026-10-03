import { inject, type InjectionKey } from "vue";

export type TableVariants = { density: "compact" | "normal" | "relaxed"; striped?: boolean };

export interface TableContext {
  variants: () => TableVariants;
  captionId: string;
  setHasCaption: (has: boolean) => void;
}

export const TableKey: InjectionKey<TableContext> = Symbol("Table");

const fallback: TableContext = {
  variants: () => ({ density: "normal" }),
  captionId: "",
  setHasCaption: () => {},
};

export function useTable(): TableContext {
  return inject(TableKey, fallback);
}
