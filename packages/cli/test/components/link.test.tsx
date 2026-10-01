// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h, type MouseEvent } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "link";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("link", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

describe("Link", () => {
  it("is a plain link by default", () => {
    render(h(m.Link, { href: "/docs" }, "Docs"));
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBeNull();
    expect(link.getAttribute("rel")).toBeNull();
    expect(link.querySelector('[data-part="external-hint"]')).toBeNull();
  });

  it("external: new tab, safe rel (keeping the user's), announced", () => {
    render(h(m.Link, { href: "https://example.com", external: true, rel: "me" }, "Example"));
    const link = screen.getByRole("link", { name: "Example (opens in a new tab)" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")!.split(" ").sort()).toEqual(["me", "noopener", "noreferrer"]);
  });

  it("asChild merges onto the child element and composes handlers", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(
      h(
        m.Link,
        { asChild: true, tone: "muted", onClick: () => calls.push("link") },
        h(
          "a",
          {
            href: "/router",
            onClick: (e: MouseEvent) => {
              e.preventDefault();
              calls.push("child");
            },
          },
          "Router",
        ),
      ),
    );
    const link = screen.getByRole("link", { name: "Router" });
    expect(link.getAttribute("data-slot")).toBe("link");
    expect(link.getAttribute("data-tone")).toBe("muted");
    await user.click(link);
    // Child handler first; it prevented default so the Link's is skipped
    expect(calls).toEqual(["child"]);
  });

  it("is keyboard focusable", async () => {
    const user = userEvent.setup();
    render(h(m.Link, { href: "/docs" }, "Docs"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link"));
  });
});
