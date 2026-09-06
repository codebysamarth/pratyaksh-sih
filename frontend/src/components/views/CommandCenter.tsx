"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Zap,
  MapPin,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Clock,
  Car,
  BellRing,
  Camera,
  ShieldAlert,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import {
  INITIAL_LOCATIONS,
  MOCK_THREAT_CASE,
  MOCK_RECENT_CASES,
  ATMHotspot,
  CaseThreat,
} from "@/lib/mockData";
import { triggerFraudSimulation } from "@/lib/api";

const RadarMap = dynamic(
  () => import("@/components/map/RadarMap").then((mod) => mod.RadarMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[440px] rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-600">CONNECTING POSITRON SATELLITE TILES...</span>
      </div>
    ),
  }
);

export const CommandCenter: React.FC = () => {
  const [activeCase, setActiveCase] = useState<CaseThreat>(MOCK_THREAT_CASE);
  const [selectedLocation, setSelectedLocation] = useState(INITIAL_LOCATIONS[0]);
  const [selectedAtm, setSelectedAtm] = useState<ATMHotspot>(MOCK_THREAT_CASE.atms[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lienTriggered, setLienTriggered] = useState(false);
  const [patrolDispatched, setPatrolDispatched] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setLienTriggered(false);
    setPatrolDispatched(false);

    try {
      const newCase = await triggerFraudSimulation({ locationId: selectedLocation.id });
      setActiveCase(newCase);
      setSelectedAtm(newCase.atms[0]);
      showToast("Real-time 1930 Fraud Alert Ingested: ₹3,50,000 via Mule Network");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleTriggerLien = () => {
    setLienTriggered(true);
    showToast("Smart Contract Lien Executed: NPCI Bank Switch Freeze Anchored to Block #1042");
  };

  const handleDispatchPatrol = () => {
    setPatrolDispatched(true);
    showToast("Police Beat Dispatch Broadcasted: Pune PCR Van 18 moving to SBI ATM VIT Gate");
  };

  const showToast = (msg: string) => {
    setLiveToast(msg);
    setTimeout(() => setLiveToast(null), 5000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Notification Banner */}
      {liveToast && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-md flex items-center justify-between animate-fadeIn border border-slate-700">
          <div className="flex items-center gap-2 text-xs font-medium">
            <BellRing className="w-4 h-4 text-blue-400" />
            <span>{liveToast}</span>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-xs text-slate-400 hover:text-white font-mono ml-4"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Top Sub-Bar Controls (Light Enterprise Toolbar) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200/90 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wide">Target Sector:</span>
          </div>

          <select
            value={selectedLocation.id}
            onChange={(e) => {
              const loc = INITIAL_LOCATIONS.find((l) => l.id === e.target.value);
              if (loc) setSelectedLocation(loc);
            }}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {INITIAL_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => showToast("Custom Pin: Centered to Bibwewadi Pune (18.4636, 73.8682)")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Adjust Geo-Coordinates</span>
          </button>
        </div>

        {/* Primary Simulation Trigger */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Zap className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
          <span>{isSimulating ? "Processing Geo-Funnel..." : "Trigger Live 1930 Fraud Alert"}</span>
        </button>
      </div>

      {/* 3-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN (3 cols) — Live 1930 Threat Stream (Banking Alert Cards) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <GlassCard className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <h2 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                  Live 1930 Threat Stream
                </h2>
              </div>
              <span className="text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                ACTIVE INCIDENT
              </span>
            </div>

            {/* Active Investigated Ticket (Banking Alert Card Style) */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 flex flex-col gap-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-mono text-slate-500 font-semibold">{activeCase.caseId}</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{activeCase.victimName}</div>
                  <div className="text-[11px] text-slate-500">{activeCase.victimCity}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-mono font-bold text-slate-900">
                    ₹{activeCase.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{activeCase.reportedAt}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1.5 rounded border border-slate-200/80">
                <span className="text-slate-600 font-medium truncate max-w-[170px]">{activeCase.fraudType}</span>
                <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  PII PROTECTED
                </span>
              </div>

              {/* Status Progression Bar */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  DETECTED
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  AI PREDICTED
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded border ${
                    lienTriggered
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-amber-800 bg-amber-50 border-amber-200"
                  }`}
                >
                  {lienTriggered ? "LIEN ACTIVE" : "LIEN PENDING"}
                </span>
              </div>
            </div>

            {/* Candidate ATM Predictions Quick List */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex justify-between">
                <span>Predicted ATM Interceptions</span>
                <span>Risk &bull; ETA</span>
              </div>

              {activeCase.atms.map((atm) => {
                const isSelected = selectedAtm.id === atm.id;
                const badgeStyle =
                  atm.rank === 1
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : atm.rank === 2
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-100 text-slate-700";

                return (
                  <button
                    key={atm.id}
                    onClick={() => setSelectedAtm(atm)}
                    className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-300 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${badgeStyle}`}>
                          #{atm.rank}
                        </span>
                        <div className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
                          {atm.bank}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[170px] mt-0.5">
                        {atm.address}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">{atm.riskScore}%</div>
                      <div className="text-[10px] font-mono text-blue-700 font-semibold">{atm.etaMinutes}m ETA</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Other Recent Cases Feed */}
            <div className="border-t border-slate-100 pt-2.5 flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Historical Alerts</div>
              {MOCK_RECENT_CASES.slice(1).map((rc) => (
                <div
                  key={rc.id}
                  className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200/80 text-[11px]"
                >
                  <div>
                    <div className="font-mono font-semibold text-slate-800">{rc.id}</div>
                    <div className="text-[10px] text-slate-500">{rc.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">{rc.amount}</div>
                    <div className="text-[10px] font-mono font-semibold text-emerald-700">{rc.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* CENTER COLUMN (6 cols) — CartoDB Positron GIS Map */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="h-[580px] w-full">
            <RadarMap
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={selectedLocation.zoom}
              atms={activeCase.atms}
              selectedAtm={selectedAtm}
              onSelectAtm={setSelectedAtm}
              muleLocation={[activeCase.lastMuleIpLat, activeCase.lastMuleIpLng]}
            />
          </div>
        </div>

        {/* RIGHT COLUMN (3 cols) — Actionable Proactive Interdiction Timeline */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <GlassCard className="p-4 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Interdiction Center
              </h2>
            </div>

            {/* Countdown Micro-Bar Widget */}
            <CountdownTimer initialSeconds={activeCase.secondsRemaining} />

            {/* ATM Surveillance Thumbnail Mockup Card */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex flex-col">
              {/* Surveillance Preview Mockup */}
              <div className="h-28 bg-slate-800 relative flex items-center justify-center p-2">
                {/* Visual grid / camera wireframe */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                <div className="z-10 flex flex-col items-center gap-1 text-center">
                  <Camera className="w-6 h-6 text-slate-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                    CCTV STREAM &bull; CAM #04 VIT GATE
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
                    LIVE &bull; 24 FPS
                  </span>
                </div>

                <div className="absolute top-1.5 left-2 text-[9px] font-mono text-slate-400">
                  REC [10:04:12]
                </div>
                <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-rose-400 font-bold">
                  HOTSPOT DETECTED
                </div>
              </div>

              {/* ATM Details */}
              <div className="p-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-rose-200 text-rose-700 bg-rose-50">
                    PRIORITY #{selectedAtm.rank} TARGET
                  </span>
                  <span className="text-xs font-mono text-slate-900 font-bold">
                    {selectedAtm.riskScore}% RISK
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 leading-snug">{selectedAtm.name}</div>
                <div className="text-[11px] text-slate-500">{selectedAtm.kioskType}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px] font-mono">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>ETA: <b>{selectedAtm.etaMinutes}m</b></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dist: <b>{selectedAtm.distanceMeters}m</b></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable CTAs (Clean Editorial Hierarchy) */}
            <div className="flex flex-col gap-2 pt-1">
              {/* Primary Action: Dispatch Beat Police Patrol (Solid Navy/Indigo) */}
              <button
                onClick={handleDispatchPatrol}
                className={`w-full py-2.5 px-3 rounded-md font-sans text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  patrolDispatched
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                <Car className="w-4 h-4" />
                <span>
                  {patrolDispatched
                    ? "PCR Van 18 En Route (Synced)"
                    : "Dispatch Beat Police Patrol"}
                </span>
              </button>

              {/* Secondary Action: Smart Contract Bank Lien (Crisp Amber / White) */}
              <button
                onClick={handleTriggerLien}
                className={`w-full py-2.5 px-3 rounded-md border font-sans text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  lienTriggered
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-xs"
                }`}
              >
                {lienTriggered ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>
                  {lienTriggered
                    ? "Smart Lien Active (Block #1042)"
                    : "Auto-Trigger Smart Contract Lien"}
                </span>
              </button>
            </div>

            {/* SLA Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2 text-[11px] font-mono text-slate-600 flex justify-between items-center">
              <span>Inter-Agency Interdiction SLA:</span>
              <span className="text-emerald-700 font-bold">2m 30s (&lt; 45m Target)</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
