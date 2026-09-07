"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Radio,
  Network,
  Boxes,
  Activity,
  Terminal,
  Volume2,
  VolumeX,
} from "lucide-react";
import clsx from "clsx";

interface NavbarProps {
  activeTab: "command" | "deepdive" | "atm" | "ledger";
  onTabChange: (tab: "command" | "deepdive" | "atm" | "ledger") => void;
  threatLevel?: "CRITICAL" | "HIGH" | "ELEVATED";
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [timeIST, setTimeIST] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeIST(
        now.toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: "command" as const, label: "Command Center", icon: Radio, sub: "Live Map & Suspect Tracking" },
    { id: "deepdive" as const, label: "Case Deep-Dive", icon: Network, sub: "Money Trail & AI Reasoning" },
    { id: "atm" as const, label: "Cashout Defense", icon: Terminal, sub: "Omni-Channel Simulator" },
    { id: "ledger" as const, label: "Audit Ledger", icon: Boxes, sub: "Inter-Bank Freeze Network" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Authority Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-md bg-slate-900 text-white shadow-sm">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                PRATYAKSH
              </h1>
              <span className="text-[10px] text-slate-700 font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                SIH 26184
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Predictive Cash-Out Intelligence &bull; Ministry of Home Affairs / I4C
            </p>
          </div>
        </div>

        {/* Tab Navigation Controls (Segmented Control Aesthetic) */}
        <nav className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={clsx(
                  "relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  isActive
                    ? "bg-white text-slate-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-blue-600" : "text-slate-500")} />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[9px] text-slate-500 font-normal">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* System Telemetry & Clock */}
        <div className="flex items-center gap-2.5">
          {/* Audio Alert Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Audible Alerts Active" : "Audible Alerts Muted"}
            className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer focus-visible:outline-none shadow-sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Inter-Bank Network Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-mono font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
            </span>
            <span>INTER-BANK GRID: 5 BANKS LINKED</span>
          </div>

          {/* System Clock */}
          <div className="px-2.5 py-1 rounded-md border border-slate-200 bg-white shadow-sm text-right">
            <div className="text-xs font-mono font-semibold text-slate-800">{timeIST || "10:04:12 IST"}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
