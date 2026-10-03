/**
 * Extracts each part's API from the components exactly as `prism add` writes
 * them (apps/web for React, apps/vue-demos for Vue), so the docs describe the
 * code users get rather than prose that can drift:
 *
 * - React: TypeScript compiler API. Each exported component's own props
 *   (declared in a registry component, e.g. Button's variant on a trigger;
 *   not inherited DOM attributes), JSDoc, and defaults written in the
 *   destructuring (a default set any other way is not detected).
 * - Vue: vue-component-meta. Props (non-global), events and slots.
 *
 * Writes src/generated/docs-api.json: { [component]: { react: Part[], vue: Part[] } }.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createChecker } from "vue-component-meta";

const webDir = path.resolve(import.meta.dirname, "..");
const vueDir = path.resolve(import.meta.dirname, "../../vue-demos");
const reactUi = path.join(webDir, "src/components/ui");
const vueUi = path.join(vueDir, "src/components/ui");
const registry = path.resolve(import.meta.dirname, "../../../packages/core/components");
const out = path.join(webDir, "src/generated");

export interface Member {
  name: string;
  type: string;
  default?: string;
  description?: string;
  required?: boolean;
}
export interface Part {
  name: string;
  props: Member[];
  events?: Member[];
  slots?: Member[];
  /** Also accepts every attribute of this element (React: inherited HTML props). */
  extendsNative?: string;
}

/** Drops the `| undefined` an optional prop's type carries; optionality is shown separately. */
const clean = (type: string) => type.replace(/ \| undefined$/, "").replace(/^\((.*)\)$/, "$1");

const pascal = (name: string) => name.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase());

function reactFile(component: string): string | undefined {
  const manifest = JSON.parse(readFileSync(path.join(registry, component, "manifest.json"), "utf8"));
  const react = manifest.compatibility.frameworks.find((f: { framework: string }) => f.framework === "react");
  const main = react?.files?.[0]?.destination as string | undefined;
  const file = main ? path.join(reactUi, main) : path.join(reactUi, `${pascal(component)}.tsx`);
  return existsSync(file) ? file : undefined;
}

// --- React ---------------------------------------------------------------

const components = readdirSync(registry, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(path.join(registry, e.name, "manifest.json")))
  .map((e) => e.name)
  .sort();

const reactFiles = components.map(reactFile).filter((f): f is string => !!f);
const program = ts.createProgram(reactFiles, {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022,
  strict: true,
  skipLibCheck: true,
  baseUrl: webDir,
  paths: { "@/*": ["./src/*"] },
});
const checker = program.getTypeChecker();

/** `{ size = "md", open }` -> { size: '"md"' } from the component's own parameter. */
function destructuredDefaults(decl: ts.Node | undefined): Record<string, string> {
  const defaults: Record<string, string> = {};
  let fn: ts.SignatureDeclaration | undefined;
  if (decl && ts.isFunctionDeclaration(decl)) fn = decl;
  if (decl && ts.isVariableDeclaration(decl) && decl.initializer) {
    // forwardRef((props, ref) => ...) / forwardRef(function X(props, ref) {...})
    const visit = (node: ts.Node): void => {
      if (fn) return;
      if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) fn = node;
      else ts.forEachChild(node, visit);
    };
    visit(decl.initializer);
  }
  const param = fn?.parameters[0]?.name;
  if (param && ts.isObjectBindingPattern(param)) {
    for (const el of param.elements) {
      const key = (el.propertyName ?? el.name).getText();
      if (el.initializer) defaults[key] = el.initializer.getText();
    }
  }
  return defaults;
}

function nativeElement(type: ts.Type): string | undefined {
  // HTMLAttributes<HTMLDivElement> etc. leave a trace in the base types' names
  const text = checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation);
  return text.match(/HTML(\w+)Element/)?.[1]?.toLowerCase();
}

function reactParts(file: string): Part[] {
  const source = program.getSourceFile(file)!;
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) return [];
  const parts: Part[] = [];
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    if (!/^[A-Z]/.test(exported.name)) continue;
    const decl = exported.valueDeclaration;
    if (!decl) continue; // a type-only export
    const type = checker.getTypeOfSymbolAtLocation(exported, decl);
    const signature = type.getCallSignatures()[0];
    const propsParam = signature?.getParameters()[0];
    if (!propsParam) continue; // a helper constant, not a component
    const propsType = checker.getTypeOfSymbolAtLocation(propsParam, decl);
    if (!propsType.getProperties().length && !(propsType.flags & ts.TypeFlags.Object)) continue;

    const defaults = destructuredDefaults(decl);
    const props: Member[] = [];
    let inheritsNative = false;
    for (const prop of propsType.getProperties()) {
      const own = prop.declarations?.some((d) =>
        path.resolve(d.getSourceFile().fileName).startsWith(path.resolve(reactUi) + path.sep),
      );
      if (!own) {
        inheritsNative = true;
        continue;
      }
      const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
      props.push({
        name: prop.name,
        // Keeps aliases (ReactNode) instead of expanding them
        type: clean(checker.typeToString(propType, decl, ts.TypeFormatFlags.NoTruncation)),
        default: defaults[prop.name],
        description: ts.displayPartsToString(prop.getDocumentationComment(checker)) || undefined,
        required: !(prop.flags & ts.SymbolFlags.Optional),
      });
    }
    parts.push({
      name: exported.name,
      props: props.sort((a, b) => a.name.localeCompare(b.name)),
      extendsNative: inheritsNative ? nativeElement(propsType) : undefined,
    });
  }
  return parts;
}

// --- Vue -----------------------------------------------------------------

const vueChecker = createChecker(path.join(vueDir, "tsconfig.json"), { forceUseTs: true, printer: { newLine: 1 } });

/** Vue parts in the React export order where names match, so the two lists line up. */
function vueParts(component: string, order: string[]): Part[] {
  const dir = path.join(vueUi, component);
  if (!existsSync(dir)) return [];
  const rank = (file: string) => {
    const i = order.indexOf(file.slice(0, -".vue".length));
    return i === -1 ? order.length : i;
  };
  // Public parts only: internal SFCs (e.g. a shared item implementation) aren't exported
  const index = readFileSync(path.join(dir, "index.ts"), "utf8");
  const exported = new Set([...index.matchAll(/default as \w+[^}]*} from "\.\/(\w+)\.vue"/g)].map((m) => m[1]));
  return readdirSync(dir)
    .filter((f) => f.endsWith(".vue") && exported.has(f.slice(0, -".vue".length)))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((file) => {
      const meta = vueChecker.getComponentMeta(path.join(dir, file));
      const member = (m: { name: string; type: string; description: string }): Member => ({
        name: m.name,
        type: clean(m.type),
        description: m.description || undefined,
      });
      return {
        name: file.slice(0, -".vue".length),
        props: meta.props
          .filter((p) => !p.global)
          .map((p) => ({ ...member(p), default: p.default, required: p.required }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        events: meta.events.map((e) => ({ ...member(e), type: e.signature || e.type })),
        slots: meta.slots.map(member),
      };
    });
}

// --- Write ---------------------------------------------------------------

const api: Record<string, { react: Part[]; vue: Part[] }> = {};
for (const component of components) {
  const file = reactFile(component);
  const react = file ? reactParts(file) : [];
  api[component] = { react, vue: vueParts(component, react.map((part) => part.name)) };
}

mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, "docs-api.json"), JSON.stringify(api) + "\n");
console.log(`api: ${components.length} components, React and Vue parts extracted`);
