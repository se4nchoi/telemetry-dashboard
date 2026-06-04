"use client";

import React, { useState, useEffect } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { MetricCard } from "@/components/MetricCard";
import { TelemetryChart } from "@/components/TelemetryChart";
import { TelemetryGauge } from "@/components/TelemetryGauge";
import { TelemetryBar } from "@/components/TelemetryBar";
import { ControlPanel } from "@/components/ControlPanel";
import { StatusBadge, BadgeStatus } from "@/components/StatusBadge";
import { Card, CardHeader, CardContent } from "@/components/Card";

export default function Home() {
  const [mode, setMode] = useState<"biotech" | "automotive">("biotech");
  const {
    isConnected,
    toggleConnection,
    frequency,
    setFrequency,
    noiseMultiplier,
    setNoiseMultiplier,
    dropRate,
    setDropRate,
    missedPacketsCount,
    totalPacketsCount,
    logs,
    activeChannels,
    toggleChannel,
    metrics,
    history,
    getStats,
    getChannelStatus,
  } = useTelemetry();

  // Diagnostics metadata frame/packet counter
  const [packetCount, setPacketCount] = useState(0);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setPacketCount((c) => c + 1);
    }, 1000 / frequency);
    return () => clearInterval(interval);
  }, [isConnected, frequency]);

  // --- Statistics Calculation ---
  // Biotech stats
  const tempStats = getStats(history.temp);
  const phStats = getStats(history.ph);
  const oxygenStats = getStats(history.oxygen);
  const pressureStats = getStats(history.pressure);

  // Automotive stats
  const rpmStats = getStats(history.rpm);
  const speedStats = getStats(history.speed);
  const throttleStats = getStats(history.throttle);
  const brakeStats = getStats(history.brake);

  // --- Channel Status Calculation ---
  const tempStatus = getChannelStatus("temp", metrics.temp);
  const phStatus = getChannelStatus("ph", metrics.ph);
  const oxygenStatus = getChannelStatus("oxygen", metrics.oxygen);
  const pressureStatus = getChannelStatus("pressure", metrics.pressure);

  const rpmStatus = getChannelStatus("rpm", metrics.rpm);
  const speedStatus = getChannelStatus("speed", metrics.speed);
  const throttleStatus = getChannelStatus("throttle", metrics.throttle);
  const brakeStatus = getChannelStatus("brake", metrics.brake);

  // Computed frame loss stats
  const totalAttempted = totalPacketsCount + missedPacketsCount;
  const lossRatio = totalAttempted > 0 ? (missedPacketsCount / totalAttempted) * 100 : 0;

  // Overall system health
  const getSystemStatus = (): { status: BadgeStatus; text: string } => {
    if (!isConnected) return { status: "offline", text: "OFFLINE" };

    if (mode === "biotech") {
      const statuses = [tempStatus.status, phStatus.status, oxygenStatus.status, pressureStatus.status];
      if (statuses.includes("danger") || lossRatio > 15) return { status: "danger", text: "FAULT DETECTED" };
      if (statuses.includes("warning") || lossRatio > 5) return { status: "warning", text: "ATTENTION" };
      return { status: "success", text: "NOMINAL" };
    } else {
      const statuses = [rpmStatus.status, speedStatus.status];
      if (statuses.includes("danger") || lossRatio > 15) return { status: "danger", text: "OVERHEAT/HAZARD" };
      if (statuses.includes("warning") || lossRatio > 5) return { status: "warning", text: "ATTN CHECK" };
      return { status: "success", text: "CAN STABLE" };
    }
  };

  const sysStatus = getSystemStatus();

  return (
    <main className="flex-1 w-full min-h-screen bg-bg-primary text-text-primary px-4 py-6 md:px-8 grid-scan flex flex-col justify-between selection:bg-brand-primary/20">

      {/* Top Header Navigation */}
      <header className="border-b border-border-custom pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <span className="h-3 w-3 bg-brand-primary rounded-full animate-pulse-glow" />
          <h1 className="text-xl font-black uppercase tracking-widest font-mono text-text-primary">
            Telemetry Dashboard
          </h1>
        </div>
        <p className="text-[10px] text-text-secondary/80 font-mono uppercase mt-1">
          Diagnostic Instrumentation Casing &bull; Version 1.1.0-Beta
        </p>
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
            mode={mode}
            onModeChange={setMode}
          />
        </div>

        {/* Center & Right Columns: Dynamic Views */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          {mode === "biotech" ? (
            // --- Biotech View ---
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard
                  title="Bioreactor Temperature"
                  value={metrics.temp}
                  unit="°C"
                  status={tempStatus.status}
                  statusText={tempStatus.text}
                  history={history.temp}
                  min={tempStats.min.toFixed(1)}
                  max={tempStats.max.toFixed(1)}
                  avg={tempStats.avg.toFixed(1)}
                />

                <MetricCard
                  title="Acidity Level (pH)"
                  value={metrics.ph}
                  unit="pH"
                  status={phStatus.status}
                  statusText={phStatus.text}
                  history={history.ph}
                  min={phStats.min.toFixed(2)}
                  max={phStats.max.toFixed(2)}
                  avg={phStats.avg.toFixed(2)}
                />

                <MetricCard
                  title="Dissolved Oxygen"
                  value={metrics.oxygen}
                  unit="%"
                  status={oxygenStatus.status}
                  statusText={oxygenStatus.text}
                  history={history.oxygen}
                  min={oxygenStats.min.toFixed(1)}
                  max={oxygenStats.max.toFixed(1)}
                  avg={oxygenStats.avg.toFixed(1)}
                />

                <MetricCard
                  title="Chamber Pressure"
                  value={metrics.pressure}
                  unit="mmHg"
                  status={pressureStatus.status}
                  statusText={pressureStatus.text}
                  history={history.pressure}
                  min={pressureStats.min.toFixed(0)}
                  max={pressureStats.max.toFixed(0)}
                  avg={pressureStats.avg.toFixed(0)}
                />
              </div>

              {/* Canvas Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-[440px]">
                <TelemetryChart
                  title="Bioreactor Thermal Profile (Temp)"
                  data={activeChannels.temp && isConnected ? history.temp : []}
                  minVal={34}
                  maxVal={40}
                  unit="°C"
                  color="#00f5d4"
                  glowColor="rgba(0, 245, 212, 0.15)"
                />

                <TelemetryChart
                  title="Pumping Circuit Pressure Profile"
                  data={activeChannels.pressure && isConnected ? history.pressure : []}
                  minVal={90}
                  maxVal={150}
                  unit="mmHg"
                  color="#38bdf8"
                  glowColor="rgba(56, 189, 248, 0.15)"
                />

                <TelemetryChart
                  title="Acidity Metabolic Drift (pH)"
                  data={activeChannels.ph && isConnected ? history.ph : []}
                  minVal={7.0}
                  maxVal={7.8}
                  unit="pH"
                  color="#10b981"
                  glowColor="rgba(16, 185, 129, 0.15)"
                />

                <TelemetryChart
                  title="Oxygen Concentration Level"
                  data={activeChannels.oxygen && isConnected ? history.oxygen : []}
                  minVal={80}
                  maxVal={110}
                  unit="%"
                  color="#f59e0b"
                  glowColor="rgba(245, 158, 11, 0.15)"
                />
              </div>
            </div>
          ) : (
            // --- Automotive View ---
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Automotive Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard
                  title="Engine Speed (RPM)"
                  value={metrics.rpm}
                  unit="rpm"
                  status={rpmStatus.status}
                  statusText={rpmStatus.text}
                  history={history.rpm}
                  min={rpmStats.min.toFixed(0)}
                  max={rpmStats.max.toFixed(0)}
                  avg={rpmStats.avg.toFixed(0)}
                />

                <MetricCard
                  title="Vehicle Speed"
                  value={metrics.speed}
                  unit="km/h"
                  status={speedStatus.status}
                  statusText={speedStatus.text}
                  history={history.speed}
                  min={speedStats.min.toFixed(0)}
                  max={speedStats.max.toFixed(0)}
                  avg={speedStats.avg.toFixed(0)}
                />

                <MetricCard
                  title="Throttle Input"
                  value={metrics.throttle}
                  unit="%"
                  status={throttleStatus.status}
                  statusText={throttleStatus.text}
                  history={history.throttle}
                  min={throttleStats.min.toFixed(0)}
                  max={throttleStats.max.toFixed(0)}
                  avg={throttleStats.avg.toFixed(0)}
                />

                <MetricCard
                  title="Braking Input"
                  value={metrics.brake}
                  unit="%"
                  status={brakeStatus.status}
                  statusText={brakeStatus.text}
                  history={history.brake}
                  min={brakeStats.min.toFixed(0)}
                  max={brakeStats.max.toFixed(0)}
                  avg={brakeStats.avg.toFixed(0)}
                />
              </div>

              {/* Automotive Canvas Gauges and Segment Bars */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
                {/* Dial Dials */}
                <div className="grid grid-cols-2 gap-4">
                  <TelemetryGauge
                    title="Tachometer (RPM)"
                    value={activeChannels.rpm && isConnected ? metrics.rpm : 0}
                    minVal={0}
                    maxVal={8000}
                    redline={6500}
                    unit="rpm"
                    color="#38bdf8"
                    glowColor="rgba(56, 189, 248, 0.2)"
                  />
                  <TelemetryGauge
                    title="Speedometer"
                    value={activeChannels.speed && isConnected ? metrics.speed : 0}
                    minVal={0}
                    maxVal={240}
                    unit="km/h"
                    color="#10b981"
                    glowColor="rgba(16, 185, 129, 0.2)"
                  />
                </div>

                {/* Pedal inputs segmented progress indicators */}
                <div className="flex flex-col justify-center space-y-4">
                  <TelemetryBar
                    title="Throttle Position Accelerator"
                    value={activeChannels.throttle && isConnected ? metrics.throttle : 0}
                    color="#00f5d4"
                    glowColor="rgba(0, 245, 212, 0.2)"
                  />
                  <TelemetryBar
                    title="Friction Braking Actuator"
                    value={activeChannels.brake && isConnected ? metrics.brake : 0}
                    color="#f43f5e"
                    glowColor="rgba(244, 63, 94, 0.2)"
                  />
                </div>
              </div>
            </div>
          )}

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
                      {mode === "biotech" ? "BIOPROCESSOR_OB_MOCK" : "CAN_BUS_ECU_MOCK"}
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
