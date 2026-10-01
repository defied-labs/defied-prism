// @vitest-environment jsdom
import { rmSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { generatedRoot, loadGenerated } from "../support/generated";

const NAMESPACE = "skeleton";
let m: Record<string, any>;

beforeAll(async () => {
  m = await loadGenerated("skeleton", "tailwind", NAMESPACE);
});
afterEach(cleanup);
afterAll(() => rmSync(path.join(generatedRoot, NAMESPACE), { recursive: true, force: true }));

const shapes = () => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="skeleton-shape"]'));

describe("Skeleton", () => {
  it("the group is a busy status with a hidden label; shapes are aria-hidden", () => {
    render(h(m.SkeletonGroup, { label: "Loading comments" }, h(m.Skeleton), h(m.Skeleton)));
    const group = screen.getByRole("status");
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(group).toHaveAccessibleName("");
    expect(group).toHaveTextContent("Loading comments");
    expect(shapes()).toHaveLength(2);
    for (const shape of shapes()) expect(shape.getAttribute("aria-hidden")).toBe("true");
  });

  it("shapes inherit the group's variant and can override it", () => {
    render(
      h(m.SkeletonGroup, { variant: "circle" }, h(m.Skeleton), h(m.Skeleton, { variant: "rect" })),
    );
    expect(shapes().map((s) => s.getAttribute("data-variant"))).toEqual(["circle", "rect"]);
  });

  it("a standalone Skeleton defaults to text and forwards props", () => {
    render(h(m.Skeleton, { className: "w-20", style: { width: 80 } }));
    const [shape] = shapes();
    expect(shape!.getAttribute("data-variant")).toBe("text");
    expect(shape!.classList).toContain("w-20");
    expect(shape!.style.width).toBe("80px");
  });
});
