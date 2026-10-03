import { readFileSync } from "node:fs";
import path from "node:path";
import { TypeTable } from "fumadocs-ui/components/type-table";

import api from "@/generated/docs-api.json";

import { ByFramework, FrameworkSwitch } from "./framework";

interface Member {
  name: string;
  type: string;
  default?: string;
  description?: string;
  required?: boolean;
}

interface Part {
  name: string;
  props: Member[];
  events?: Member[];
  slots?: Member[];
  extendsNative?: string;
}

interface Manifest {
  contract: {
    states: string[];
    keyboard?: { keys: string[]; action: string; description?: string }[];
    aria: { role: string; attributes?: string[] };
  };
}

const parts: Record<string, { react: Part[]; vue: Part[] }> = api;
const registry = path.resolve(process.cwd(), "../../packages/core/components");

function codeList(items: string[]) {
  return items.map((item, i) => (
    <span key={item}>
      {i > 0 && ", "}
      <code>{item}</code>
    </span>
  ));
}

function table(members: Member[]) {
  return (
    <TypeTable
      type={Object.fromEntries(
        members.map((m) => [
          m.name,
          { type: m.type, default: m.default, description: m.description, required: m.required },
        ]),
      )}
    />
  );
}

function PartApi({ part, framework }: { part: Part; framework: "react" | "vue" }) {
  const empty = !part.props.length && !part.events?.length;
  return (
    <section>
      <h3>
        <code>{part.name}</code>
      </h3>
      {part.props.length > 0 && table(part.props)}
      {part.events && part.events.length > 0 && (
        <>
          <p>Events</p>
          {table(part.events)}
        </>
      )}
      {part.slots && part.slots.length > 0 && <p>Slots: {codeList(part.slots.map((s) => s.name))}</p>}
      {framework === "react" && part.extendsNative && (
        <p>
          {empty ? "Takes" : "Also takes"} every native <code>{part.extendsNative}</code> attribute.
        </p>
      )}
      {framework === "vue" && empty && <p>No props of its own; attributes pass through to its element.</p>}
    </section>
  );
}

/**
 * MDX: `<ApiReference component="dialog" />`.
 *
 * Parts: extracted from the generated components by scripts/generate-api.ts.
 * Accessibility: the registry manifest, the contract CI tests against.
 * Neither is written by hand, so neither can drift from the code.
 */
export function ApiReference({ component }: { component: string }) {
  const api = parts[component];
  if (!api) throw new Error(`No extracted API for ${component}`);
  const { contract } = JSON.parse(
    readFileSync(path.join(registry, component, "manifest.json"), "utf8"),
  ) as Manifest;

  return (
    <>
      <div className="not-prose flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-1.5 pl-3 text-sm text-muted-foreground">
        Showing the API for
        <FrameworkSwitch />
      </div>
      <ByFramework
        react={api.react.map((part) => (
          <PartApi key={part.name} part={part} framework="react" />
        ))}
        vue={api.vue.map((part) => (
          <PartApi key={part.name} part={part} framework="vue" />
        ))}
      />

      <h3>Accessibility</h3>
      {contract.keyboard && contract.keyboard.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            {contract.keyboard.map(({ keys, action, description }) => (
              <tr key={keys.join("+")}>
                <td>
                  {keys.map((key) => (
                    <kbd key={key}>{key}</kbd>
                  ))}
                </td>
                <td>{description ?? action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        Role <code>{contract.aria.role}</code>
        {contract.aria.attributes?.length ? <>; manages {codeList(contract.aria.attributes)}</> : null}
        {contract.states.length > 0 && (
          <>
            . <code>data-state</code>: {codeList(contract.states)}
          </>
        )}
        . Checked in CI in both frameworks and every CSS target, including axe.
      </p>
    </>
  );
}
