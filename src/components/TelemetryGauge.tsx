import React, { useRef, useEffect } from "react";
import { Card, CardHeader, CardContent } from "./Card";

interface TelemetryGaugeProps {
  title: string;
  value: number;
  minVal: number;
  maxVal: number;
  unit: string;
  color: string;
  glowColor: string;
  redline?: number;
}

export function TelemetryGauge({
  title,
  value,
  minVal,
  maxVal,
  unit,
  color,
  glowColor,
  redline,
}: TelemetryGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawGauge();
    };

    resizeCanvas();
    drawGauge();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(canvas.parentElement || canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [value, color, glowColor]);

  const drawGauge = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const radius = Math.min(width, height) / 2.3;

    // Dial Sweep configuration
    const startAngle = 0.78 * Math.PI;
    const endAngle = 2.22 * Math.PI;
    const totalAngle = endAngle - startAngle;

    const percentage = Math.min(1, Math.max(0, (value - minVal) / (maxVal - minVal)));
    const currentAngle = startAngle + percentage * totalAngle;

    // 1. Draw Dial Track Background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // 2. Draw Redline Track Sector
    if (redline !== undefined && redline < maxVal) {
      const redlinePercentage = (redline - minVal) / (maxVal - minVal);
      const redlineAngle = startAngle + redlinePercentage * totalAngle;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, redlineAngle, endAngle);
      ctx.strokeStyle = "rgba(244, 63, 94, 0.2)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // 3. Draw Active Fill Sweep
    if (percentage > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
      
      const isRedlineBreached = redline !== undefined && value >= redline;
      ctx.strokeStyle = isRedlineBreached ? "#f43f5e" : color;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";

      ctx.save();
      ctx.shadowColor = isRedlineBreached ? "rgba(244, 63, 94, 0.4)" : color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Dial Scales / Ticks
    const numTicks = 9;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < numTicks; i++) {
      const tickPct = i / (numTicks - 1);
      const tickAngle = startAngle + tickPct * totalAngle;
      const valAtTick = minVal + tickPct * (maxVal - minVal);

      const innerX = centerX + (radius - 10) * Math.cos(tickAngle);
      const innerY = centerY + (radius - 10) * Math.sin(tickAngle);
      const outerX = centerX + (radius - 4) * Math.cos(tickAngle);
      const outerY = centerY + (radius - 4) * Math.sin(tickAngle);

      const isTickRedline = redline !== undefined && valAtTick >= redline;
      ctx.strokeStyle = isTickRedline ? "rgba(244, 63, 94, 0.5)" : "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = isTickRedline ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();

      // Tick Text (Alternate indices)
      if (i % 2 === 0) {
        const textX = centerX + (radius - 20) * Math.cos(tickAngle);
        const textY = centerY + (radius - 20) * Math.sin(tickAngle);
        ctx.fillStyle = isTickRedline ? "rgba(244, 63, 94, 0.7)" : "rgba(148, 163, 184, 0.4)";
        ctx.font = "8px monospace";
        
        // Show RPM value divided by 1000 (e.g. 7k) or raw speed
        const displayVal = maxVal > 1000 ? (valAtTick / 1000).toFixed(0) : valAtTick.toFixed(0);
        ctx.fillText(displayVal, textX, textY);
      }
    }

    // 5. Draw Digital Display
    ctx.fillStyle = "var(--text-primary)";
    ctx.font = "bold 18px monospace";
    ctx.fillText(value.toFixed(0), centerX, centerY - 4);

    ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
    ctx.font = "bold 8px monospace";
    ctx.fillText(unit.toUpperCase(), centerX, centerY + 10);
  };

  return (
    <Card className="flex flex-col h-full min-h-[170px]">
      <CardHeader className="py-2 flex items-center justify-between">
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-text-primary">
          {title}
        </span>
      </CardHeader>
      <CardContent className="flex-1 flex justify-center items-center p-2 relative">
        <canvas ref={canvasRef} className="w-full h-full max-h-[120px] max-w-[150px]" />
      </CardContent>
    </Card>
  );
}
