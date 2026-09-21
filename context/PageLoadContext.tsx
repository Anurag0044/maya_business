"use client";

import React, { createContext, useContext, useState } from "react";

interface PageLoadContextType {
  isPageReady: boolean;
  setPageReady: (ready: boolean) => void;
}

const PageLoadContext = createContext<PageLoadContextType>({
  isPageReady: false,
  setPageReady: () => {},
});

export function PageLoadProvider({ children }: { children: React.ReactNode }) {
  const [isPageReady, setPageReady] = useState(false);

  React.useEffect(() => {
    // Fail-safe: ensure page contents are guaranteed visible after 2.2s
    const fallbackTimer = setTimeout(() => {
      setPageReady(true);
    }, 2200);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <PageLoadContext.Provider value={{ isPageReady, setPageReady }}>
      {children}
    </PageLoadContext.Provider>
  );
}

export function usePageLoad() {
  return useContext(PageLoadContext);
}
