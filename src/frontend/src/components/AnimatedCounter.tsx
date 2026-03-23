import type React from "react";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  duration?: number;
  formatNumber?: (n: number) => string;
}

export function AnimatedCounter({
  target,
  label,
  icon,
  suffix = "",
  duration = 2000,
  formatNumber,
}: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  const displayValue = formatNumber
    ? formatNumber(current)
    : current.toLocaleString("en-IN");

  return (
    <div className="text-center animate-fade-in-up">
      <div className="flex justify-center mb-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold font-display text-foreground">
        {displayValue}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1 font-medium">
        {label}
      </div>
    </div>
  );
}
