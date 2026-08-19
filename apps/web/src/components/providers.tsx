"use client";

import { StyleProvider } from "../../../../packages/react/src/styles";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <StyleProvider engine="tailwind">{children}</StyleProvider>
    </ThemeProvider>
  );
}
