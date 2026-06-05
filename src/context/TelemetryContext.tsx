"use client";

import React, { createContext, useContext } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";

type TelemetryContextType = ReturnType<typeof useTelemetry>;

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const value = useTelemetry();
  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetryContext() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetryContext must be used within a TelemetryProvider");
  }
  return context;
}
