import React from "react";
import { Card, CardContent } from "./Card";
import { StatusBadge, BadgeStatus } from "./StatusBadge";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  status: BadgeStatus;
  statusText: string;
  history: number[];
  min: string | number;
  max: string | number;
  avg: string | number;
}

export function MetricCard({
  title,
  value,
  unit,
  status,
  statusText,
  history,
  min,
  max,
  avg,
}: MetricCardProps) {
  // Generate SVG path for the sparkline chart
  const generateSparklinePath = () => {
    if (!history || history.length < 2) return "";
    
    const width = 100;
    const height = 28;
    const maxVal = Math.max(...history);
    const minVal = Math.min(...history);
    const valRange = maxVal - minVal || 1;

    const points = history.map((val, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((val - minVal) / valRange) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(" L ")}`;
  };

  const getSparklineColor = () => {
    switch (status) {
      case "success":
        return "stroke-brand-success";
      case "warning":
        return "stroke-brand-warning";
      case "danger":
        return "stroke-brand-danger";
      case "info":
        return "stroke-brand-primary";
      case "offline":
      default:
        return "stroke-text-secondary/35";
    }
  };

  const sparklineColor = getSparklineColor();
  const sparklinePath = generateSparklinePath();

  // Dynamic rounding logic for telemetry values:
  // - pH (e.g. 7.4) gets 2 decimal places (7.40)
  // - Temperature (e.g. 37) gets 1 decimal place (37.0)
  // - Pressure (e.g. 120) gets 0 decimal places (120)
  const formatReadout = (val: number) => {
    if (val < 10) return val.toFixed(2);
    if (val < 100) return val.toFixed(1);
    return val.toFixed(0);
  };

  return (
    <Card className="relative overflow-hidden group">
      {/* Decorative colored top line matching diagnostic status */}
      <div
        className={`absolute top-0 left-0 w-full h-[2px] transition-colors duration-300 ${
          status === "success"
            ? "bg-brand-success"
            : status === "warning"
            ? "bg-brand-warning"
            : status === "danger"
            ? "bg-brand-danger"
            : status === "info"
            ? "bg-brand-primary"
            : "bg-text-secondary/20"
        }`}
      />

      <CardContent className="space-y-4 pt-5">
        {/* Header: Title & Status Badge */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            {title}
          </span>
          <StatusBadge status={status} text={statusText} />
        </div>

        {/* Readout: Value & Unit & Sparkline */}
        <div className="flex justify-between items-end">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-black font-readout tracking-tighter text-text-primary">
              {status === "offline" ? "---" : formatReadout(value)}
            </span>
            <span className="text-xs font-mono text-text-secondary/70 uppercase">
              {unit}
            </span>
          </div>

          {/* Mini Sparkline */}
          {status !== "offline" && sparklinePath && (
            <div className="w-[100px] h-[30px] opacity-80 group-hover:opacity-100 transition-opacity">
              <svg width="100%" height="100%" viewBox="0 0 100 28" fill="none">
                <path
                  d={sparklinePath}
                  className={sparklineColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-1 pt-3 border-t border-border-custom/50 font-mono text-[9px] text-text-secondary/70">
          <div className="space-y-0.5">
            <span className="block uppercase text-[8px] text-text-secondary/45">Min</span>
            <span className="font-semibold font-readout text-text-primary">
              {status === "offline" ? "---" : min}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="block uppercase text-[8px] text-text-secondary/45">Avg</span>
            <span className="font-semibold font-readout text-text-primary">
              {status === "offline" ? "---" : avg}
            </span>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="block uppercase text-[8px] text-text-secondary/45">Max</span>
            <span className="font-semibold font-readout text-text-primary">
              {status === "offline" ? "---" : max}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
