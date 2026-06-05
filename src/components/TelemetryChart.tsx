import React, { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "./Card";

interface TelemetryChartProps {
  title: string;
  data: number[];
  minVal?: number;
  maxVal?: number;
  unit: string;
  color: string;
  glowColor: string;
}

export function TelemetryChart({
  title,
  data,
  minVal,
  maxVal,
  unit,
  color,
  glowColor,
}: TelemetryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Resize canvas to match display size and redrawing chart on data update
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
      
      drawChart();
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, hoverIndex]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Padding layout
    const padTop = 15;
    const padBottom = 20;
    const padLeft = 10;
    const padRight = 10;

    const graphWidth = width - padLeft - padRight;
    const graphHeight = height - padTop - padBottom;

    // Determine scale bounds
    const actualMin = minVal !== undefined ? minVal : Math.min(...data);
    const actualMax = maxVal !== undefined ? maxVal : Math.max(...data);
    const range = actualMax - actualMin || 1;

    // Add extra padding to range if autoscaled
    const minBound = minVal !== undefined ? minVal : actualMin - range * 0.1;
    const maxBound = maxVal !== undefined ? maxVal : actualMax + range * 0.1;
    const finalRange = maxBound - minBound || 1;

    // Draw Grid Lines (Horizontal and Vertical)
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)"; 
    
    // Draw 4 horizontal grid lines
    const gridLinesCount = 4;
    for (let i = 0; i <= gridLinesCount; i++) {
      const y = padTop + (i / gridLinesCount) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + graphWidth, y);
      ctx.stroke();

      // Draw Grid value labels on right edge
      const gridVal = maxBound - (i / gridLinesCount) * finalRange;
      ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
      ctx.font = "8px monospace";
      ctx.fillText(gridVal.toFixed(0), padLeft + graphWidth - 25, y - 4);
    }

    // Draw 6 vertical grid lines
    const vGridLinesCount = 6;
    for (let i = 0; i <= vGridLinesCount; i++) {
      const x = padLeft + (i / vGridLinesCount) * graphWidth;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + graphHeight);
      ctx.stroke();
    }

    if (!data || data.length === 0) return;

    // Draw Line Plot
    ctx.beginPath();
    const getCoords = (idx: number, val: number) => {
      const x = padLeft + (idx / (data.length - 1)) * graphWidth;
      const y = padTop + graphHeight - ((val - minBound) / finalRange) * graphHeight;
      return { x, y };
    };

    const firstPoint = getCoords(0, data[0]);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < data.length; i++) {
      const pt = getCoords(i, data[i]);
      ctx.lineTo(pt.x, pt.y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Set glowing shadow for the line
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // Fill Gradient below line
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + graphHeight);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.lineTo(getCoords(data.length - 1, data[data.length - 1]).x, padTop + graphHeight);
    ctx.lineTo(firstPoint.x, padTop + graphHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Hover state indicator (Vertical line & dot)
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) {
      const hoverPt = getCoords(hoverIndex, data[hoverIndex]);

      // Vertical cursor line
      ctx.beginPath();
      ctx.moveTo(hoverPt.x, padTop);
      ctx.lineTo(hoverPt.x, padTop + graphHeight);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Glowing marker circle on line
      ctx.beginPath();
      ctx.arc(hoverPt.x, hoverPt.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fill();
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(hoverPt.x, hoverPt.y, 7, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0; // reset shadow
      ctx.stroke();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padLeft = 10;
    const padRight = 10;
    const graphWidth = rect.width - padLeft - padRight;

    const relativeX = x - padLeft;
    let idx = Math.round((relativeX / graphWidth) * (data.length - 1));
    idx = Math.max(0, Math.min(data.length - 1, idx));

    setHoverIndex(idx);
    setTooltipPos({ x: x + 10, y: y - 10 });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setTooltipPos(null);
  };

  return (
    <Card className="flex flex-col h-full min-h-[220px]">
      <CardHeader>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
          {title}
        </span>
      </CardHeader>
      
      <CardContent className="flex-1 p-2 relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair"
        />

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && tooltipPos && data[hoverIndex] !== undefined && (
          <div
            className="absolute z-10 bg-bg-secondary/95 border border-border-custom px-2.5 py-1.5 rounded shadow-glow-sm pointer-events-none font-mono text-[9px] uppercase tracking-wider text-text-primary"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="text-text-secondary/60">Sample #{hoverIndex}</div>
            <div className="font-bold flex items-center space-x-1 mt-0.5">
              <span style={{ color }}>●</span>
              <span>
                {data[hoverIndex].toFixed(data[hoverIndex] < 10 ? 2 : 1)} {unit}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
