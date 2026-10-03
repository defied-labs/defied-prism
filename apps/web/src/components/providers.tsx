"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import { Toaster } from "./ui/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Fumadocs' provider owns next-themes for the whole site (one instance,
    // so ModeToggle and the docs theme switch stay in sync)
    <RootProvider
      theme={{
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
      }}
    >
      {children}
      <Toaster />
    </RootProvider>
  );
}
