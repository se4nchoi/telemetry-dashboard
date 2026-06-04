import React from "react";
import { Card } from "./Card";

interface TelemetryBarProps {
  title: string;
  value: number; // 0 to 100
  color: string; // RGB/HEX color code
  glowColor?: string; // RGBA shadow string
}

export function TelemetryBar({
  title,
  value,
  color,
  glowColor = "rgba(0, 245, 212, 0.2)",
}: TelemetryBarProps) {
  const percentage = Math.max(0, Math.min(100, value));
  const numSegments = 20;
  const activeSegments = Math.round((percentage / 100) * numSegments);

  return (
    <Card className="py-2 px-4 select-none">
      <div className="flex flex-col space-y-1.5">
        {/* Title and Percentage Display */}
        <div className="flex justify-between items-baseline font-mono text-[9px] uppercase tracking-wider">
          <span className="text-text-secondary/70">{title}</span>
          <span className="text-xs font-bold text-text-primary font-readout">
            {percentage.toFixed(0)}%
          </span>
        </div>

        {/* Segmented bar */}
        <div className="flex items-center space-x-1 w-full">
          {Array.from({ length: numSegments }).map((_, i) => {
            const isActive = i < activeSegments;
            return (
              <div
                key={i}
                className="flex-1 h-3 rounded-sm transition-all duration-150"
                style={{
                  backgroundColor: isActive ? color : "rgba(148, 163, 184, 0.05)",
                  boxShadow: isActive ? `0 0 6px ${glowColor}` : "none",
                  border: "1px solid rgba(148, 163, 184, 0.03)",
                }}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
