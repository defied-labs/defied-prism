import { describe, expect, it } from "vitest";

import { slotClass } from "../lib/slots";
import { tailwindSlots } from "../tailwind";

describe("tailwindSlots", () => {
  const slots = tailwindSlots({
    root: {
      base: "bg-prism-primary text-prism-primary-fg px-prism-4 text-prism-sm leading-prism-tight rounded-prism-md font-prism-medium",
      variants: { size: { lg: "px-prism-6 text-prism-lg" } },
    },
  });

  it("consumer classes beat the component's for the same property", () => {
    expect(slotClass(slots, "root", {}, "bg-red-500 px-2 rounded-none")).toBe(
      "text-prism-primary-fg text-prism-sm leading-prism-tight font-prism-medium bg-red-500 px-2 rounded-none",
    );
  });

  it("knows Prism's scales: text color and text size don't clash", () => {
    expect(slotClass(slots, "root", {}, "text-prism-fg")).toContain("text-prism-sm");
    expect(slotClass(slots, "root", {}, "text-prism-fg")).not.toContain("text-prism-primary-fg");
    expect(slotClass(slots, "root", {}, "text-prism-md")).toContain("text-prism-primary-fg");
    expect(slotClass(slots, "root", {}, "text-prism-md")).not.toContain("text-prism-sm");
    // Plain Tailwind sizes/colors still resolve against Prism's
    expect(slotClass(slots, "root", {}, "text-base")).not.toContain("text-prism-sm");
    expect(slotClass(slots, "root", {}, "text-white")).not.toContain("text-prism-primary-fg");
  });

  it("variants override base", () => {
    const cls = slotClass(slots, "root", { size: "lg" });
    expect(cls).toContain("px-prism-6");
    expect(cls).not.toContain("px-prism-4");
  });

  it("plain slots are not merged", () => {
    expect(slotClass({ root: { base: "a px-4", variants: {} } }, "root", {}, "px-2")).toBe("a px-4 px-2");
  });
});
