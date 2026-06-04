"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/context/TelemetryContext";
import { MetricCard } from "@/components/MetricCard";
import { TelemetryChart } from "@/components/TelemetryChart";
import { DashboardShell } from "@/components/DashboardShell";

export default function BiotechPage() {
  const {
    isConnected,
    metrics,
    history,
    getStats,
    getChannelStatus,
    activeChannels,
    missedPacketsCount,
    totalPacketsCount,
  } = useTelemetryContext();

  // Drag and Drop ordering for Biotech
  const [biotechOrder, setBiotechOrder] = useState<string[]>([
    "temp",
    "ph",
    "oxygen",
    "pressure",
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Stats calculation
  const tempStats = getStats(history.temp);
  const phStats = getStats(history.ph);
  const oxygenStats = getStats(history.oxygen);
  const pressureStats = getStats(history.pressure);

  // Channel statuses
  const tempStatus = getChannelStatus("temp", metrics.temp);
  const phStatus = getChannelStatus("ph", metrics.ph);
  const oxygenStatus = getChannelStatus("oxygen", metrics.oxygen);
  const pressureStatus = getChannelStatus("pressure", metrics.pressure);

  // Overall system health calculation
  const totalAttempted = totalPacketsCount + missedPacketsCount;
  const lossRatio = totalAttempted > 0 ? (missedPacketsCount / totalAttempted) * 100 : 0;

  const sysStatus = (() => {
    if (!isConnected) return { status: "offline" as const, text: "OFFLINE" };
    const statuses = [tempStatus.status, phStatus.status, oxygenStatus.status, pressureStatus.status];
    if (statuses.includes("danger") || lossRatio > 15) {
      return { status: "danger" as const, text: "FAULT DETECTED" };
    }
    if (statuses.includes("warning") || lossRatio > 5) {
      return { status: "warning" as const, text: "ATTENTION" };
    }
    return { status: "success" as const, text: "NOMINAL" };
  })();

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    if (sourceIndex === targetIndex) return;

    const currentOrder = [...biotechOrder];
    const [removed] = currentOrder.splice(sourceIndex, 1);
    currentOrder.splice(targetIndex, 0, removed);

    setBiotechOrder(currentOrder);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Render Metric Cards
  const metricCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {biotechOrder.map((cardId, index) => {
        const isDragging = draggedIndex === index;
        const dragProps = {
          draggable: true,
          onDragStart: (e: React.DragEvent) => handleDragStart(e, index),
          onDragOver: handleDragOver,
          onDrop: (e: React.DragEvent) => handleDrop(e, index),
          onDragEnd: handleDragEnd,
          className: `transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isDragging
              ? "opacity-30 scale-95 border border-dashed border-brand-primary/60 rounded-lg"
              : "opacity-100"
          }`,
        };

        if (cardId === "temp") {
          return (
            <div key="temp" {...dragProps}>
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
            </div>
          );
        }
        if (cardId === "ph") {
          return (
            <div key="ph" {...dragProps}>
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
            </div>
          );
        }
        if (cardId === "oxygen") {
          return (
            <div key="oxygen" {...dragProps}>
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
            </div>
          );
        }

        // pressure
        return (
          <div key="pressure" {...dragProps}>
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
        );
      })}
    </div>
  );

  // Render Visual Cards (Telemetry Charts ordered dynamically based on biotechOrder)
  const visualCards = (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-[440px]">
      {biotechOrder.map((cardId) => {
        if (cardId === "temp") {
          return (
            <TelemetryChart
              key="temp"
              title="Bioreactor Thermal Profile (Temp)"
              data={activeChannels.temp && isConnected ? history.temp : []}
              minVal={34}
              maxVal={40}
              unit="°C"
              color="#00f5d4"
              glowColor="rgba(0, 245, 212, 0.15)"
            />
          );
        }
        if (cardId === "ph") {
          return (
            <TelemetryChart
              key="ph"
              title="Acidity Metabolic Drift (pH)"
              data={activeChannels.ph && isConnected ? history.ph : []}
              minVal={7.0}
              maxVal={7.8}
              unit="pH"
              color="#10b981"
              glowColor="rgba(16, 185, 129, 0.15)"
            />
          );
        }
        if (cardId === "oxygen") {
          return (
            <TelemetryChart
              key="oxygen"
              title="Oxygen Concentration Level"
              data={activeChannels.oxygen && isConnected ? history.oxygen : []}
              minVal={80}
              maxVal={110}
              unit="%"
              color="#f59e0b"
              glowColor="rgba(245, 158, 11, 0.15)"
            />
          );
        }

        // pressure
        return (
          <TelemetryChart
            key="pressure"
            title="Pumping Circuit Pressure Profile"
            data={activeChannels.pressure && isConnected ? history.pressure : []}
            minVal={90}
            maxVal={150}
            unit="mmHg"
            color="#38bdf8"
            glowColor="rgba(56, 189, 248, 0.15)"
          />
        );
      })}
    </div>
  );

  return (
    <DashboardShell
      mode="biotech"
      metricCards={metricCards}
      visualCards={visualCards}
      sysStatus={sysStatus}
    />
  );
}
