export const MANIFEST_VERSION = "1.0";

export type Framework = "react" | "vue";
export type StylingEngine = "tailwind" | "css-modules" | "vanilla-css";

export type ComponentType = "primitive" | "compound" | "block";
export type ComponentStatus = "experimental" | "beta" | "stable" | "deprecated";

export interface ComponentMetadata {
  name: string;

  displayName: string;

  description: string;

  version: string;

  manifestVersion: typeof MANIFEST_VERSION;

  type: ComponentType;

  status: ComponentStatus;

  category:
    | "actions"
    | "forms"
    | "navigation"
    | "feedback"
    | "layout"
    | "data-display";

  keywords: string[];
}

export interface Compatibility {
  frameworks: {
    framework: Framework;

    minVersion?: string;

    files: ComponentFile[];
  }[];

  styling: StylingEngine[];

  runtimeVersion: {
    package: string;

    version: string;
  };
}

export interface ComponentFile {
  source: string;

  destination: string;

  type: "component" | "style" | "test" | "config" | "documentation";

  editable: boolean;
}

export interface Dependency {
  package: string;

  version: string;

  type: "dependency" | "devDependency" | "peerDependency";
}

export interface TokenRequirement {
  name: string;

  required: boolean;
}

export interface AccessibilitySpec {
  standard: "WCAG-AA" | "WCAG-AAA";

  keyboardSupport: boolean;

  screenReaderSupport: boolean;

  ariaPatterns: string[];
}

export interface TestSpecification {
  unit: boolean;

  accessibility: boolean;

  visual: boolean;

  e2e: boolean;
}

export interface Migration {
  from: string;

  to: string;

  script?: string;
}

export interface ComponentManifest {
  metadata: ComponentMetadata;

  compatibility: Compatibility;

  dependencies: Dependency[];

  tokens: TokenRequirement[];

  accessibility: AccessibilitySpec;

  tests: TestSpecification;

  migrations: Migration[];

  registryPath: string;
}
