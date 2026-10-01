export interface GeneratorContext {
  styling: "tailwind" | "css-modules";
  compiledBase: string;
  compiledVariants: string;
  /** Pseudo-class/pseudo-element utilities targeting the host element; empty for CSS Modules. */
  compiledHostStates: string;
  styleFile: string | null;
  componentsPath: string;
  registryPath: string;
  components?: string[];
}
