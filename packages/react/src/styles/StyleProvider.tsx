import React, { createContext, useContext } from "react";

import type { StyleEngine } from "@defied-prism/core";

interface StyleConfiguration {
  engine: StyleEngine;
}

const Context = createContext<StyleConfiguration>({
  engine: "tailwind",
});

export function StyleProvider({
  engine,
  children,
}: {
  engine: StyleEngine;
  children: React.ReactNode;
}) {
  return (
    <Context.Provider
      value={{
        engine,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useStyleEngine() {
  return useContext(Context);
}
