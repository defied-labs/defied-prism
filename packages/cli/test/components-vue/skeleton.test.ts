// @vitest-environment jsdom
/** Skeleton behavior for the Vue target; mirrors test/components/skeleton.test.tsx. */
import { rmSync } from "node:fs";
import path from "node:path";
import { h, nextTick, ref } from "vue";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "skeleton-vue";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("skeleton", "tailwind", NAMESPACE, "vue");
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const show = (node: () => unknown) => render({ render: node });
const shapes = () => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="skeleton-shape"]'));

describe("Skeleton (vue)", () => {
  it("the group is a busy status with a hidden label; shapes are aria-hidden", () => {
    show(() => h(m.SkeletonGroup, { label: "Loading comments" }, () => [h(m.Skeleton), h(m.Skeleton)]));
    const group = screen.getByRole("status");
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(group).toHaveAccessibleName("");
    expect(group).toHaveTextContent("Loading comments");
    expect(shapes()).toHaveLength(2);
    for (const shape of shapes()) expect(shape.getAttribute("aria-hidden")).toBe("true");
  });

  it("shapes inherit the group's variant and can override it", () => {
    show(() => h(m.SkeletonGroup, { variant: "circle" }, () => [h(m.Skeleton), h(m.Skeleton, { variant: "rect" })]));
    expect(shapes().map((s) => s.getAttribute("data-variant"))).toEqual(["circle", "rect"]);
  });

  it("shapes follow a change of the group's variant", async () => {
    const variant = ref("circle");
    show(() => h(m.SkeletonGroup, { variant: variant.value }, () => [h(m.Skeleton)]));
    variant.value = "rect";
    await nextTick();
    expect(shapes()[0]!.getAttribute("data-variant")).toBe("rect");
  });

  it("a standalone Skeleton defaults to text and forwards props", () => {
    show(() => h(m.Skeleton, { class: "w-20", style: { width: "80px" } }));
    const [shape] = shapes();
    expect(shape!.getAttribute("data-variant")).toBe("text");
    expect(shape!.classList).toContain("w-20");
    expect(shape!.style.width).toBe("80px");
  });
});
