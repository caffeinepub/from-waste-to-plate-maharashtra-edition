import { cn } from "@/lib/utils";
import type React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = false,
  onClick,
}: GlassCardProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "glass-card rounded-2xl p-6 w-full text-left",
          hover &&
            "transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg",
          className,
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-6",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
