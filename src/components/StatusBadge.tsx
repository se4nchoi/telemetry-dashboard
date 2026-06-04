import React from "react";

export type BadgeStatus = "success" | "warning" | "danger" | "info" | "offline";

interface StatusBadgeProps {
  status: BadgeStatus;
  text: string;
  className?: string;
}

export function StatusBadge({ status, text, className = "" }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "success":
        return {
          bg: "bg-brand-success/10 border-brand-success/30 text-brand-success",
          dot: "bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.5)]",
        };
      case "warning":
        return {
          bg: "bg-brand-warning/10 border-brand-warning/30 text-brand-warning",
          dot: "bg-brand-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]",
        };
      case "danger":
        return {
          bg: "bg-brand-danger/10 border-brand-danger/30 text-brand-danger",
          dot: "bg-brand-danger shadow-[0_0_8px_rgba(244,63,94,0.5)]",
        };
      case "info":
        return {
          bg: "bg-brand-primary/10 border-brand-primary/30 text-brand-primary",
          dot: "bg-brand-primary shadow-[0_0_8px_rgba(0,245,212,0.5)]",
        };
      case "offline":
      default:
        return {
          bg: "bg-text-secondary/10 border-text-secondary/20 text-text-secondary/60",
          dot: "bg-text-secondary/40",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${styles.bg} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status !== "offline" && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${styles.dot}`} />
      </span>
      <span>{text}</span>
    </div>
  );
}
