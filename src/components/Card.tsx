import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function Card({ children, className = "", glow = false, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      className={`bg-bg-secondary border border-border-custom rounded-lg overflow-hidden transition-all duration-300 ${
        glow ? "glow-border" : "hover:border-brand-primary/40 shadow-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function CardHeader({ children, className = "", ref, ...props }: CardHeaderProps) {
  return (
    <div
      ref={ref}
      className={`px-4 py-3 border-b border-border-custom bg-bg-primary/50 flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function CardContent({ children, className = "", ref, ...props }: CardContentProps) {
  return (
    <div ref={ref} className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
