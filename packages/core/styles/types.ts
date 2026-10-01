export type StyleEngine = "tailwind" | "css-modules";

export interface ComponentTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  radius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface StyleContext {
  engine: StyleEngine;

  tokens: ComponentTokens;

  variant?: string;

  size?: string;

  state: Record<string, boolean>;
}
