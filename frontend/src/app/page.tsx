"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CommandCenter } from "@/components/views/CommandCenter";
import { CaseDeepDive } from "@/components/views/CaseDeepDive";
import { ATMSimulator } from "@/components/views/ATMSimulator";
import { LedgerExplorer } from "@/components/views/LedgerExplorer";
import { Shield, CheckCircle, Cpu } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"command" | "deepdive" | "atm" | "ledger">("command");

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Light Technical Editorial Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Command Dashboard Canvas */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 md:p-5">
        {activeTab === "command" && <CommandCenter />}
        {activeTab === "deepdive" && <CaseDeepDive />}
        {activeTab === "atm" && <ATMSimulator />}
        {activeTab === "ledger" && <LedgerExplorer />}
      </main>

      {/* Enterprise Editorial Status Footer */}
      <footer className="w-full bg-white border-t border-slate-200/90 px-5 py-3 text-xs font-mono text-slate-500 mt-auto">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>PRATYAKSH ENTERPRISE CORE v2.4</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">SIH Problem Statement: 26184</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Ministry of Home Affairs &bull; I4C CIS Division</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              NPCI Switch Gate: Connected
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Cpu className="w-3 h-3 text-blue-600" />
              OSM Positron Engine: Online
            </span>
            <span className="text-slate-400">
              Authorized Cyber Defense Access Only
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
