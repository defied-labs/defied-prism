import {
  loadConfig,
  recordInstalledComponent,
  saveConfig,
} from "../config/loadConfig";

import { LocalRegistryClient } from "../registry/RegistryClient";

import { createGenerator } from "../generators/GeneratorFactory";
import type { Framework } from "../registry/ComponentManifest";

import {
  StyleParser,
  TailwindCompiler,
  CSSModulesCompiler,
} from "@defied-prism/style-engine";
import type { StyleDefinition } from "../../../style-engine/src/types";

type Styling = "tailwind" | "css-modules";

interface AddOptions {
  style?: Styling;
  registry?: string;
}

interface CompileBundle {
  styling: Styling;
  compiledBase: string;
  compiledVariants: string;
  compiledHostStates: string;
  styleFile: string | null;
  variantStyles: Record<string, string>;
}

/**
 * Variant names that begin with a CSS pseudo marker (":hover", "::before", …)
 * apply to the host element rather than to a runtime-selected design
 * variant. They must be merged into the base className, not into the
 * `variantStyles[variant]` lookup table.
 */
function isHostName(name: string): boolean {
  return name.startsWith(":");
}

function compileStyle(
  styling: Styling,
  parsedStyle: ReturnType<StyleParser["parse"]>,
): CompileBundle {
  switch (styling) {
    case "tailwind": {
      const tw = new TailwindCompiler();
      const compiledBase = tw.compile(parsedStyle);
      const allVariants = tw.compileVariants(parsedStyle);

      const variantStyles: Record<string, string> = {};
      const hostStateParts: string[] = [];
      for (const [name, classes] of Object.entries(allVariants)) {
        if (isHostName(name)) {
          hostStateParts.push(classes);
        } else {
          variantStyles[name] = classes;
        }
      }
      const compiledHostStates = hostStateParts.join(" ").trim();
      const compiledVariants =
        Object.keys(variantStyles).length > 0
          ? JSON.stringify(variantStyles)
          : "{}";
      return {
        styling,
        compiledBase,
        compiledVariants,
        compiledHostStates,
        styleFile: null,
        variantStyles,
      };
    }
    case "css-modules": {
      const css = new CSSModulesCompiler();
      const fileResult = css.compileFile(parsedStyle);

      for (const diag of fileResult.diagnostics) {
        const prefix = diag.level === "error" ? "✗" : "⚠";
        console.warn(`[prism] ${prefix} ${diag.message}`);
      }

      if (fileResult.missingTokens.length > 0) {
        console.warn(
          `[prism] ${fileResult.missingTokens.length} missing design token(s): ${fileResult.missingTokens.join(", ")}. ` +
            `Define them in your global CSS, or the generated CSS Modules file will render unstyled.`,
        );
      }

      return {
        styling,
        compiledBase: "styles.root",
        compiledVariants: "{}",
        // Host-state selectors are emitted as standalone `.root:hover` /
        // `.root::before` blocks in the CSS module file itself; nothing to
        // inject into the JSX className.
        compiledHostStates: "",
        styleFile: fileResult.css,
        variantStyles: {},
      };
    }
  }
}

export async function addCommand(component: string, options: AddOptions) {
  const config = await loadConfig();

  const styling = options.style ?? config.styling;

  const registryPath = options.registry ?? config.registryPath ?? "./registry";

  if (options.style && options.style !== config.styling) {
    config.styling = options.style;
    await saveConfig(config);
    console.log(`✓ Updated prism.json styling -> ${options.style}`);
  }

  const registry = new LocalRegistryClient(registryPath);

  const manifest = await registry.getManifest(component);

  const styleDefinition = (await registry.getStyle(
    component,
  )) as StyleDefinition;

  const parsedStyle = new StyleParser().parse(styleDefinition);

  const bundle = compileStyle(styling, parsedStyle);

  const generator = createGenerator(
    config.framework,
    registry,
    {
      styling,
      compiledBase: bundle.compiledBase,
      compiledVariants: bundle.compiledVariants,
      compiledHostStates: bundle.compiledHostStates,
      styleFile: bundle.styleFile,
      componentsPath: config.componentsPath,
    },
    manifest,
  );

  await generator.generate(manifest);

  await recordInstalledComponent(component);

  console.log(`✓ Added ${component} (${config.framework} / ${styling})`);
}

export async function regenerateComponent(
  component: string,
  context: {
    framework: Framework;
    styling: Styling;
    registryPath: string;
    componentsPath: string;
  },
) {
  const registry = new LocalRegistryClient(context.registryPath);

  const manifest = await registry.getManifest(component);

  const styleDefinition = (await registry.getStyle(
    component,
  )) as StyleDefinition;

  const parsedStyle = new StyleParser().parse(styleDefinition);

  const bundle = compileStyle(context.styling, parsedStyle);

  const generator = createGenerator(
    context.framework,
    registry,
    {
      styling: context.styling,
      compiledBase: bundle.compiledBase,
      compiledVariants: bundle.compiledVariants,
      compiledHostStates: bundle.compiledHostStates,
      styleFile: bundle.styleFile,
      componentsPath: context.componentsPath,
    },
    manifest,
  );

  await generator.generate(manifest);

  return context.styling;
}
