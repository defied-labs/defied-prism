import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import stats from "@/generated/stats.json";
import Home from "../app/page";

vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }) }));

describe("Showcase page", () => {
  it("leads with the pick-your-stack line", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Every design system picks your stack Prism lets you pick yours",
    );
  });

  it("shows registry numbers counted at build time, not hard-coded", () => {
    render(<Home />);
    const scale = screen.getByRole("region", { name: /Built to grow/ });
    for (const value of [
      stats.components,
      stats.vueComponents,
      stats.stylings,
      stats.machines,
    ]) {
      expect(within(scale).getAllByText(String(value)).length).toBeGreaterThan(
        0,
      );
    }
    expect(stats.vueReady).toEqual(
      expect.arrayContaining(["button", "dialog", "select"]),
    );
    expect(stats.vueComponents).toBe(stats.vueReady.length);
  });

  it("only badges Vue on components that generate for Vue", () => {
    render(<Home />);
    const gallery = screen.getByRole("region", {
      name: /Accessible by contract/,
    });
    const cards = [...gallery.querySelectorAll(":scope ul > li")];
    expect(cards.length).toBe(7);
    for (const card of cards) {
      const badges = [...card.querySelectorAll("[data-slot='badge']")].map(
        (b) => b.textContent,
      );
      // The install command names the registry components behind the card
      const names = card
        .textContent!.match(/cli add ([a-z-]+)/g)!
        .map((m) => m.slice("cli add ".length));
      const vue = names.every((name) => stats.vueReady.includes(name));
      expect(badges).toEqual(vue ? ["React", "Vue"] : ["React"]);
    }
  });

  it("mounts the real Vue components inside the React page", async () => {
    render(<Home />);
    const matrix = screen.getByRole("region", { name: /Any stack/ });
    // Vue is the matrix's default framework
    await waitFor(
      () => expect(matrix.querySelector("[data-framework='vue'] [data-slot='button']")).not.toBeNull(),
      { timeout: 10_000 },
    );
    const vueButton = matrix.querySelector<HTMLElement>("[data-framework='vue'] [data-slot='button']")!;
    expect(vueButton).toHaveTextContent("Ship it");
    expect(vueButton.getAttribute("data-state")).toBe("idle");
  });

  it("switches the matrix to React and shows the generated React file", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const matrix = screen.getByRole("region", { name: /Any stack/ });
    await user.click(within(matrix).getByRole("button", { name: "React" }));
    await user.click(within(matrix).getByRole("button", { name: "Tailwind" }));
    expect(within(matrix).getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "true");
    expect(within(matrix).getByText("Running in React, styled with Tailwind")).toBeInTheDocument();
    expect(await within(matrix).findByRole("tab", { name: "Button.tsx" })).toBeInTheDocument();
    expect(within(matrix).getByLabelText("Button.tsx source")).toHaveTextContent('from "@defied/prism-react"');
  });
});
