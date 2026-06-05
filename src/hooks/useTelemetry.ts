"use client";

import { useState, useEffect, useRef } from "react";
import { BadgeStatus } from "@/components/StatusBadge";
import { getStats } from "@/utils/telemetryHelpers";

export interface LogEntry {
  id: string;
  time: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
}

interface TelemetryMetrics {
  temp: number;
  ph: number;
  oxygen: number;
  pressure: number;
  // Automotive metrics
  rpm: number;
  speed: number;
  throttle: number;
  brake: number;
}

interface TelemetryHistory {
  temp: number[];
  ph: number[];
  oxygen: number[];
  pressure: number[];
  // Automotive history
  rpm: number[];
  speed: number[];
  throttle: number[];
  brake: number[];
}

export function useTelemetry() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<number>(10); // Hz
  const [noiseMultiplier, setNoiseMultiplier] = useState<number>(0.15); // Noise
  const [dropRate, setDropRate] = useState<number>(0.0); // Packet drop rate (0.0 to 0.3)
  const [missedPacketsCount, setMissedPacketsCount] = useState<number>(0);
  const [totalPacketsCount, setTotalPacketsCount] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [activeChannels, setActiveChannels] = useState({
    temp: true,
    ph: true,
    oxygen: true,
    pressure: true,
    // Automotive controls
    rpm: true,
    speed: true,
    throttle: true,
    brake: true,
  });

  const [state, setState] = useState<{
    metrics: TelemetryMetrics;
    history: TelemetryHistory;
  }>({
    metrics: {
      temp: 37.0,
      ph: 7.40,
      oxygen: 95.0,
      pressure: 120.0,
      rpm: 1200,
      speed: 0,
      throttle: 0,
      brake: 0,
    },
    history: {
      temp: Array(50).fill(37.0),
      ph: Array(50).fill(7.40),
      oxygen: Array(50).fill(95.0),
      pressure: Array(50).fill(120.0),
      rpm: Array(50).fill(1200),
      speed: Array(50).fill(0),
      throttle: Array(50).fill(0),
      brake: Array(50).fill(0),
    },
  });

  const { metrics, history } = state;

  // Keep references to refs to avoid resetting the simulation loop on slider updates
  const frequencyRef = useRef(frequency);
  const noiseMultiplierRef = useRef(noiseMultiplier);
  const dropRateRef = useRef(dropRate);
  const activeChannelsRef = useRef(activeChannels);
  const timeRef = useRef(0);
  const lastPacketIdRef = useRef<number | null>(null);
  const packetIdRef = useRef(0);

  useEffect(() => {
    frequencyRef.current = frequency;
  }, [frequency]);

  useEffect(() => {
    noiseMultiplierRef.current = noiseMultiplier;
  }, [noiseMultiplier]);

  useEffect(() => {
    dropRateRef.current = dropRate;
  }, [dropRate]);

  useEffect(() => {
    activeChannelsRef.current = activeChannels;
  }, [activeChannels]);

  // Log helper function
  const addLog = (type: LogEntry["type"], message: string) => {
    const timeString = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    } as any);

    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      time: timeString,
      type,
      message,
    };

    setLogs((prev) => [newEntry, ...prev.slice(0, 99)]); // Cap at 100 entries
  };

  // Log system initialization
  useEffect(() => {
    addLog("info", "System diagnostics logs terminal active.");
    addLog("success", "Connection module loaded. Awaiting stream.");
  }, []);

  // Monitor connection states
  useEffect(() => {
    if (isConnected) {
      addLog("info", "Link established: STM32_MCU_MOCK streaming active.");
    } else {
      addLog("warning", "Link severed: telemetry connection interrupted.");
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    let intervalId: NodeJS.Timeout;

    const runSimulation = () => {
      // 1. Generate packet ID
      packetIdRef.current += 1;
      const packetId = packetIdRef.current;
      setTotalPacketsCount((c) => c + 1);

      // 2. Roll for packet drop simulation
      if (Math.random() < dropRateRef.current) {
        // Drop packet: skip state updates, but increment packet ID
        // The next successful packet will detect the gap
        const ms = 1000 / frequencyRef.current;
        intervalId = setTimeout(runSimulation, ms);
        return;
      }

      timeRef.current += 0.05;
      const t = timeRef.current;
      const noise = noiseMultiplierRef.current;
      const ch = activeChannelsRef.current;

      // Check for sequence gap / dropped packets
      if (lastPacketIdRef.current !== null && packetId !== lastPacketIdRef.current + 1) {
        const gap = packetId - lastPacketIdRef.current - 1;
        setMissedPacketsCount((c) => c + gap);
        addLog(
          "error",
          `CRITICAL // Sequence gap detected: expected packet #${lastPacketIdRef.current + 1}, received #${packetId} (${gap} frames lost)`
        );
      }
      lastPacketIdRef.current = packetId;

      setState((prev) => {
        const prevMetrics = prev.metrics;
        const prevHistory = prev.history;

        // --- Biotech Simulation ---
        // Temperature: slow thermal drift
        const baseTemp = 37.0;
        const tempDrift = 1.2 * Math.sin(t * 0.1);
        const tempNoise = noise * (Math.random() - 0.5) * 0.8;
        const nextTemp = ch.temp ? baseTemp + tempDrift + tempNoise : prevMetrics.temp;

        // pH Level: slow metabolic acid drift
        const basePh = 7.40;
        const phDrift = 0.08 * Math.sin(t * 0.05 + 1.0);
        const phNoise = noise * (Math.random() - 0.5) * 0.05;
        const nextPh = ch.ph ? basePh + phDrift + phNoise : prevMetrics.ph;

        // Dissolved Oxygen: depletion sine wave
        const baseOxygen = 95.0;
        const oxyDrift = 4.0 * Math.sin(t * 0.08 + 2.0);
        const oxyNoise = noise * (Math.random() - 0.5) * 1.5;
        const nextOxygen = ch.oxygen ? baseOxygen + oxyDrift + oxyNoise : prevMetrics.oxygen;

        // Chamber Pressure: pump cycle
        const basePressure = 120.0;
        const pressCycle = 15.0 * Math.sin(t * 2.5);
        const pressNoise = noise * (Math.random() - 0.5) * 4.0;
        const nextPressure = ch.pressure ? basePressure + pressCycle + pressNoise : prevMetrics.pressure;

        // --- Automotive Simulation ---
        // Throttle and brake driver input pedal loops
        // Ramps throttle up, then coasts/brakes, periodically
        const throttleCycle = Math.max(0, 80 * Math.sin(t * 0.2) + 20 * Math.sin(t * 0.8));
        const nextThrottle = ch.throttle ? Math.max(0, Math.min(100, throttleCycle)) : 0;
        
        const nextBrake = ch.brake && nextThrottle < 10 
          ? Math.max(0, Math.min(80, 50 * Math.sin(t * 0.2 + Math.PI)))
          : 0;

        // RPM: responds to throttle inputs, drops on virtual "gear shifts"
        let baseRpm = 1000 + (nextThrottle * 60);
        // Simulate 5-speed gear shifts based on sinusoidal time cycles
        const virtualGear = Math.floor((t % 20) / 4) + 1; // 1 to 5
        const gearRpmModifier = 1 - (virtualGear * 0.12) + (0.05 * Math.sin(t * 4));
        const targetRpm = (baseRpm * 1.2 * gearRpmModifier);
        const rpmNoise = noise * (Math.random() - 0.5) * 180;
        const nextRpm = ch.rpm ? Math.max(800, Math.min(8000, targetRpm + rpmNoise)) : 1000;

        // Speed: integrates throttle over time, drops slowly on braking
        const speedFactor = virtualGear * 35;
        const targetSpeed = (nextThrottle / 100) * speedFactor;
        const speedNoise = noise * (Math.random() - 0.5) * 3.0;
        const speedLag = 0.95; // speed inertia
        const nextSpeed = ch.speed 
          ? Math.max(0, Math.min(240, prevMetrics.speed * speedLag + targetSpeed * (1 - speedLag) - (nextBrake * 0.1) + speedNoise))
          : 0;

        // --- Log threshold warnings dynamically (throttled/periodic) ---
        if (packetId % 60 === 0) { // check every ~60 packets
          if (nextTemp > 38.0) addLog("warning", `Biochemical WARNING // Bioreactor temperature elevated: ${nextTemp.toFixed(1)}°C`);
          if (nextPh < 7.30) addLog("warning", `Biochemical WARNING // Acidity levels elevated: pH ${nextPh.toFixed(2)}`);
          if (nextRpm > 6500) addLog("warning", `Automotive WARNING // Engine redline threshold: ${nextRpm.toFixed(0)} RPM`);
        }

        const updateBuffer = (buffer: number[], val: number) => {
          return [...buffer.slice(1), val];
        };

        return {
          metrics: {
            temp: nextTemp,
            ph: nextPh,
            oxygen: nextOxygen,
            pressure: nextPressure,
            rpm: nextRpm,
            speed: nextSpeed,
            throttle: nextThrottle,
            brake: nextBrake,
          },
          history: {
            temp: updateBuffer(prevHistory.temp, nextTemp),
            ph: updateBuffer(prevHistory.ph, nextPh),
            oxygen: updateBuffer(prevHistory.oxygen, nextOxygen),
            pressure: updateBuffer(prevHistory.pressure, nextPressure),
            rpm: updateBuffer(prevHistory.rpm, nextRpm),
            speed: updateBuffer(prevHistory.speed, nextSpeed),
            throttle: updateBuffer(prevHistory.throttle, nextThrottle),
            brake: updateBuffer(prevHistory.brake, nextBrake),
          },
        };
      });

      const ms = 1000 / frequencyRef.current;
      intervalId = setTimeout(runSimulation, ms);
    };

    intervalId = setTimeout(runSimulation, 1000 / frequency);

    return () => clearTimeout(intervalId);
  }, [isConnected, frequency]);

  const toggleConnection = () => {
    setIsConnected((prev) => !prev);
  };

  const toggleChannel = (channel: keyof typeof activeChannels) => {
    setActiveChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
    addLog("info", `Diagnostic channel toggled: ${String(channel).toUpperCase()} is now ${!activeChannels[channel] ? "ACTIVE" : "MUTED"}`);
  };



  const getChannelStatus = (
    channel: "temp" | "ph" | "oxygen" | "pressure" | "rpm" | "speed" | "throttle" | "brake",
    val: number
  ): { status: BadgeStatus; text: string } => {
    if (!isConnected) return { status: "offline", text: "OFFLINE" };
    if (!activeChannels[channel]) return { status: "offline", text: "MUTED" };

    switch (channel) {
      case "temp":
        if (val > 38.8 || val < 35.5) return { status: "danger", text: "CRITICAL" };
        if (val > 38.0 || val < 36.2) return { status: "warning", text: "WARNING" };
        return { status: "success", text: "NOMINAL" };
      case "ph":
        if (val > 7.55 || val < 7.25) return { status: "danger", text: "CRITICAL" };
        if (val > 7.48 || val < 7.32) return { status: "warning", text: "WARNING" };
        return { status: "success", text: "NOMINAL" };
      case "oxygen":
        if (val < 86.0 || val > 103.0) return { status: "danger", text: "HYPOXIA" };
        if (val < 91.0) return { status: "warning", text: "MUTATION" };
        return { status: "success", text: "SATURATED" };
      case "pressure":
        if (val > 142.0 || val < 98.0) return { status: "danger", text: "SYS OVER" };
        if (val > 135.0 || val < 105.0) return { status: "warning", text: "SYS HIGH" };
        return { status: "success", text: "STABLE" };
      case "rpm":
        if (val > 6800) return { status: "danger", text: "REDLINE" };
        if (val > 5500) return { status: "warning", text: "HIGH RPM" };
        return { status: "success", text: "ACTIVE" };
      case "speed":
        if (val > 180) return { status: "danger", text: "OVER SPEED" };
        if (val > 120) return { status: "warning", text: "HIGH SPEED" };
        return { status: "success", text: "STABLE" };
      case "throttle":
        return { status: "info", text: `${val.toFixed(0)}% THR` };
      case "brake":
        return { status: val > 5 ? "warning" : "success", text: val > 0 ? `${val.toFixed(0)}% BRK` : "STBY" };
      default:
        return { status: "info", text: "OK" };
    }
  };

  return {
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
    addLog,
  };
}
