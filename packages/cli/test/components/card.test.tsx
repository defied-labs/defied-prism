// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "card";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("card", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function renderCard(props: Record<string, unknown> = {}, onLink = vi.fn(), onShare = vi.fn()) {
  render(
    h(
      m.Card,
      props,
      h(
        m.CardHeader,
        {},
        h(m.CardTitle, { level: props.level }, h(m.CardLink, { href: "#r", onClick: (e: Event) => { e.preventDefault(); onLink(e); } }, "Report")),
        h(m.CardDescription, {}, "Updated today"),
      ),
      h(m.CardContent, {}, "Body text"),
      h(m.CardFooter, {}, h("button", { type: "button", onClick: onShare }, "Share")),
    ),
  );
  return { onLink, onShare };
}

describe("Card", () => {
  it("renders an h3 title by default and a configurable level", () => {
    renderCard();
    expect(screen.getByRole("heading", { level: 3, name: "Report" })).toBeInTheDocument();
    cleanup();
    renderCard({ level: 2 });
    expect(screen.getByRole("heading", { level: 2, name: "Report" })).toBeInTheDocument();
  });

  it("propagates the variant to every part", () => {
    renderCard({ variant: "raised" });
    for (const slot of ["card", "card-header", "card-title", "card-description", "card-content", "card-footer", "card-link"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute("data-variant"), slot).toBe("raised");
    }
    expect(document.querySelector('[data-slot="card-description"]')?.tagName).toBe("P");
  });

  it("is not clickable by default", async () => {
    const { onLink } = renderCard();
    await userEvent.setup().click(screen.getByText("Body text"));
    expect(onLink).not.toHaveBeenCalled();
  });

  it("interactive: area clicks activate the link; the card adds no tab stop or role", async () => {
    const user = userEvent.setup();
    const { onLink, onShare } = renderCard({ interactive: true });
    const card = document.querySelector('[data-slot="card"]')!;
    expect(card.getAttribute("data-interactive")).toBe("true");
    expect(card.hasAttribute("tabindex")).toBe(false);
    expect(card.hasAttribute("role")).toBe(false);

    await user.click(screen.getByText("Body text"));
    expect(onLink).toHaveBeenCalledTimes(1);

    // Nested controls keep their own behavior and don't trigger the link
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onLink).toHaveBeenCalledTimes(1);

    // Clicking the link itself fires once, not twice
    await user.click(screen.getByRole("link", { name: "Report" }));
    expect(onLink).toHaveBeenCalledTimes(2);

    // Tab order: link, then button (the card itself is skipped)
    (document.activeElement as HTMLElement).blur();
    await user.tab();
    expect(screen.getByRole("link", { name: "Report" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Share" })).toHaveFocus();
  });

  it("interactive: respects a consumer preventDefault and composes onClick", async () => {
    const onClick = vi.fn((e: Event) => e.preventDefault());
    const { onLink } = renderCard({ interactive: true, onClick });
    await userEvent.setup().click(screen.getByText("Body text"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLink).not.toHaveBeenCalled();
  });
});
