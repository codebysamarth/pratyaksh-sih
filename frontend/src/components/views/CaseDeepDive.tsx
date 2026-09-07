"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  CheckCircle2,
  BrainCircuit,
  Split,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { MOCK_SHAP_FACTORS } from "@/lib/mockData";

export const CaseDeepDive: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<"A" | "B" | "C">("B");
  const [batchFreezeActive, setBatchFreezeActive] = useState(true);

  const handleDownload65B = async () => {
    setDownloading(true);
    try {
      const response = await fetch("http://localhost:8000/api/export-section65b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: "CASE_26184_PUN_042",
          victim_name: "Dr. Arvind S. Kulkarni",
          amount: 350000,
          location_name: "VIT Pune, Bibwewadi",
          predicted_atms: [
            {
              rank: 1,
              name: "SBI ATM - VIT College Gate",
              bank: "State Bank of India",
              lat: 18.4636,
              lon: 73.8682,
              distance_km: 0.8,
              travel_time_mins: 8,
              risk_probability: 82,
              top_reasons: ["Cellular BTS tower proximity (<800m)", "Primary road transit funnel"],
            },
            {
              rank: 2,
              name: "HDFC Bank ATM - Bibwewadi",
              bank: "HDFC Bank",
              lat: 18.4610,
              lon: 73.8715,
              distance_km: 1.4,
              travel_time_mins: 14,
              risk_probability: 13,
              top_reasons: ["Branch-attached 24/7 lobby", "Secondary transit corridor"],
            },
            {
              rank: 3,
              name: "Bank of Maharashtra ATM - Upper Indira Nagar",
              bank: "Bank of Maharashtra",
              lat: 18.4675,
              lon: 73.8620,
              distance_km: 2.1,
              travel_time_mins: 18,
              risk_probability: 5,
              top_reasons: ["Alternative escape route corridor"],
            },
          ],
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "PRATYAKSH_SECTION_65B_LEGAL_EVIDENCE_#26184-PUN.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadSuccess(true);
      } else {
        throw new Error("PDF download failed");
      }
    } catch (err) {
      console.warn("PDF generation error, fallback triggered:", err);
      // Fallback text certificate
      const fallbackBlob = new Blob(["CERTIFICATE UNDER SECTION 65B INDIAN EVIDENCE ACT / SECTION 63 BSA 2023\nCase: CASE_26184_PUN_042\nTarget ATM: SBI ATM VIT Gate\nBlock Ref: #1042"], { type: "text/plain" });
      const fallbackUrl = URL.createObjectURL(fallbackBlob);
      const a = document.createElement("a");
      a.href = fallbackUrl;
      a.download = "PRATYAKSH_SECTION_65B_CERTIFICATE.txt";
      a.click();
      URL.revokeObjectURL(fallbackUrl);
      setDownloadSuccess(true);
    } finally {
      setDownloading(false);
    }
  };

  const chartData = [
    { name: "Proximity to IP Signal", weight: 40, color: "#2563EB" },
    { name: "Transit Travel Time", weight: 30, color: "#0284C7" },
    { name: "Historical Gang Prior", weight: 20, color: "#D97706" },
    { name: "Kiosk Isolation", weight: 10, color: "#64748B" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner (Editorial Header) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Case Deep-Dive &bull; Stolen Money Trail & AI Decision Factors
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear visual breakdown of how the stolen funds were split across bank accounts, why the AI flagged the target ATM, and court-ready electronic evidence.
          </p>
        </div>

        {/* Section 65B Document Export (Clean Navy CTA) */}
        <button
          onClick={handleDownload65B}
          disabled={downloading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Section 65B Certificate Exported</span>
            </>
          ) : downloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Certified Record...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-slate-300" />
              <span>Download Section 65B Evidence Certificate</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT (7 cols) — Stolen Money Trail Split Graph with Curved SVG Connectors */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Stolen Money Trail: Multi-Bank Account Splitting
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                SPLIT DETECTED (&gt; ₹2,00,000)
              </span>
            </div>

            <p className="text-xs text-slate-500">
              When stolen amounts exceed ₹2,00,000, fraudsters split the money across secondary accounts in different banks to bypass single-card daily ATM withdrawal limits.
            </p>

            {/* Clean Curved SVG Flow Graph */}
            <div className="relative w-full rounded-lg bg-slate-50/60 border border-slate-200/90 p-5 overflow-x-auto">
              <div className="min-w-[620px] flex items-center justify-between gap-2 relative py-4">
                {/* Node 1: Victim */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-11 h-11 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 shadow-sm">
                    <span className="font-mono text-xs font-bold">L0</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-900">Victim Account</div>
                    <div className="text-[10px] text-slate-500">Dr. Arvind K.</div>
                    <div className="text-[11px] font-mono text-slate-900 font-bold mt-0.5">₹3,50,000</div>
                  </div>
                </div>

                {/* Curved SVG Connector 1 */}
                <div className="flex-1 flex flex-col items-center px-1">
                  <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path
                      d="M 0,10 C 40,10 60,10 100,10"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  </svg>
                  <span className="text-[9px] font-mono text-slate-500 font-medium">IMPS &bull; 32s</span>
                </div>

                {/* Node 2: Layer 1 Mule */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-11 h-11 rounded-lg bg-rose-50 border border-rose-300 flex items-center justify-center text-rose-700 shadow-sm">
                    <span className="font-mono text-xs font-bold">L1</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-900">Primary Mule</div>
                    <div className="text-[10px] text-slate-500">Ramesh K. (ICICI)</div>
                    <div className="text-[11px] font-mono text-rose-700 font-bold mt-0.5">₹3,50,000 In</div>
                  </div>
                </div>

                {/* Curved SVG Connector 2 (Fan-Out) */}
                <div className="flex-1 flex flex-col items-center px-1">
                  <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <path d="M 0,30 C 40,30 60,10 100,10" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
                    <path d="M 0,30 C 40,30 60,30 100,30" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 3" />
                    <path d="M 0,30 C 40,30 60,50 100,50" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[9px] font-mono text-blue-700 font-semibold">3-Way Split</span>
                </div>

                {/* Node 3: Fan-Out Accounts (Interactive Branch Selector) */}
                <div className="flex flex-col gap-2 z-10">
                  <button
                    onClick={() => setSelectedBranch("A")}
                    className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md text-[10px] font-mono transition-all cursor-pointer shadow-xs text-left ${
                      selectedBranch === "A"
                        ? "bg-purple-50 border-2 border-purple-400 text-purple-900 font-bold"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-purple-300"
                    }`}
                  >
                    <div>
                      <span className="font-semibold">Branch A (Axis):</span>
                      <div className="text-[9px] text-emerald-700 font-bold">⚡ BATCH FROZEN</div>
                    </div>
                    <span className="text-slate-900 font-bold">₹1,20,000</span>
                  </button>

                  <button
                    onClick={() => setSelectedBranch("B")}
                    className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-all cursor-pointer shadow-xs text-left ${
                      selectedBranch === "B"
                        ? "bg-rose-50 border-2 border-rose-500 text-rose-900 font-extrabold"
                        : "bg-blue-50 border border-blue-300 text-blue-800"
                    }`}
                  >
                    <div>
                      <span className="font-bold">Branch B (SBI) &bull; TARGET:</span>
                      <div className="text-[9px] text-rose-700 font-bold">🚨 ATM EXTRACTION</div>
                    </div>
                    <span className="text-rose-900 font-extrabold">₹1,50,000 &rarr;</span>
                  </button>

                  <button
                    onClick={() => setSelectedBranch("C")}
                    className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md text-[10px] font-mono transition-all cursor-pointer shadow-xs text-left ${
                      selectedBranch === "C"
                        ? "bg-purple-50 border-2 border-purple-400 text-purple-900 font-bold"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-purple-300"
                    }`}
                  >
                    <div>
                      <span className="font-semibold">Branch C (Kotak):</span>
                      <div className="text-[9px] text-emerald-700 font-bold">⚡ BATCH FROZEN</div>
                    </div>
                    <span className="text-slate-900 font-bold">₹80,000</span>
                  </button>
                </div>

                {/* Connector 3 */}
                <div className="flex-1 flex flex-col items-center px-1">
                  <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path
                      d="M 0,10 C 40,10 60,10 100,10"
                      fill="none"
                      stroke="#E11D48"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  </svg>
                  <span className="text-[9px] font-mono text-rose-700 font-semibold">Physical Cash-Out</span>
                </div>

                {/* Node 4: Target ATM Hotspot */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-12 h-12 rounded-lg bg-rose-50 border-2 border-rose-500 flex flex-col items-center justify-center text-rose-700 shadow-md">
                    <span className="font-mono text-[10px] font-bold">ATM #1</span>
                    <span className="text-[9px] font-mono text-rose-900 font-extrabold">82% RISK</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-900">SBI ATM Kiosk</div>
                    <div className="text-[10px] text-slate-500">VIT College Gate</div>
                    <div className="text-[10px] font-mono text-blue-700 font-semibold mt-0.5">ETA: 8 mins</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Branch Interdiction Inspector Box */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>
                    {selectedBranch === "B"
                      ? "Branch B (SBI) — Physical ATM Cashout Target"
                      : selectedBranch === "A"
                      ? "Branch A (Axis Bank) — Secondary Digital Account"
                      : "Branch C (Kotak Bank) — Secondary Digital Account"}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    selectedBranch === "B"
                      ? "text-rose-700 bg-rose-50 border-rose-200"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200"
                  }`}
                >
                  {selectedBranch === "B" ? "PHYSICAL INTERCEPTION (ATM + BEAT POLICE)" : "INSTANT INTER-BANK FREEZE ACTIVE"}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed">
                {selectedBranch === "B" ? (
                  <>
                    <b>Why Branch B is Targeted:</b> Suspect handset was triangulated moving along the Bibwewadi road corridor toward <b>SBI ATM VIT Gate</b>. PRATYAKSH has dispatched <b>PCR Van 18</b> to intercept the runner on-site while the automated bank hold locks the dispenser shutter.
                  </>
                ) : selectedBranch === "A" ? (
                  <>
                    <b>What Happens to Branch A (₹1,20,000):</b> While ground police intercept Branch B at the ATM, PRATYAKSH automatically triggers an <b>Inter-Bank Batch Freeze</b> targeting Sunil B.&apos;s Axis account. Funds are locked at the NPCI banking switch within 380ms, preventing crypto purchase or further transfers.
                  </>
                ) : (
                  <>
                    <b>What Happens to Branch C (₹80,000):</b> Simultaneously frozen via the inter-bank network. Debit rights on Vijay P.&apos;s Kotak account are revoked across all UPI, IMPS, and NEFT gateways before any secondary cashout can occur.
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500 border-t border-slate-200">
                <span>Inter-Bank Protection: <b>100% of Defrauded Funds Secured</b></span>
                <span className="text-blue-700 font-bold">Zero Fund Leakage</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT (5 cols) — AI Decision Factors Bar Chart */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Why AI Selected This Specific ATM (Decision Factors)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                GEOSPATIAL AI
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Key factors evaluated by the predictive model to determine why this ATM is the highest-probability cashout target:
            </p>

            {/* Minimalist Horizontal Bar Chart */}
            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 50]} unit="%" tick={{ fill: "#64748B", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#334155", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      color: "#0F172A",
                      fontSize: "12px",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                    }}
                    formatter={(val) => [`${val}% Contribution`, "Feature Weight"]}
                  />
                  <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Breakdown Table */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              {MOCK_SHAP_FACTORS.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{factor.feature}</div>
                    <div className="text-[10px] text-blue-700 font-mono mt-0.5">{factor.impact}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-900">{factor.weight}% Weight</div>
                    <div className="text-[10px] text-slate-500">{factor.rawValue}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
