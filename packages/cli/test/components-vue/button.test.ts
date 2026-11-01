// @vitest-environment jsdom
/** Button behavior for the Vue target; mirrors test/components/button.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, nextTick, ref } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "button-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("button", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });
const button = () => screen.getByRole("button");

describe("Button composition attributes (vue)", () => {
  it("owns data-slot and data-state by default", () => {
    show(() => h(m.Button, null, () => "Save"));
    expect(button().getAttribute("data-slot")).toBe("button");
    expect(button().getAttribute("data-state")).toBe("idle");
  });

  it("reflects disabled and loading in data-state", async () => {
    const loading = ref(false);
    show(() => h(m.Button, { disabled: !loading.value, loading: loading.value }, () => "Save"));
    expect(button().getAttribute("data-state")).toBe("disabled");
    loading.value = true;
    await nextTick();
    expect(button().getAttribute("data-state")).toBe("loading");
  });

  it("lets a composing component name the slot and own data-state", async () => {
    const state = ref("closed");
    show(() =>
      h(m.Button, { "data-slot": "dialog-trigger", "data-state": state.value, loading: true }, () => "Open"),
    );
    expect(button().getAttribute("data-slot")).toBe("dialog-trigger");
    expect(button().getAttribute("data-state")).toBe("closed");
    state.value = "open";
    await nextTick();
    expect(button().getAttribute("data-state")).toBe("open");
  });
});
