import { describe, expect, it } from "vitest";

import { CSSModulesCompiler } from "../../../../packages/style-engine/src/compiler/CSSModulesCompiler";
import { TailwindCompiler } from "../../../../packages/style-engine/src/compiler/TailwindCompiler";

describe("style engine compilers", () => {
  it("emits Tailwind utilities for common layout and spacing properties", () => {
    const compiler = new TailwindCompiler();

    const output = compiler.compile({
      base: [
        { type: "property", property: "display", value: "flex" },
        { type: "property", property: "alignItems", value: "center" },
        { type: "property", property: "justifyContent", value: "center" },
        { type: "property", property: "borderRadius", value: "md" },
        { type: "property", property: "background", value: "blue-500" },
        { type: "property", property: "color", value: "white" },
        { type: "property", property: "paddingX", value: "4" },
        { type: "property", property: "paddingY", value: "2" },
      ],
      variants: {},
    } as any);

    expect(output).toContain("flex");
    expect(output).toContain("items-center");
    expect(output).toContain("justify-center");
    expect(output).toContain("rounded-md");
    expect(output).toContain("bg-blue-500");
    expect(output).toContain("text-white");
    expect(output).toContain("px-4");
    expect(output).toContain("py-2");
  });

  it("emits CSS Modules declarations for the same style tree", () => {
    const compiler = new CSSModulesCompiler();

    const output = compiler.compile({
      base: [
        { type: "property", property: "display", value: "flex" },
        { type: "property", property: "alignItems", value: "center" },
        { type: "property", property: "justifyContent", value: "center" },
        { type: "property", property: "borderRadius", value: "md" },
        { type: "property", property: "background", value: "blue-500" },
        { type: "property", property: "color", value: "white" },
        { type: "property", property: "paddingX", value: "1rem" },
        { type: "property", property: "paddingY", value: "0.5rem" },
      ],
      variants: {},
    } as any);

    expect(output).toContain("display: flex;");
    expect(output).toContain("align-items: center;");
    expect(output).toContain("justify-content: center;");
    expect(output).toContain("border-radius: 0.375rem;");
    expect(output).toContain("background: var(--color-blue-500);");
    expect(output).toContain("color: var(--color-white);");
    expect(output).toContain("padding-left: 1rem;");
    expect(output).toContain("padding-right: 1rem;");
  });
});
