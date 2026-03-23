import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { type Toast, useToast } from "../contexts/ToastContext";

function ToastItem({
  toast,
  onRemove,
}: { toast: Toast; onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 100 / (toast.duration / 100)));
    }, 100);
    return () => clearInterval(interval);
  }, [toast.duration]);

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };

  const progressColors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`glass-card rounded-xl p-4 min-w-72 max-w-sm shadow-glass-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <p className="flex-1 text-sm font-medium text-foreground">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-2 h-0.5 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColors[toast.type]} transition-all duration-100`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
