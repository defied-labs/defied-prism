import { createContext, useContext, useRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCollection, useCollectionItem, type Collection, type CollectionRecord } from "../src";

type Record = CollectionRecord<{ id: string; value: string; textValue?: string; disabled?: boolean }>;

const Ctx = createContext<Collection<Record> | null>(null);
let latest: Collection<Record> | null = null;

function List({ children }: { children: ReactNode }) {
  const collection = useCollection<Record>();
  latest = collection;
  return (
    <Ctx.Provider value={collection}>
      <ul>{children}</ul>
    </Ctx.Provider>
  );
}

function Item({
  value,
  textValue,
  disabled,
  hidden = false,
  children,
}: {
  value: string;
  textValue?: string;
  disabled?: boolean;
  hidden?: boolean;
  children?: ReactNode;
}) {
  const collection = useContext(Ctx)!;
  const ref = useRef<HTMLLIElement>(null);
  useCollectionItem(collection, { id: `item-${value}`, value, textValue, disabled }, ref);
  return hidden ? null : <li ref={ref}>{children ?? value}</li>;
}

const values = () => latest!.items.map((item) => item.value);

describe("useCollection", () => {
  it("orders items by DOM position with text and disabled flags", () => {
    render(
      <List>
        <Item value="a">
          {"  Apple\n pie "}
        </Item>
        <Item value="b" textValue="Banana" disabled>
          ignored
        </Item>
      </List>,
    );
    expect(latest!.items.map(({ value, textValue, disabled }) => ({ value, textValue, disabled }))).toEqual([
      { value: "a", textValue: "Apple pie", disabled: false },
      { value: "b", textValue: "Banana", disabled: true },
    ]);
    expect(latest!.items[0]!.node).toBeInstanceOf(HTMLLIElement);
    expect(latest!.get("item-b")?.value).toBe("b");
  });

  it("tracks items added, removed and reordered after mount", () => {
    const { rerender } = render(
      <List>
        <Item key="a" value="a" />
        <Item key="b" value="b" />
      </List>,
    );
    rerender(
      <List>
        <Item key="c" value="c" />
        <Item key="a" value="a" />
        <Item key="b" value="b" />
      </List>,
    );
    expect(values()).toEqual(["c", "a", "b"]);
    rerender(
      <List>
        <Item key="b" value="b" />
        <Item key="c" value="c" />
      </List>,
    );
    expect(values()).toEqual(["b", "c"]);
    rerender(
      <List>
        <Item key="c" value="c" />
        <Item key="b" value="b" />
      </List>,
    );
    expect(values()).toEqual(["c", "b"]);
  });

  it("keeps identities stable when nothing changed", () => {
    const tree = (
      <List>
        <Item value="a" />
        <Item value="b" />
      </List>
    );
    const { rerender } = render(tree);
    const before = latest!;
    rerender(tree);
    expect(latest).toBe(before);
    rerender(
      <List>
        <Item value="a" />
        <Item value="b" />
      </List>,
    );
    expect(latest!.items).toBe(before.items);
    expect(latest!.register).toBe(before.register);
  });

  it("remembers text by value while an item is not rendered", () => {
    const { rerender } = render(
      <List>
        <Item value="a">Alpha</Item>
      </List>,
    );
    rerender(
      <List>
        <Item value="a" hidden>
          Alpha
        </Item>
      </List>,
    );
    expect(latest!.items[0]).toMatchObject({ textValue: "Alpha", node: null });
    expect(latest!.textOf("a")).toBe("Alpha");
  });

  it("renders on the server without registering", () => {
    const html = renderToString(
      <List>
        <Item value="a" />
      </List>,
    );
    expect(html).toContain("<li>a</li>");
  });
});
