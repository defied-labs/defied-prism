/**
 * Behavioral half of the component contract, independent of framework.
 *
 * Every registry component is generated for every CSS target, rendered, and
 * checked against the `contract` in its manifest. A component that drifts
 * from its contract, a CSS target that changes behavior, or a framework
 * target that behaves differently fails here. Each framework supplies how to
 * load a generated component and render a fixture.
 */
import axe from "axe-core";
import { within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { compileRecipeTailwind } from "@defied/prism-style-engine";

import type { PrismConfig } from "../../src/config/types";
import { STYLINGS, dataSlot, kebab, readRegistryComponent } from "./generated";
import type { GeneratedModule } from "./fixture";

const NATIVE_DISABLEABLE = new Set(["button", "input", "select", "textarea", "fieldset"]);

type Module = GeneratedModule;
type Props = Record<string, unknown>;

async function axeViolations() {
  const results = await axe.run(document.body, {
    rules: {
      // jsdom has no layout, so contrast is verified on the tokens instead
      "color-contrast": { enabled: false },
      // Page-level rule; components are tested in isolation
      region: { enabled: false },
    },
  });
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes[0]?.html})`);
}

export interface ContractTarget<Node> {
  framework: PrismConfig["framework"];
  components: string[];
  fixtures: Record<string, (m: Module, props: Props) => Node>;
  load: (name: string, styling: PrismConfig["styling"]) => Promise<Module>;
  render: (node: Node) => unknown;
  cleanup: () => void;
}

export function defineContractSuite<Node>({
  framework,
  components,
  fixtures: FIXTURES,
  load,
  render,
  cleanup,
}: ContractTarget<Node>) {
  it(`every ${framework} registry component has a contract fixture`, () => {
    for (const name of components) {
      expect(FIXTURES[name], `fixture for ${name}`).toBeDefined();
    }
  });

  describe.each(components.filter((name) => FIXTURES[name]))(`%s contract (${framework})`, (name) => {
    const { recipe, contract } = readRegistryComponent(name);
    const fixture = FIXTURES[name]!;
    const anchorSlot = dataSlot(name, contract.anchor);

    const enumProps = Object.entries(contract.props).flatMap(([prop, spec]) =>
      spec.type === "enum" && spec.visual ? [{ prop, ...spec }] : [],
    );

    describe.each(STYLINGS)("styling: %s", (styling) => {
      let m: Module;

      beforeAll(async () => {
        m = await load(name, styling);
      });

      const renderIt = (props: Props = {}) => render(fixture(m, props));
      const anchor = () => {
        const el = document.querySelector<HTMLElement>(`[data-slot="${anchorSlot}"]`);
        expect(el, `[data-slot="${anchorSlot}"]`).not.toBeNull();
        return el!;
      };

      it(`anchors on a <${contract.element}> with role "${contract.aria.role}"`, () => {
        renderIt();
        expect(anchor().tagName.toLowerCase()).toBe(contract.element);
        // "none": an element with no implicit role (e.g. <label>) that must not get one
        if (contract.aria.role === "none") expect(anchor().hasAttribute("role")).toBe(false);
        else expect(within(document.body).getAllByRole(contract.aria.role)).toContain(anchor());
      });

      it("renders every declared slot with its element", () => {
        renderIt();
        for (const [slot, spec] of Object.entries(contract.slots ?? {})) {
          if (spec.optional) continue;
          const el = document.querySelector(`[data-slot="${dataSlot(name, slot)}"]`);
          expect(el, `slot ${slot}`).not.toBeNull();
          expect(el!.tagName.toLowerCase(), `slot ${slot}`).toBe(spec.element);
          if (spec.role) expect(el!.getAttribute("role"), `slot ${slot}`).toBe(spec.role);
        }
      });

      it("reflects prop defaults as data attributes", () => {
        renderIt();
        for (const { prop, default: value } of enumProps) {
          expect(anchor().getAttribute(`data-${kebab(prop)}`), prop).toBe(value);
        }
      });

      it("starts in a declared state", () => {
        renderIt();
        const state = anchor().getAttribute("data-state");
        if (contract.states.length === 0) expect(state).toBeNull();
        else expect(contract.states).toContain(state);
      });

      it("applies every declared variant value", () => {
        const tailwind =
          styling === "tailwind" ? compileRecipeTailwind(recipe).slots[contract.anchor] : null;
        for (const { prop, values } of enumProps) {
          for (const value of values) {
            renderIt({ [prop]: value });
            expect(anchor().getAttribute(`data-${kebab(prop)}`)).toBe(value);
            const classes = tailwind?.variants[prop]?.[value];
            if (classes) expect(anchor().className).toContain(classes);
            cleanup();
          }
        }
      });

      it("reflects boolean variant props", () => {
        for (const [prop, spec] of Object.entries(contract.props)) {
          if (spec.type !== "boolean" || !recipe.variants?.[prop]) continue;
          renderIt({ [prop]: true });
          expect(anchor().getAttribute(`data-${kebab(prop)}`), prop).toBe("true");
          cleanup();
        }
      });

      it("forwards className without replacing its own", () => {
        renderIt({ className: "user-class" });
        expect(anchor().classList).toContain("user-class");
        expect(anchor().classList.length).toBeGreaterThan(1);
      });

      const activations = contract.keyboard.filter((k) => k.action === "activate");
      if (activations.length > 0) {
        it.each(activations.map((k) => [k.description ?? k.keys.join("+"), k] as const))(
          "keyboard %s activates",
          async (_label, binding) => {
            const user = userEvent.setup();
            const onClick = vi.fn();
            renderIt({ onClick });
            anchor().focus();
            await user.keyboard(binding.keys[0] === " " ? "[Space]" : `[${binding.keys[0]}]`);
            expect(onClick).toHaveBeenCalledTimes(1);
          },
        );
      }

      if (contract.props.disabled && contract.anchor === "root") {
        it("is disabled when disabled", async () => {
          const user = userEvent.setup();
          const onClick = vi.fn();
          renderIt({ disabled: true, onClick });
          const el = anchor();
          if (NATIVE_DISABLEABLE.has(el.tagName.toLowerCase())) {
            // Native controls disable natively and swallow activation
            await user.click(el);
            expect(onClick).not.toHaveBeenCalled();
            expect(el).toHaveProperty("disabled", true);
          } else {
            // Composite widgets (radiogroup, slider) expose it; their behavior tests cover the rest
            expect(el.getAttribute("aria-disabled")).toBe("true");
          }
          const state = el.getAttribute("data-state");
          if (contract.states.length === 0) expect(state).toBeNull();
          else expect(contract.states).toContain(state);
        });
      }

      if (contract.props.loading) {
        it("while loading: busy, focusable, not activatable, shows the spinner part", async () => {
          const user = userEvent.setup();
          const onClick = vi.fn();
          renderIt({ loading: true, onClick });
          const el = anchor();

          expect(el.getAttribute("aria-busy")).toBe("true");
          expect(el.getAttribute("aria-disabled")).toBe("true");
          expect(el.getAttribute("data-state")).toBe("loading");
          expect(el.querySelector('[data-part="spinner"][aria-hidden="true"]')).not.toBeNull();

          await user.click(el);
          el.focus();
          await user.keyboard("[Enter]");
          expect(onClick).not.toHaveBeenCalled();
          expect(document.activeElement).toBe(el);
        });
      }

      it("only manages ARIA attributes its contract declares", () => {
        const scenarios = [{}, ...(contract.props.loading ? [{ loading: true }] : [])];
        for (const props of scenarios) {
          renderIt(props);
          // aria-label / aria-labelledby name the component; consumers supply them
          const aria = anchor()
            .getAttributeNames()
            .filter((a) => a.startsWith("aria-") && a !== "aria-label" && a !== "aria-labelledby");
          for (const attribute of aria) {
            expect(contract.aria.attributes, attribute).toContain(attribute);
          }
          cleanup();
        }
      });

      it("renders only declared parts", () => {
        const scenarios: Props[] = [{}];
        if (contract.props.loading) scenarios.push({ loading: true });
        if (contract.parts.includes("hint") || contract.parts.includes("error")) scenarios.push({ hint: "Hint", error: "Error" });
        for (const props of scenarios) {
          renderIt(props);
          for (const el of document.body.querySelectorAll("[data-part]")) {
            expect(contract.parts).toContain(el.getAttribute("data-part"));
          }
          cleanup();
        }
      });

      it("has no axe violations in any variant", async () => {
        for (const { prop, values } of enumProps) {
          for (const value of values) {
            renderIt({ [prop]: value });
            expect(await axeViolations(), `${prop}=${value}`).toEqual([]);
            cleanup();
          }
        }
        for (const [prop, spec] of Object.entries(contract.props)) {
          if (spec.type !== "boolean") continue;
          renderIt({ [prop]: true });
          expect(await axeViolations(), prop).toEqual([]);
          cleanup();
        }
        // One axe pass per variant value: components with many variants
        // (drawer: side x size) outgrow the 5s default in a full parallel run
      }, 30_000);
    });
  });
}
