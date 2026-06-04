"use client";

import React, { useEffect, useState } from "react";
import { useTelemetryContext } from "@/context/TelemetryContext";
import { ControlPanel } from "./ControlPanel";
import { StatusBadge, BadgeStatus } from "./StatusBadge";
import { Card, CardHeader, CardContent } from "./Card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

interface DashboardShellProps {
  mode: "biotech" | "automotive";
  metricCards: React.ReactNode;
  visualCards: React.ReactNode;
  sysStatus: { status: BadgeStatus; text: string };
}

const CATEGORIES = [
  { id: "biotech" as const, name: "Biotech", path: "/biotech", icon: "🔬" },
  { id: "automotive" as const, name: "Automotive", path: "/automotive", icon: "🏎️" },
];

export function DashboardShell({
  mode,
  metricCards,
  visualCards,
  sysStatus,
}: DashboardShellProps) {
  const {
    isConnected,
    toggleConnection,
    frequency,
    setFrequency,
    noiseMultiplier,
    setNoiseMultiplier,
    dropRate,
    setDropRate,
    activeChannels,
    toggleChannel,
    logs,
    missedPacketsCount,
    totalPacketsCount,
  } = useTelemetryContext();

  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const currentMode: "biotech" | "automotive" = pathname.includes("automotive") ? "automotive" : "biotech";

  const [packetCount, setPacketCount] = useState(0);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setPacketCount((c) => c + 1);
    }, 1000 / frequency);
    return () => clearInterval(interval);
  }, [isConnected, frequency]);

  const totalAttempted = totalPacketsCount + missedPacketsCount;
  const lossRatio = totalAttempted > 0 ? (missedPacketsCount / totalAttempted) * 100 : 0;

  const dotColorClass = mode === "biotech" ? "bg-brand-primary" : "bg-brand-secondary";
  const slashColorClass = mode === "biotech" ? "text-brand-primary" : "text-brand-secondary";
  const moduleLabel = mode === "biotech" ? "BIOPROCESSOR_OB_MOCK" : "CAN_BUS_ECU_MOCK";

  return (
    <main className="flex-1 w-full min-h-screen bg-bg-primary text-text-primary px-4 py-6 md:px-8 grid-scan flex flex-col justify-between selection:bg-brand-primary/20">
      {/* Top Header Navigation */}
      <header className="border-b border-border-custom pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className={`h-3 w-3 ${dotColorClass} rounded-full animate-pulse-glow`} />
            <h1 className="text-xl font-black uppercase tracking-widest font-mono text-text-primary">
              Telemetry <span className={slashColorClass}>//</span> Dashboard
            </h1>
          </div>
          <p className="text-[10px] text-text-secondary/80 font-mono uppercase mt-1">
            Diagnostic Visualization &bull; Version 1.0.0
          </p>
        </div>

        {/* Top Navbar Menu & Theme Switcher */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center p-1 bg-bg-secondary rounded border border-border-custom shadow-sm">
            {CATEGORIES.map((cat) => {
              const isActive = currentMode === cat.id;
              const activeColorClass = cat.id === "biotech" ? "text-brand-primary border-brand-primary/20 bg-bg-primary" : "text-brand-secondary border-brand-secondary/20 bg-bg-primary";
              return (
                <Link
                  key={cat.id}
                  href={cat.path}
                  className={`px-3 py-1.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider transition cursor-pointer text-center flex items-center justify-center space-x-1.5 border border-transparent ${isActive
                    ? `${activeColorClass} shadow-sm border`
                    : "text-text-secondary/70 hover:text-text-primary"
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded border border-border-custom bg-bg-secondary hover:bg-bg-primary text-[10px] font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary transition cursor-pointer shadow-sm"
            title="Toggle Theme"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Control Panel */}
        <div className="lg:col-span-1">
          <ControlPanel
            isConnected={isConnected}
            onToggleConnection={toggleConnection}
            frequency={frequency}
            onFrequencyChange={setFrequency}
            noiseMultiplier={noiseMultiplier}
            onNoiseChange={setNoiseMultiplier}
            dropRate={dropRate}
            onDropRateChange={setDropRate}
            activeChannels={activeChannels}
            onToggleChannel={toggleChannel}
          />
        </div>

        {/* Center & Right Columns: Dynamic Views */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            {/* Draggable Metric Cards Row */}
            {metricCards}

            {/* Visualizations (Charts/Gauges/Bars) */}
            {visualCards}
          </div>

          {/* Real-time Diagnostics Monospace Log Terminal */}
          <div className="pt-2">
            <Card className="border border-border-custom overflow-hidden">
              <CardHeader className="py-1.5 px-4 bg-bg-secondary flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                  Diagnostics Terminal Console
                </span>

                {/* Consolidated Diagnostics Telemetry Stats */}
                <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase">
                  <div className="border border-border-custom/50 rounded px-2 py-0.5 bg-bg-primary flex items-center space-x-1.5">
                    <span className="text-text-secondary/60">Module:</span>
                    <span className="font-semibold text-text-primary">
                      {moduleLabel}
                    </span>
                  </div>

                  <div className="border border-border-custom/50 rounded px-2 py-0.5 bg-bg-primary flex items-center space-x-1.5">
                    <span className="text-text-secondary/60">Frames:</span>
                    <span className="font-semibold text-brand-primary font-readout">{packetCount}</span>
                  </div>

                  <div className="border border-border-custom/50 rounded px-2 py-0.5 bg-bg-primary flex items-center space-x-1.5">
                    <span className="text-text-secondary/60">Drops:</span>
                    <span className={`font-semibold font-readout ${missedPacketsCount > 0 ? "text-brand-danger animate-pulse" : "text-text-primary"}`}>
                      {missedPacketsCount} ({lossRatio.toFixed(1)}%)
                    </span>
                  </div>

                  <StatusBadge status={sysStatus.status} text={sysStatus.text} className="py-0 px-2 text-[8px]" />
                </div>
              </CardHeader>
              <CardContent className="p-3 bg-bg-primary/40 h-[100px] overflow-y-auto font-mono text-[9px] space-y-1 select-text">
                {logs.length === 0 ? (
                  <div className="text-text-secondary/40 uppercase">Awaiting telemetry logs...</div>
                ) : (
                  logs.map((log) => {
                    const colorClass =
                      log.type === "error"
                        ? "text-brand-danger"
                        : log.type === "warning"
                          ? "text-brand-warning"
                          : log.type === "success"
                            ? "text-brand-success"
                            : "text-brand-primary";

                    return (
                      <div key={log.id} className="flex space-x-2 leading-relaxed">
                        <span className="text-text-secondary/40 font-readout">[{log.time}]</span>
                        <span className={`${colorClass} font-semibold uppercase`}>[{log.type}]</span>
                        <span className="text-text-primary/90">{log.message}</span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Laboratory Instrument Footer */}
      <footer className="mt-8 pt-4 border-t border-border-custom flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono uppercase text-text-secondary/50 gap-2">
        <span>Diag Code: 0x481F &bull; MCU State: {isConnected ? "AWAIT_STREAM" : "DISCONNECTED"}</span>
        <span>&copy; {new Date().getFullYear()} BioStream Inc. All Rights Reserved.</span>
        <span>Staging Endpoint: /api/telemetry</span>
      </footer>
    </main>
  );
}
