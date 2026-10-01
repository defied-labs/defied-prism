import type { ComponentContract } from "./contract";

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

    /** The Prism adapter this framework's templates import. */
    runtimeVersion: {
      package: string;

      version: string;
    };

    /**
     * Packages only this framework's templates need: the framework itself
     * and its Prism adapter. Shared packages live in the top-level
     * `dependencies`.
     */
    dependencies: Dependency[];
  }[];

  styling: StylingEngine[];
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
  /** Only set once automated accessibility tests verify it. */
  standard?: "WCAG-AA" | "WCAG-AAA";

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
  /** Framework- and CSS-agnostic behavior contract. */
  contract?: ComponentContract;

  metadata: ComponentMetadata;

  compatibility: Compatibility;

  dependencies: Dependency[];

  /**
   * Other registry components this one's templates import (as `./Button`).
   * `prism add` installs them first.
   */
  registryDependencies?: string[];

  tokens: TokenRequirement[];

  accessibility: AccessibilitySpec;

  tests: TestSpecification;

  migrations: Migration[];

  registryPath: string;
}
