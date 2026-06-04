"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/context/TelemetryContext";
import { MetricCard } from "@/components/MetricCard";
import { TelemetryGauge } from "@/components/TelemetryGauge";
import { TelemetryBar } from "@/components/TelemetryBar";
import { DashboardShell } from "@/components/DashboardShell";

export default function AutomotivePage() {
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

  // Drag and Drop ordering for Automotive
  const [automotiveOrder, setAutomotiveOrder] = useState<string[]>([
    "rpm",
    "speed",
    "throttle",
    "brake",
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Stats calculation
  const rpmStats = getStats(history.rpm);
  const speedStats = getStats(history.speed);
  const throttleStats = getStats(history.throttle);
  const brakeStats = getStats(history.brake);

  // Channel statuses
  const rpmStatus = getChannelStatus("rpm", metrics.rpm);
  const speedStatus = getChannelStatus("speed", metrics.speed);
  const throttleStatus = getChannelStatus("throttle", metrics.throttle);
  const brakeStatus = getChannelStatus("brake", metrics.brake);

  // Overall system health calculation
  const totalAttempted = totalPacketsCount + missedPacketsCount;
  const lossRatio = totalAttempted > 0 ? (missedPacketsCount / totalAttempted) * 100 : 0;

  const sysStatus = (() => {
    if (!isConnected) return { status: "offline" as const, text: "OFFLINE" };
    const statuses = [rpmStatus.status, speedStatus.status];
    if (statuses.includes("danger") || lossRatio > 15) {
      return { status: "danger" as const, text: "OVERHEAT/HAZARD" };
    }
    if (statuses.includes("warning") || lossRatio > 5) {
      return { status: "warning" as const, text: "ATTN CHECK" };
    }
    return { status: "success" as const, text: "STABLE" };
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

    const currentOrder = [...automotiveOrder];
    const [removed] = currentOrder.splice(sourceIndex, 1);
    currentOrder.splice(targetIndex, 0, removed);

    setAutomotiveOrder(currentOrder);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Render Metric Cards
  const metricCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {automotiveOrder.map((cardId, index) => {
        const isDragging = draggedIndex === index;
        const dragProps = {
          draggable: true,
          onDragStart: (e: React.DragEvent) => handleDragStart(e, index),
          onDragOver: handleDragOver,
          onDrop: (e: React.DragEvent) => handleDrop(e, index),
          onDragEnd: handleDragEnd,
          className: `transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isDragging
              ? "opacity-30 scale-95 border border-dashed border-brand-secondary/60 rounded-lg"
              : "opacity-100"
          }`,
        };

        if (cardId === "rpm") {
          return (
            <div key="rpm" {...dragProps}>
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
            </div>
          );
        }
        if (cardId === "speed") {
          return (
            <div key="speed" {...dragProps}>
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
            </div>
          );
        }
        if (cardId === "throttle") {
          return (
            <div key="throttle" {...dragProps}>
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
            </div>
          );
        }

        // brake
        return (
          <div key="brake" {...dragProps}>
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
        );
      })}
    </div>
  );

  // Render Visual Cards (Ordered dynamically based on automotiveOrder)
  const visualCards = (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
      {automotiveOrder.map((cardId) => {
        if (cardId === "rpm") {
          return (
            <TelemetryGauge
              key="rpm"
              title="Tachometer (RPM)"
              value={activeChannels.rpm && isConnected ? metrics.rpm : 0}
              minVal={0}
              maxVal={8000}
              redline={6500}
              unit="rpm"
              color="#38bdf8"
              glowColor="rgba(56, 189, 248, 0.2)"
            />
          );
        }
        if (cardId === "speed") {
          return (
            <TelemetryGauge
              key="speed"
              title="Speedometer"
              value={activeChannels.speed && isConnected ? metrics.speed : 0}
              minVal={0}
              maxVal={240}
              unit="km/h"
              color="#10b981"
              glowColor="rgba(16, 185, 129, 0.2)"
            />
          );
        }
        if (cardId === "throttle") {
          return (
            <TelemetryBar
              key="throttle"
              title="Throttle Position Accelerator"
              value={activeChannels.throttle && isConnected ? metrics.throttle : 0}
              color="#00f5d4"
              glowColor="rgba(0, 245, 212, 0.2)"
            />
          );
        }

        // brake
        return (
          <TelemetryBar
            key="brake"
            title="Friction Braking Actuator"
            value={activeChannels.brake && isConnected ? metrics.brake : 0}
            color="#f43f5e"
            glowColor="rgba(244, 63, 94, 0.2)"
          />
        );
      })}
    </div>
  );

  return (
    <DashboardShell
      mode="automotive"
      metricCards={metricCards}
      visualCards={visualCards}
      sysStatus={sysStatus}
    />
  );
}
