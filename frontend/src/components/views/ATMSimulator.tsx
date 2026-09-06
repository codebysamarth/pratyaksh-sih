"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { verifyCardOnChain } from "@/lib/api";

export const ATMSimulator: React.FC = () => {
  const [step, setStep] = useState<"INSERT_CARD" | "ENTER_PIN" | "PROCESSING" | "DECLINED" | "SUCCESS">("INSERT_CARD");
  const [cardInserted, setCardInserted] = useState(false);
  const [cardHash, setCardHash] = useState("");
  const [pin, setPin] = useState("4192");
  const [amount, setAmount] = useState("50000");
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const handleInsertCard = () => {
    setCardInserted(true);
    setCardHash("0x9a3c718b29f041de8201a4e5108b981d34e9102c");
    setStep("ENTER_PIN");
  };

  const handleWithdraw = async () => {
    setStep("PROCESSING");
    const result = await verifyCardOnChain(cardHash, pin, parseInt(amount) || 50000);

    setTimeout(() => {
      if (!result.approved) {
        setErrorDetails(result);
        setStep("DECLINED");
      } else {
        setStep("SUCCESS");
      }
    }, 1300);
  };

  const handleReset = () => {
    setStep("INSERT_CARD");
    setCardInserted(false);
    setCardHash("");
    setErrorDetails(null);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Top Banner Guide for Hackathon Judges */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Interactive ATM Terminal Simulator &bull; Judge Playground
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate an intercepted mule runner attempting a physical cash withdrawal at <b>SBI ATM VIT Gate</b> to witness the instant switch-level freeze.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-mono font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset ATM Terminal</span>
        </button>
      </div>

      {/* Realistic Hardware Kiosk Mockup (Off-White / Matte Gray Brushed Chassis) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Physical ATM Kiosk Body (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 border-2 border-slate-300 rounded-2xl p-6 shadow-elevated relative">
          {/* Header Strip with LED indicator */}
          <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                STATE BANK OF INDIA &bull; KIOSK #VIT-GATE-01
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs">
              NPCI SWITCH CONNECTED &bull; ISO-8583
            </div>
          </div>

          {/* Realistic LCD Screen */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6 min-h-[300px] flex flex-col justify-between shadow-inner text-slate-100 relative overflow-hidden">
            {/* Step 1: Insert Card Screen */}
            {step === "INSERT_CARD" && (
              <div className="flex flex-col items-center justify-center my-auto text-center gap-3">
                <CreditCard className="w-12 h-12 text-blue-400 animate-bounce" />
                <div className="font-mono text-base font-bold text-white tracking-wide">
                  PLEASE INSERT DEBIT / ATM CARD
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Click the <b>"Insert Mule Card"</b> button on the right slot to emulate the intercepted mule runner&apos;s withdrawal attempt.
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CARD READER READY
                </div>
              </div>
            )}

            {/* Step 2: Enter PIN & Amount */}
            {step === "ENTER_PIN" && (
              <div className="flex flex-col gap-4 my-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono text-blue-400">CARD DETECTED: {cardHash.slice(0, 16)}...</span>
                  <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                    PIN REQUIRED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">ENTER 4-DIGIT PIN:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 font-mono text-lg text-center text-white tracking-widest focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">WITHDRAWAL AMOUNT (INR):</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 font-mono text-lg text-center text-rose-400 font-bold tracking-wider focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <button
                    onClick={handleWithdraw}
                    className="px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-mono font-semibold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Confirm Cash Withdrawal (₹{parseInt(amount).toLocaleString("en-IN")})
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Processing */}
            {step === "PROCESSING" && (
              <div className="flex flex-col items-center justify-center my-auto gap-3 text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="font-mono text-sm font-bold text-slate-200">
                  CONNECTING TO NPCI SWITCH & CONSORTIUM LEDGER...
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Verifying Active On-Chain Smart Liens for Card Hash: {cardHash.slice(0, 14)}...
                </div>
              </div>
            )}

            {/* Step 4: THE CLIMAX — DECLINED BY SMART LIEN */}
            {step === "DECLINED" && (
              <div className="flex flex-col items-center justify-center my-auto gap-3 text-center animate-shake">
                <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center shadow-lg">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>

                <div className="font-mono text-base font-bold text-rose-400 tracking-wide">
                  TRANSACTION DECLINED &bull; ACTIVE ON-CHAIN SMART LIEN
                </div>

                <div className="bg-rose-950/70 border border-rose-800 rounded-lg p-3 max-w-lg text-left text-xs font-mono text-rose-200">
                  <div className="text-white font-bold mb-1">
                    ISSUED BY: INDIAN CYBER CRIME COORDINATION CENTRE (I4C)
                  </div>
                  <div className="text-[11px] text-rose-300">
                    &bull; Consortium Block Reference: <b>#1042</b> (Tx: 0x9b3fe82a041cb88147d332901a88c2f1092a019b)
                  </div>
                  <div className="text-[11px] text-rose-300">
                    &bull; Interdicted Funds at Switch: <b>₹{parseInt(amount).toLocaleString("en-IN")}</b>
                  </div>
                  <div className="text-[11px] text-rose-300 mt-0.5">
                    &bull; Enforcement: <b>PUNE POLICE PATROL BEAT ALERTED</b>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Cash dispenser locked. Transaction logged to Section 65B audit trail.
                </div>
              </div>
            )}
          </div>

          {/* Physical Cash Dispenser Shutter Slot */}
          <div className="mt-5 pt-4 border-t border-slate-300 flex flex-col items-center gap-1.5">
            <div className="text-[11px] font-mono text-slate-600 uppercase tracking-wider font-semibold">
              Cash Dispenser Shutter
            </div>
            <div
              className={`w-3/4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${
                step === "DECLINED"
                  ? "bg-rose-100 border-rose-400"
                  : "bg-slate-300 border-slate-400"
              }`}
            >
              <div className="w-1/2 h-1 bg-slate-400 rounded-full" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold ${
                step === "DECLINED" ? "text-rose-700" : "text-slate-500"
              }`}
            >
              {step === "DECLINED" ? "ELECTRO-LOCK ACTIVE &bull; CASH DISPENSING INTERDICTED" : "SHUTTER SECURE"}
            </span>
          </div>
        </div>

        {/* Right Side: Physical Controls & Testing Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <GlassCard className="p-4 flex flex-col gap-3">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                Card Slot & Hardware Controls
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simulated physical hardware interactions for jury demonstration.
              </p>
            </div>

            {/* Card Slot Mockup */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center gap-3">
              <div className="w-full h-3 bg-slate-200 border border-slate-300 rounded-full relative flex items-center justify-center">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    cardInserted ? "w-4/5 bg-blue-600" : "w-0"
                  }`}
                />
              </div>

              <button
                onClick={handleInsertCard}
                disabled={cardInserted}
                className={`w-full py-2.5 px-3 rounded-md font-sans text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  cardInserted
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{cardInserted ? "Mule Card Inserted (Hash Locked)" : "Insert Intercepted Mule Card"}</span>
              </button>

              {cardInserted && (
                <div className="text-[10px] font-mono text-slate-600 break-all text-center">
                  Card Hash: 0x9a3c...102c (Mule 2B Account)
                </div>
              )}
            </div>

            {/* What this proves */}
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>Operational Impact:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-1">
                <li>Pre-dispense smart lien prevents funds leaving the banking switch.</li>
                <li>Mule runner is trapped at the kiosk without physical rupees.</li>
                <li>Zero lag time compared to legacy manual bank freeze emails.</li>
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
