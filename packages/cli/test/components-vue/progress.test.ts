// @vitest-environment jsdom
/** Progress behavior for the Vue target; mirrors test/components/progress.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, nextTick, ref } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "progress-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("progress", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

function renderProgress(props: Record<string, unknown> = {}) {
  render({ render: () => h(m.Progress, { "aria-label": "Upload", ...props }) });
  const bar = screen.getByRole("progressbar", { name: "Upload" });
  const indicator = bar.querySelector<HTMLElement>('[data-slot="progress-indicator"]')!;
  return { bar, indicator };
}

describe("Progress (vue)", () => {
  it("exposes min, max and value", () => {
    const { bar, indicator } = renderProgress({ value: 25 });
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuenow")).toBe("25");
    expect(bar.getAttribute("data-state")).toBe("determinate");
    expect(indicator.style.width).toBe("25%");
  });

  it("clamps values into range", () => {
    let { bar, indicator } = renderProgress({ value: 150 });
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.getAttribute("data-state")).toBe("complete");
    expect(indicator.style.width).toBe("100%");
    cleanup();
    ({ bar, indicator } = renderProgress({ value: -5 }));
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(indicator.style.width).toBe("0%");
    cleanup();
    ({ bar } = renderProgress({ value: Number.NaN }));
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("supports custom ranges", () => {
    const { bar, indicator } = renderProgress({ value: 3, min: 1, max: 5 });
    expect(bar.getAttribute("aria-valuemin")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe("5");
    expect(indicator.style.width).toBe("50%");
  });

  it("clampProgress handles inverted ranges", () => {
    expect(m.clampProgress(5, 10, 0)).toBe(10);
    expect(m.clampProgress(7, 0, 10)).toBe(7);
  });

  it("indeterminate omits aria-valuenow and aria-valuetext", () => {
    for (const props of [{ indeterminate: true, value: 40 }, { value: null }]) {
      const { bar } = renderProgress({ ...props, valueText: "x" });
      expect(bar.hasAttribute("aria-valuenow")).toBe(false);
      expect(bar.hasAttribute("aria-valuetext")).toBe(false);
      expect(bar.getAttribute("data-state")).toBe("indeterminate");
      expect(bar.getAttribute("data-indeterminate")).toBe("true");
      cleanup();
    }
  });

  it("formats aria-valuetext", () => {
    let { bar } = renderProgress({ value: 3, max: 10, valueText: "3 of 10 files" });
    expect(bar.getAttribute("aria-valuetext")).toBe("3 of 10 files");
    cleanup();
    ({ bar } = renderProgress({ value: 3, max: 10, valueText: (v: number, p: number) => `${v} (${p}%)` }));
    expect(bar.getAttribute("aria-valuetext")).toBe("3 (30%)");
  });

  it("follows value changes", async () => {
    const value = ref(10);
    render({ render: () => h(m.Progress, { "aria-label": "Upload", value: value.value }) });
    value.value = 60;
    await nextTick();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("60");
  });

  it("accepts aria-labelledby as its name", () => {
    render({
      render: () =>
        h("div", {}, [h("span", { id: "lbl" }, "Export"), h(m.Progress, { "aria-labelledby": "lbl", value: 1 })]),
    });
    expect(screen.getByRole("progressbar", { name: "Export" })).toBeInTheDocument();
  });
});
