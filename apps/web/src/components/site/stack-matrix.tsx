"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Field, FieldLabel } from "@/components/ui/Field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";

import { CodeViewer, type Snippet } from "./code-viewer";
import { reactDemos, type ButtonDemoProps } from "./react-demos";
import { VueIsland, type DemoName } from "./vue-island";

type Framework = "react" | "vue";
type Styling = "tailwind" | "css-modules";
/** Generated files per framework and styling, from scripts/generate-snippets.ts. */
type ComponentSnippets = Record<Framework, Record<Styling, Snippet[]>>;

const COMPONENTS: { demo: DemoName; label: string; files: string[] }[] = [
  { demo: "button", label: "Button", files: ["button"] },
  { demo: "field", label: "Field + Input", files: ["field", "input"] },
  { demo: "select", label: "Select", files: ["select"] },
  { demo: "dialog", label: "Dialog", files: ["dialog"] },
  { demo: "toast", label: "Toast", files: ["toast"] },
  { demo: "calendar", label: "Calendar", files: ["calendar"] },
  { demo: "data-table", label: "Data table", files: ["data-table"] },
];

const loadSnippets = (name: string) =>
  import(`@/generated/snippets/${name}.json`).then((m) => m.default as ComponentSnippets);

/** The styling each live preview actually renders with. */
const LIVE_STYLING: Record<Framework, Styling> = { react: "tailwind", vue: "css-modules" };
const STYLING_LABEL: Record<Styling, string> = { tailwind: "Tailwind", "css-modules": "CSS Modules" };
const FRAMEWORK_LABEL: Record<Framework, string> = { react: "React", vue: "Vue" };

export function StackMatrix() {
  const [demo, setDemo] = useState<DemoName>("button");
  const [framework, setFramework] = useState<Framework>("vue");
  const [styling, setStyling] = useState<Styling>("css-modules");
  const [button, setButton] = useState<Required<ButtonDemoProps>>({
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  });
  const [snippets, setSnippets] = useState<Record<string, ComponentSnippets>>({});

  const entry = COMPONENTS.find((c) => c.demo === demo)!;

  useEffect(() => {
    let cancelled = false;
    Promise.all(entry.files.map(async (name) => [name, await loadSnippets(name)] as const)).then(
      (loaded) => {
        if (!cancelled) setSnippets((prev) => ({ ...prev, ...Object.fromEntries(loaded) }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [entry]);

  const files = entry.files.flatMap((name) => snippets[name]?.[framework][styling] ?? []);
  const demoProps = demo === "button" ? button : {};
  const ReactDemo = reactDemos[demo];
  const liveStyling = LIVE_STYLING[framework];

  return (
    <Tabs value={demo} onValueChange={(v) => setDemo(v as DemoName)} variant="pills" size="sm" className="grid gap-6">
      <TabList aria-label="Component" className="flex-wrap">
        {COMPONENTS.map((c) => (
          <Tab key={c.demo} value={c.demo}>
            {c.label}
          </Tab>
        ))}
      </TabList>

      {COMPONENTS.map((c) => (
        <TabPanel key={c.demo} value={c.demo} className="grid gap-6">
          {c.demo === demo && (
            <>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <Toggle label="Framework" options={FRAMEWORK_LABEL} value={framework} onChange={setFramework} />
                <Toggle label="Styling" options={STYLING_LABEL} value={styling} onChange={setStyling} />
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status="success" variant="subtle" size="sm">
                      Live
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Running in {FRAMEWORK_LABEL[framework]}, styled with {STYLING_LABEL[liveStyling]}
                    </span>
                  </div>

                  <div className="grid min-h-48 place-items-center rounded-lg border border-dashed bg-background p-6">
                    {framework === "react" ? (
                      <ReactDemo {...demoProps} />
                    ) : (
                      <VueIsland key={demo} demo={demo} props={demoProps} />
                    )}
                  </div>

                  {liveStyling !== styling && (
                    <p className="text-xs text-muted-foreground">
                      The preview uses {STYLING_LABEL[liveStyling]}; the code shows the {STYLING_LABEL[styling]}{" "}
                      output. Both are compiled from the same recipe into the same declarations.
                    </p>
                  )}

                  {demo === "button" && <ButtonControls value={button} onChange={setButton} />}
                </div>

                {files.length > 0 ? (
                  <CodeViewer files={files} root="src/components/ui" />
                ) : (
                  <div className="grid min-h-64 place-items-center rounded-xl border text-sm text-muted-foreground">
                    Loading generated code…
                  </div>
                )}
              </div>
            </>
          )}
        </TabPanel>
      ))}
    </Tabs>
  );
}

/** A segmented control: toggle buttons, one pressed at a time. */
function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex rounded-lg border p-0.5">
        {(Object.keys(options) as T[]).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={key === value ? "secondary" : "ghost"}
            aria-pressed={key === value}
            onClick={() => onChange(key)}
          >
            {options[key]}
          </Button>
        ))}
      </div>
    </div>
  );
}

const VARIANTS = ["primary", "secondary", "outline", "ghost", "destructive", "link"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

function ButtonControls({
  value,
  onChange,
}: {
  value: Required<ButtonDemoProps>;
  onChange: (next: Required<ButtonDemoProps>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t pt-4">
      <Field>
        <FieldLabel>Variant</FieldLabel>
        <Select value={value.variant} onValueChange={(v) => onChange({ ...value, variant: v as typeof value.variant })} size="sm">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VARIANTS.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Size</FieldLabel>
        <Select value={value.size} onValueChange={(v) => onChange({ ...value, size: v as typeof value.size })} size="sm">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <Switch size="sm" checked={value.loading} onCheckedChange={(loading) => onChange({ ...value, loading })} />
        Loading
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Switch size="sm" checked={value.disabled} onCheckedChange={(disabled) => onChange({ ...value, disabled })} />
        Disabled
      </label>
    </div>
  );
}
