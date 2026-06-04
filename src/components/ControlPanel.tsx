import React from "react";
import { Card, CardHeader, CardContent } from "./Card";
import { useTheme } from "@/context/ThemeContext";

interface ControlPanelProps {
  isConnected: boolean;
  onToggleConnection: () => void;
  frequency: number;
  onFrequencyChange: (f: number) => void;
  noiseMultiplier: number;
  onNoiseChange: (n: number) => void;
  dropRate: number;
  onDropRateChange: (d: number) => void;
  activeChannels: {
    temp: boolean;
    ph: boolean;
    oxygen: boolean;
    pressure: boolean;
    rpm: boolean;
    speed: boolean;
    throttle: boolean;
    brake: boolean;
  };
  onToggleChannel: (channel: "temp" | "ph" | "oxygen" | "pressure" | "rpm" | "speed" | "throttle" | "brake") => void;
  mode: "biotech" | "automotive";
  onModeChange: (m: "biotech" | "automotive") => void;
}

export function ControlPanel({
  isConnected,
  onToggleConnection,
  frequency,
  onFrequencyChange,
  noiseMultiplier,
  onNoiseChange,
  dropRate,
  onDropRateChange,
  activeChannels,
  onToggleChannel,
  mode,
  onModeChange,
}: ControlPanelProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card className="h-full">
      <CardHeader>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
          System Controller
        </span>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded border border-border-custom hover:bg-bg-primary text-[10px] font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary transition cursor-pointer"
          title="Toggle Theme"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Toggle Mode Segmented Buttons */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            Telemetry Mode
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-bg-primary rounded border border-border-custom">
            <button
              onClick={() => onModeChange("biotech")}
              className={`py-1.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider transition cursor-pointer ${
                mode === "biotech"
                  ? "bg-bg-secondary text-brand-primary shadow-sm border border-border-custom/50"
                  : "text-text-secondary/70 hover:text-text-primary"
              }`}
            >
              🔬 Biotech
            </button>
            <button
              onClick={() => onModeChange("automotive")}
              className={`py-1.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider transition cursor-pointer ${
                mode === "automotive"
                  ? "bg-bg-secondary text-brand-secondary shadow-sm border border-border-custom/50"
                  : "text-text-secondary/70 hover:text-text-primary"
              }`}
            >
              🏎️ Automotive
            </button>
          </div>
        </div>

        {/* Connection Toggle */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            MCU Connection Link
          </label>
          <button
            onClick={onToggleConnection}
            className={`w-full py-2.5 px-4 rounded font-mono font-bold uppercase tracking-widest text-xs border transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
              isConnected
                ? "bg-brand-success/10 border-brand-success text-brand-success shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:bg-brand-success/20"
                : "bg-brand-danger/10 border-brand-danger text-brand-danger hover:bg-brand-danger/20"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-brand-success animate-pulse" : "bg-brand-danger"
              }`}
            />
            <span>{isConnected ? "Connected / Active" : "Disconnected / Offline"}</span>
          </button>
        </div>

        {/* Scan Frequency */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            <span>Scan Frequency</span>
            <span className="font-bold text-text-primary">{frequency} Hz</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={frequency}
            disabled={!isConnected}
            onChange={(e) => onFrequencyChange(Number(e.target.value))}
            className="w-full h-1.5 bg-border-custom rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Telemetry Noise */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            <span>Telemetry Noise</span>
            <span className="font-bold text-text-primary">{(noiseMultiplier * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={noiseMultiplier}
            disabled={!isConnected}
            onChange={(e) => onNoiseChange(Number(e.target.value))}
            className="w-full h-1.5 bg-border-custom rounded-lg appearance-none cursor-pointer accent-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Simulated Packet Loss */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            <span>Simulated Frame Loss</span>
            <span className="font-bold text-brand-danger font-readout">{(dropRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.3"
            step="0.05"
            value={dropRate}
            disabled={!isConnected}
            onChange={(e) => onDropRateChange(Number(e.target.value))}
            className="w-full h-1.5 bg-border-custom rounded-lg appearance-none cursor-pointer accent-brand-danger disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[7px] font-mono text-text-secondary/50">
            <span>0% (Lossless)</span>
            <span>15%</span>
            <span>30% (High Loss)</span>
          </div>
        </div>

        {/* Active Channels Selectors */}
        <div className="space-y-3 pt-2 border-t border-border-custom">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            Diagnostic Channels
          </label>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {mode === "biotech" ? (
              // Biotech Channels
              (["temp", "ph", "oxygen", "pressure"] as const).map((channel) => {
                const label =
                  channel === "temp"
                    ? "Ch 1: Temperature"
                    : channel === "ph"
                    ? "Ch 2: Acidity (pH)"
                    : channel === "oxygen"
                    ? "Ch 3: Oxygen"
                    : "Ch 4: Pressure";
                
                return (
                  <button
                    key={channel}
                    disabled={!isConnected}
                    onClick={() => onToggleChannel(channel)}
                    className={`w-full text-left py-1.5 px-3 rounded border font-mono text-[9px] flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeChannels[channel] && isConnected
                        ? "bg-bg-primary border-brand-primary/40 text-text-primary"
                        : "bg-bg-primary/20 border-border-custom/50 text-text-secondary/50"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        activeChannels[channel] && isConnected
                          ? "bg-brand-primary shadow-[0_0_6px_rgba(0,245,212,0.6)]"
                          : "bg-text-secondary/20"
                      }`}
                    />
                  </button>
                );
              })
            ) : (
              // Automotive Channels
              (["rpm", "speed", "throttle", "brake"] as const).map((channel) => {
                const label =
                  channel === "rpm"
                    ? "Engine Tach (RPM)"
                    : channel === "speed"
                    ? "Vehicle Speed (km/h)"
                    : channel === "throttle"
                    ? "Throttle Pedal (%)"
                    : "Brake Pedal (%)";
                
                return (
                  <button
                    key={channel}
                    disabled={!isConnected}
                    onClick={() => onToggleChannel(channel)}
                    className={`w-full text-left py-1.5 px-3 rounded border font-mono text-[9px] flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeChannels[channel] && isConnected
                        ? "bg-bg-primary border-brand-secondary/40 text-text-primary"
                        : "bg-bg-primary/20 border-border-custom/50 text-text-secondary/50"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        activeChannels[channel] && isConnected
                          ? "bg-brand-secondary shadow-[0_0_6px_rgba(56,189,248,0.6)]"
                          : "bg-text-secondary/20"
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
