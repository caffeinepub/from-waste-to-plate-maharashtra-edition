import React from "react";

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-3 w-48 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-3 w-3/4 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 h-9 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}
