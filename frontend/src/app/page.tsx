"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CommandCenter } from "@/components/views/CommandCenter";
import { CaseDeepDive } from "@/components/views/CaseDeepDive";
import { ATMSimulator } from "@/components/views/ATMSimulator";
import { LedgerExplorer } from "@/components/views/LedgerExplorer";
import { Shield, CheckCircle, Cpu } from "lucide-react";

export interface AuditRecord {
  blockNumber: number;
  event: string;
  caseId: string;
  signer: string;
  agency: string;
  txHash: string;
  timestamp: string;
  slaDuration: string;
  details?: string;
}

function getInitialAuditRecords(): AuditRecord[] {
  const now = new Date();
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " IST";

  const t0 = new Date(now.getTime() - 110 * 1000); // ~2m ago
  const t1 = new Date(now.getTime() - 60 * 1000);  // ~1m ago
  const t2 = new Date(now.getTime() - 15 * 1000);  // 15s ago

  return [
    {
      blockNumber: 1045,
      event: "INTER_BANK_FREEZE",
      caseId: "CASE_26184_PUN_042",
      signer: "NPCI_CONSORTIUM_NODE",
      agency: "NPCI Banking Switch Gateway",
      txHash: "0x8f3e21a4e5108b981d34e9102ca8b14e9f7321045b1945de21b4a098ec7124e9fa",
      timestamp: formatTime(t2),
      slaDuration: "380ms",
      details: "Automated debit hold placed on flagged mule account across member banks (SBI, HDFC)."
    },
    {
      blockNumber: 1044,
      event: "AI_ATM_TARGET_PREDICTED",
      caseId: "CASE_26184_PUN_042",
      signer: "I4C_SPATIAL_AI_NODE",
      agency: "PRATYAKSH XGBoost Geospatial Engine",
      txHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      timestamp: formatTime(t1),
      slaDuration: "Instant (<1.2s)",
      details: "SBI ATM flagged with 82% cashout probability (Distance: 800m, ETA: 8m)."
    },
    {
      blockNumber: 1043,
      event: "1930_INCIDENT_INGESTED",
      caseId: "CASE_26184_PUN_042",
      signer: "MHA_1930_NODAL_DESK",
      agency: "1930 National Cybercrime Helpline",
      txHash: "0x4b1fa3d677284addd200126d90697f83b1657ff1fc53b92dc18148a1d65dfc2d",
      timestamp: formatTime(t0),
      slaDuration: "Trigger Point",
      details: "Citizen complaint for ₹1,50,000 ingested. Suspect cell triangulation active."
    }
  ];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"command" | "deepdive" | "atm" | "ledger">("command");
  
  // Real-Time Dynamic Shared Audit Ledger
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(getInitialAuditRecords);

  const handleAddAuditRecord = (event: string, agency: string, details: string, caseId?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " IST";
    const randHex = Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    setAuditRecords((prev) => [
      {
        blockNumber: 1045 + (prev.length > 0 ? prev[0].blockNumber - 1044 : 1),
        event,
        caseId: caseId || "CASE_26184_PUN_042",
        signer: agency.toUpperCase().replace(/\s+/g, "_").slice(0, 24),
        agency,
        txHash: "0x" + randHex,
        timestamp: timeStr,
        slaDuration: "< 400ms",
        details,
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Light Technical Editorial Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Command Dashboard Canvas */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 md:p-5">
        {activeTab === "command" && <CommandCenter onAddAuditRecord={handleAddAuditRecord} />}
        {activeTab === "deepdive" && <CaseDeepDive />}
        {activeTab === "atm" && <ATMSimulator onAddAuditRecord={handleAddAuditRecord} />}
        {activeTab === "ledger" && <LedgerExplorer auditRecords={auditRecords} />}
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
