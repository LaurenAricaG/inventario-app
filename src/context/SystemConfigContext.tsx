"use client";

import { createContext, useContext, ReactNode } from "react";
import type { SystemConfig } from "@/types/models";

const SystemConfigContext = createContext<SystemConfig | null>(null);

export function SystemConfigProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: SystemConfig | null;
}) {
  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  const context = useContext(SystemConfigContext);
  return context;
}
