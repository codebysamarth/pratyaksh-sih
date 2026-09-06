"use client";

import React from "react";
import {
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { MOCK_BLOCKS } from "@/lib/mockData";

export const LedgerExplorer: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* Header Banner (Editorial Style) */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Consortium Blockchain Explorer & Inter-Agency SLA Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Permissioned private ledger shared between <b>MHA-I4C</b>, <b>Scheduled Commercial Banks (NPCI)</b>, and <b>State Police Control Nodes</b>.
          </p>
        </div>

        {/* DPDP Act 2023 & Section 63 BSA Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            DPDP ACT 2023: ZERO PII ON-CHAIN
          </span>
          <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            SECTION 63 BSA 2023 COMPLIANT
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Inter-Agency Response SLA Tracker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Inter-Agency Response SLA Tracker
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SLA COMPLIANT
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Eliminating the inter-agency blame game: Every alert dispatch, bank freeze, and police patrol acknowledgment is cryptographically anchored.
            </p>

            {/* Total Window Highlight Card */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 flex flex-col gap-1.5">
              <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
                <span>TOTAL INTERDICTION WINDOW:</span>
                <span className="text-emerald-700 font-bold">⏱️ 2m 30s</span>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                WELL INSIDE 45-MIN GOLDEN WINDOW
              </div>
              <div className="text-[11px] text-slate-500">
                Intervention accomplished <b>22 minutes before</b> scheduled ATM cash dispensing.
              </div>
            </div>

            {/* SLA Stepper Timeline with Checkmarks */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="p-3 rounded-md bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-900 font-semibold">1. 1930 / I4C Predictive Alert Ingested</div>
                    <div className="text-[10px] text-slate-500 font-mono">10:06:12 IST &bull; Machine-to-Machine</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-blue-700 font-bold">0.00s</div>
                  <div className="text-[10px] text-slate-400">Trigger Point</div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-900 font-semibold">2. Bank Switch Smart Lien Freeze</div>
                    <div className="text-[10px] text-slate-500 font-mono">10:07:05 IST &bull; SBI / HDFC Switch Node</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-emerald-700 font-bold">+53 seconds</div>
                  <div className="text-[10px] text-emerald-600">&lt; 3m Target (PASS)</div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-900 font-semibold">3. Police Beat Patrol Acknowledged</div>
                    <div className="text-[10px] text-slate-500 font-mono">10:08:42 IST &bull; Pune PCR Van 18</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-emerald-700 font-bold">+1m 37s</div>
                  <div className="text-[10px] text-emerald-600">&lt; 5m Target (PASS)</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Ultra-Clean Fintech Transaction Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Consortium Block Stream
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>BLOCK HEIGHT: #1043</span>
              </div>
            </div>

            {/* Ultra-Clean Table with Subtle Alternating Rows */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">BLOCK</th>
                    <th className="py-2.5 px-3 font-semibold">EVENT</th>
                    <th className="py-2.5 px-3 font-semibold">SIGNER AGENCY</th>
                    <th className="py-2.5 px-3 font-semibold">TIMESTAMP</th>
                    <th className="py-2.5 px-3 font-semibold text-right">TX HASH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_BLOCKS.map((block, idx) => (
                    <tr
                      key={block.blockNumber}
                      className={idx % 2 === 0 ? "bg-white hover:bg-slate-50/70" : "bg-slate-50/40 hover:bg-slate-50/70"}
                    >
                      <td className="py-3 px-3 font-bold text-slate-900">#{block.blockNumber}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            block.event === "LIEN_MARKED"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : block.event === "ALERT_ISSUED"
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : "bg-slate-100 border-slate-200 text-slate-800"
                          }`}
                        >
                          {block.event}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-sans">{block.agency}</td>
                      <td className="py-3 px-3 text-slate-500">{block.timestamp}</td>
                      <td className="py-3 px-3 text-right text-blue-600 hover:underline cursor-pointer">
                        {block.txHash.slice(0, 10)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Privacy Architecture Callout */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold font-mono">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Privacy Preservation (DPDP Act 2023):</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Raw citizen bank account numbers, customer names, and phone numbers are never broadcast on the consortium chain. Only one-way SHA-256 state hashes and cryptographically signed lien authorizations are anchored, strictly guaranteeing compliance with the <b>Digital Personal Data Protection Act 2023</b>.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
