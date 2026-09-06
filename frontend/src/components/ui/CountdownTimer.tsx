"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds = 2340,
  onExpire,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      if (onExpire) onExpire();
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = mins < 15;

  return (
    <div className="rounded-lg bg-slate-50/80 border border-slate-200/90 p-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span className="uppercase tracking-wide text-[11px] font-bold text-slate-600">Golden Window Interdiction</span>
        </div>
        {isUrgent && (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            CRITICAL ESCAPE RISK
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between pt-0.5">
        <div className="font-mono text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
          <span className={isUrgent ? "text-rose-600 font-extrabold" : "text-slate-900 font-extrabold"}>
            {String(mins).padStart(2, "0")}m
          </span>
          <span className="text-slate-400 font-light">:</span>
          <span className={isUrgent ? "text-rose-600 font-extrabold" : "text-slate-900 font-extrabold"}>
            {String(secs).padStart(2, "0")}s
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Estimated ATM arrival window</span>
      </div>

      {/* Clean Micro-bar Progress */}
      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-0.5">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${
            isUrgent ? "bg-rose-500" : "bg-blue-600"
          }`}
          style={{ width: `${Math.min(100, (seconds / 2700) * 100)}%` }}
        />
      </div>
    </div>
  );
};
