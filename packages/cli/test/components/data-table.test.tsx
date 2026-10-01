// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "data-table";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("data-table", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

interface Person {
  id: string;
  name: string;
  age: number;
}

const people: Person[] = [
  { id: "b", name: "Bob", age: 30 },
  { id: "a", name: "Alice", age: 41 },
  { id: "c", name: "Carol", age: 25 },
];

const columns = [
  { id: "name", header: "Name", accessor: (p: Person) => p.name, sortable: true, rowHeader: true },
  { id: "age", header: "Age", accessor: (p: Person) => p.age, sortable: true, cell: (_p: Person, v: unknown) => `${v} yrs` },
  { id: "id", header: "ID", accessor: (p: Person) => p.id },
];

function renderTable(props: Record<string, unknown> = {}) {
  return render(
    h(m.DataTable, { caption: "People", columns, data: people, getRowId: (p: Person) => p.id, ...props }),
  );
}

const bodyNames = () =>
  screen.getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("rowheader")[0]!.textContent);
const header = (name: RegExp) => screen.getByRole("columnheader", { name });
const sortButton = (name: RegExp) => within(header(name)).getByRole("button");

describe("DataTable", () => {
  it("renders headers, cells, custom cells and a caption", () => {
    renderTable();
    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((c) => c.textContent?.replace(/[▲▼↕]/g, ""))).toEqual([
      "Name",
      "Age",
      "ID",
    ]);
    expect(screen.getByText("30 yrs")).toBeInTheDocument();
    expect(bodyNames()).toEqual(["Bob", "Alice", "Carol"]);
    // Non-sortable columns have no button
    expect(within(header(/ID/)).queryByRole("button")).toBeNull();
  });

  it("sorts by clicking header buttons and reflects aria-sort", async () => {
    const user = userEvent.setup();
    renderTable();
    expect(header(/Name/).hasAttribute("aria-sort")).toBe(false);

    await user.click(sortButton(/Name/));
    expect(bodyNames()).toEqual(["Alice", "Bob", "Carol"]);
    expect(header(/Name/).getAttribute("aria-sort")).toBe("ascending");

    await user.click(sortButton(/Name/));
    expect(bodyNames()).toEqual(["Carol", "Bob", "Alice"]);
    expect(header(/Name/).getAttribute("aria-sort")).toBe("descending");

    await user.click(sortButton(/Name/));
    expect(bodyNames()).toEqual(["Bob", "Alice", "Carol"]);
    expect(header(/Name/).hasAttribute("aria-sort")).toBe(false);

    // aria-sort lives on one header at a time
    await user.click(sortButton(/Age/));
    expect(bodyNames()).toEqual(["Carol", "Bob", "Alice"]);
    expect(header(/Age/).getAttribute("aria-sort")).toBe("ascending");
    expect(header(/Name/).hasAttribute("aria-sort")).toBe(false);
  });

  it("sorts from the keyboard", async () => {
    const user = userEvent.setup();
    renderTable();
    sortButton(/Age/).focus();
    await user.keyboard("[Enter]");
    expect(header(/Age/).getAttribute("aria-sort")).toBe("ascending");
    await user.keyboard("[Space]");
    expect(header(/Age/).getAttribute("aria-sort")).toBe("descending");
  });

  it("supports controlled sort and manual sorting", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const { rerender } = renderTable({ sort: { column: "age", direction: "descending" }, onSortChange });
    expect(bodyNames()).toEqual(["Alice", "Bob", "Carol"]);
    await user.click(sortButton(/Age/));
    expect(onSortChange).toHaveBeenCalledWith(null);
    // Controlled: nothing changes until the parent updates
    expect(bodyNames()).toEqual(["Alice", "Bob", "Carol"]);

    rerender(
      h(m.DataTable, {
        columns,
        data: people,
        "aria-label": "People",
        sort: { column: "name", direction: "ascending" },
        manualSorting: true,
      }),
    );
    expect(bodyNames()).toEqual(["Bob", "Alice", "Carol"]);
    expect(header(/Name/).getAttribute("aria-sort")).toBe("ascending");
  });

  it("flips back to ascending when unsorted isn't allowed", async () => {
    const user = userEvent.setup();
    renderTable({ defaultSort: { column: "name", direction: "descending" }, allowUnsorted: false });
    await user.click(sortButton(/Name/));
    expect(header(/Name/).getAttribute("aria-sort")).toBe("ascending");
  });

  it("selects rows and all rows with an indeterminate select-all", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    renderTable({ selectable: true, onSelectedChange });
    const all = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    const rowBoxes = () => screen.getAllByRole("checkbox", { name: /Select row/ }) as HTMLInputElement[];
    expect(all.checked).toBe(false);
    expect(all.indeterminate).toBe(false);

    await user.click(rowBoxes()[1]!);
    expect(onSelectedChange).toHaveBeenLastCalledWith(["a"]);
    expect(all.indeterminate).toBe(true);
    expect(screen.getAllByRole("row")[2]!.getAttribute("aria-selected")).toBe("true");

    await user.click(all);
    expect(onSelectedChange).toHaveBeenLastCalledWith(expect.arrayContaining(["a", "b", "c"]));
    expect(all.checked).toBe(true);
    expect(all.indeterminate).toBe(false);
    expect(rowBoxes().every((b) => b.checked)).toBe(true);

    await user.click(all);
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
    expect(rowBoxes().some((b) => b.checked)).toBe(false);
  });

  it("toggles row checkboxes with Space", async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true });
    const box = screen.getByRole("checkbox", { name: "Select row 1" }) as HTMLInputElement;
    box.focus();
    await user.keyboard("[Space]");
    expect(box.checked).toBe(true);
  });

  it("supports controlled selection, custom labels and unselectable rows", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    renderTable({
      selectable: true,
      selected: ["b"],
      onSelectedChange,
      getRowLabel: (p: Person) => `Select ${p.name}`,
      isRowSelectable: (p: Person) => p.id !== "c",
    });
    expect((screen.getByRole("checkbox", { name: "Select Bob" }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole("checkbox", { name: "Select Carol" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(expect.arrayContaining(["a", "b"]));
    expect(onSelectedChange.mock.lastCall![0]).not.toContain("c");
    // Controlled: still only Bob
    expect((screen.getByRole("checkbox", { name: "Select Alice" }) as HTMLInputElement).checked).toBe(false);
  });

  it("does not mark rows selected when not selectable", () => {
    renderTable();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getAllByRole("row")[1]!.hasAttribute("aria-selected")).toBe(false);
  });

  it("scrolls inside a named, focusable region only when it overflows its container", async () => {
    renderTable();
    expect(screen.queryByRole("region")).toBeNull();
    cleanup();
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    renderTable();
    const region = screen.getByRole("region", { name: "People" });
    expect(region.getAttribute("data-slot")).toBe("data-table-scroll");
    expect(region).toContainElement(screen.getByRole("table"));
    await userEvent.setup().tab();
    expect(region).toHaveFocus();
    vi.restoreAllMocks();
  });

  it("renders an empty state", () => {
    renderTable({ data: [], empty: "Nobody here" });
    const cell = screen.getByText("Nobody here");
    expect(cell.getAttribute("colspan")).toBe("3");
  });
});
