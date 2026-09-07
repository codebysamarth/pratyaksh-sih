"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
  Fingerprint,
  Coins,
  Building2,
  Check,
  Activity,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { verifyCardOnChain } from "@/lib/api";

interface ATMSimulatorProps {
  onAddAuditRecord?: (event: string, agency: string, details: string, caseId?: string) => void;
}

type CashoutChannel = "ATM" | "AEPS" | "UPI_SPLIT" | "CRYPTO";

export const ATMSimulator: React.FC<ATMSimulatorProps> = ({ onAddAuditRecord }) => {
  const [activeChannel, setActiveChannel] = useState<CashoutChannel>("ATM");

  // ==========================================
  // CHANNEL 1: ATM HARDWARE KIOSK STATE
  // ==========================================
  const [step, setStep] = useState<"INSERT_CARD" | "ENTER_PIN" | "PROCESSING" | "DECLINED" | "SUCCESS">("INSERT_CARD");
  const [cardInserted, setCardInserted] = useState(false);
  const [cardType, setCardType] = useState<"MULE" | "CLEAN">("MULE");
  const [cardHash, setCardHash] = useState("");
  const [pin, setPin] = useState("4192");
  const [amount, setAmount] = useState("50000");

  const handleInsertCard = (type: "MULE" | "CLEAN" = cardType) => {
    setCardType(type);
    setCardInserted(true);
    if (type === "MULE") {
      setCardHash("0x9a3c718b29f041de8201a4e5108b981d34e9102c");
    } else {
      setCardHash("0x4b819f72c1042a981de8201948b21c43912da481");
    }
    setStep("ENTER_PIN");
  };

  const handleWithdraw = async () => {
    setStep("PROCESSING");

    if (cardType === "MULE") {
      try {
        await verifyCardOnChain(cardHash, pin, parseInt(amount) || 50000);
      } catch (err) {
        // Fallback gracefully
      }
      setTimeout(() => {
        setStep("DECLINED");
        onAddAuditRecord?.(
          "ATM_CASHOUT_INTERDICTED",
          "SBI Switch Node (VIT Gate #01)",
          `Physical ATM cashout blocked by pre-dispense electro-lock shutter. ₹${parseInt(amount || "50000").toLocaleString("en-IN")} preserved.`
        );
      }, 1200);
    } else {
      // Clean card flow
      setTimeout(() => {
        setStep("SUCCESS");
      }, 1200);
    }
  };

  const handleResetATM = () => {
    setStep("INSERT_CARD");
    setCardInserted(false);
    setCardHash("");
  };

  // ==========================================
  // CHANNEL 2: AePS / MICRO-ATM BIOMETRIC STATE
  // ==========================================
  const [aepsStep, setAepsStep] = useState<"IDLE" | "SCANNING" | "REJECTED" | "APPROVED">("IDLE");

  const handleAepsScan = (type: "MULE" | "CLEAN") => {
    setAepsStep("SCANNING");

    setTimeout(() => {
      if (type === "MULE") {
        setAepsStep("REJECTED");
        onAddAuditRecord?.(
          "AEPS_BIOMETRIC_BLOCKED",
          "NPCI AePS Gateway / UIDAI Node",
          "Biometric cashout rejected at CSP Pune North. Aadhaar UID smart lien active. Kiosk alerted."
        );
      } else {
        setAepsStep("APPROVED");
      }
    }, 1400);
  };

  const handleResetAeps = () => {
    setAepsStep("IDLE");
  };

  // ==========================================
  // CHANNEL 3: MULTI-BANK UPI SPLIT STATE
  // ==========================================
  const [upiStep, setUpiStep] = useState<"IDLE" | "SPLITTING" | "FROZEN">("IDLE");
  const [splitProgress, setSplitProgress] = useState(0);

  const handleExecuteUpiSplit = () => {
    setUpiStep("SPLITTING");
    setSplitProgress(15);

    setTimeout(() => setSplitProgress(50), 200);
    setTimeout(() => setSplitProgress(85), 350);
    setTimeout(() => {
      setSplitProgress(100);
      setUpiStep("FROZEN");
      onAddAuditRecord?.(
        "MULTI_BANK_UPI_SPLIT_FROZEN",
        "NPCI UPI Switch Consortium",
        "Automated batch freeze on 3 mule branches (Axis, Kotak, SBI) in 380ms. ₹1,50,000 secured."
      );
    }, 550);
  };

  const handleResetUpi = () => {
    setUpiStep("IDLE");
    setSplitProgress(0);
  };

  // ==========================================
  // CHANNEL 4: P2P CRYPTO OFF-RAMP STATE
  // ==========================================
  const [cryptoStep, setCryptoStep] = useState<"IDLE" | "PROCESSING" | "INTERDICTED" | "CLEAN_APPROVED">("IDLE");

  const handleExecuteCryptoTest = (isMule: boolean) => {
    setCryptoStep("PROCESSING");

    setTimeout(() => {
      if (isMule) {
        setCryptoStep("INTERDICTED");
        onAddAuditRecord?.(
          "CRYPTO_VASP_ESCROW_LOCKED",
          "FIU-IND Gateway / VASP Node",
          "1,657.45 USDT P2P escrow release locked. Tainted INR settlement frozen at gateway switch."
        );
      } else {
        setCryptoStep("CLEAN_APPROVED");
      }
    }, 1300);
  };

  const handleResetCrypto = () => {
    setCryptoStep("IDLE");
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* Top Banner Guide for Hackathon Judges */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Omni-Channel Cashout Defense Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mule syndicates exploit multiple cashout vectors when debit cards are blocked. Test how PRATYAKSH defends <b>ATMs</b>, <b>AePS Biometric CSPs</b>, <b>Multi-Bank UPI Splits</b>, and <b>P2P Crypto Off-Ramps</b> in real-time.
          </p>
        </div>

        {/* 4-Channel Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveChannel("ATM")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeChannel === "ATM"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>1. ATM Dispenser</span>
          </button>

          <button
            onClick={() => setActiveChannel("AEPS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeChannel === "AEPS"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>2. AePS Biometric</span>
          </button>

          <button
            onClick={() => setActiveChannel("UPI_SPLIT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeChannel === "UPI_SPLIT"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Multi-Bank UPI</span>
          </button>

          <button
            onClick={() => setActiveChannel("CRYPTO")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              activeChannel === "CRYPTO"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>4. Crypto P2P</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHANNEL 1: PHYSICAL ATM DISPENSER SIMULATOR */}
      {/* ========================================================================= */}
      {activeChannel === "ATM" && (
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
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6 min-h-[340px] flex flex-col justify-between shadow-inner text-slate-100 relative overflow-hidden">
              {/* Step 1: Insert Card Screen */}
              {step === "INSERT_CARD" && (
                <div className="flex flex-col items-center justify-center my-auto text-center gap-3">
                  <CreditCard className="w-12 h-12 text-blue-400 animate-bounce" />
                  <div className="font-mono text-base font-bold text-white tracking-wide">
                    PLEASE INSERT DEBIT / ATM CARD
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    Choose a card on the right panel to test: either the <b>Flagged Mule Card</b> (triggers instant Smart Lien freeze) or a <b>Normal Citizen Card</b> (approved cashout).
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    CARD READER READY &bull; ISO-7816 ACTIVE
                  </div>
                </div>
              )}

              {/* Step 2: Enter PIN & Amount */}
              {step === "ENTER_PIN" && (
                <div className="flex flex-col gap-4 my-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono text-blue-400">
                      CARD DETECTED: {cardHash.slice(0, 16)}...
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        cardType === "MULE"
                          ? "text-rose-300 bg-rose-950/80 border-rose-800"
                          : "text-emerald-300 bg-emerald-950/80 border-emerald-800"
                      }`}
                    >
                      {cardType === "MULE" ? "MULE 2B ACCOUNT DETECTED" : "GENUINE CITIZEN CARD"}
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
                      Confirm Cash Withdrawal (₹{parseInt(amount || "0").toLocaleString("en-IN")})
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
                  <div className="text-[10px] font-mono text-blue-400 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800">
                    ISO-8583 TRANSACTION AUTHORIZATION REQUEST IN FLIGHT
                  </div>
                </div>
              )}

              {/* Step 4: DECLINED BY SMART LIEN */}
              {step === "DECLINED" && (
                <div className="flex flex-col items-center justify-center my-auto gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center shadow-lg">
                    <XCircle className="w-8 h-8 text-rose-400" />
                  </div>

                  <div className="font-mono text-base font-bold text-rose-400 tracking-wide">
                    TRANSACTION DECLINED &bull; EMERGENCY BANK FREEZE ACTIVE
                  </div>

                  <div className="bg-rose-950/70 border border-rose-800 rounded-lg p-3 max-w-lg text-left text-xs font-mono text-rose-200">
                    <div className="text-white font-bold mb-1">
                      ORDER ISSUED BY: NATIONAL CYBER HELPLINE (1930 / MHA-I4C)
                    </div>
                    <div className="text-[11px] text-rose-300">
                      &bull; National Audit Reference: <b>SEC63-REF-#1045</b> (Consortium Switch Lien)
                    </div>
                    <div className="text-[11px] text-rose-300">
                      &bull; Interdicted Funds at Switch: <b>₹{parseInt(amount || "0").toLocaleString("en-IN")}</b>
                    </div>
                    <div className="text-[11px] text-rose-300 mt-0.5">
                      &bull; Ground Enforcement: <b>BEAT PATROL DISPATCHED (GPS TURN-BY-TURN ACTIVE)</b>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Cash dispenser locked. Transaction logged to Section 65B legal audit trail.
                  </div>

                  <button
                    onClick={handleResetATM}
                    className="mt-1 px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    &larr; Eject Card & Try Again
                  </button>
                </div>
              )}

              {/* Step 5: SUCCESSFUL CASHOUT FOR CLEAN CITIZEN */}
              {step === "SUCCESS" && (
                <div className="flex flex-col items-center justify-center my-auto gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div className="font-mono text-base font-bold text-emerald-400 tracking-wide">
                    TRANSACTION APPROVED &bull; CASH DISPENSED
                  </div>

                  <div className="bg-emerald-950/70 border border-emerald-800 rounded-lg p-3 max-w-lg text-left text-xs font-mono text-emerald-200">
                    <div className="text-white font-bold mb-1">
                      NPCI AUTHORIZATION: SUCCESS (NO ACTIVE LIENS)
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      &bull; Amount Dispensed: <b>₹{parseInt(amount || "0").toLocaleString("en-IN")}</b>
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      &bull; Account: <b>0x4b81...a481 (Genuine Citizen)</b>
                    </div>
                    <div className="text-[11px] text-emerald-300 mt-0.5">
                      &bull; Note: No cybercrime lien exists on this account.
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Please collect your cash and receipt from the dispenser below.
                  </div>

                  <button
                    onClick={handleResetATM}
                    className="mt-1 px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    &larr; Eject Card & Return to Idle
                  </button>
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
                    : step === "SUCCESS"
                    ? "bg-emerald-100 border-emerald-400"
                    : "bg-slate-300 border-slate-400"
                }`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    step === "SUCCESS" ? "w-4/5 bg-emerald-500" : "w-1/2 bg-slate-400"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-mono font-bold ${
                  step === "DECLINED"
                    ? "text-rose-700"
                    : step === "SUCCESS"
                    ? "text-emerald-700"
                    : "text-slate-500"
                }`}
              >
                {step === "DECLINED"
                  ? "ELECTRO-LOCK ACTIVE &bull; CASH DISPENSING INTERDICTED"
                  : step === "SUCCESS"
                  ? "DISPENSER UNLOCKED &bull; PLEASE COLLECT RUPEES"
                  : "SHUTTER SECURE"}
              </span>
            </div>
          </div>

          {/* Right Side: Physical Controls & Testing Panel (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Card Slot & Testing Profiles
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulate hardware interactions to prove pre-dispense interdiction vs normal transactions.
                </p>
              </div>

              {/* Test Card Selector */}
              <div className="flex flex-col gap-2">
                {/* Option 1: Flagged Mule Card */}
                <button
                  onClick={() => handleInsertCard("MULE")}
                  disabled={cardInserted && cardType === "MULE"}
                  className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    cardInserted && cardType === "MULE"
                      ? "bg-rose-50 border-rose-300 ring-1 ring-rose-400"
                      : "bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Intercepted Mule Card
                      </span>
                    </div>
                    {cardInserted && cardType === "MULE" && (
                      <span className="text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded">
                        IN SLOT
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Hash: 0x9a3c...102c (Flagged Mule 2B)
                  </div>
                  <div className="text-[11px] text-rose-700 mt-1 font-medium">
                    &bull; Demonstrates smart lien switch-level freeze!
                  </div>
                </button>

                {/* Option 2: Clean Citizen Card */}
                <button
                  onClick={() => handleInsertCard("CLEAN")}
                  disabled={cardInserted && cardType === "CLEAN"}
                  className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    cardInserted && cardType === "CLEAN"
                      ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Normal Citizen Card
                      </span>
                    </div>
                    {cardInserted && cardType === "CLEAN" && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                        IN SLOT
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Hash: 0x4b81...a481 (Clean Account)
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                    &bull; Demonstrates normal cashout without false positives.
                  </div>
                </button>
              </div>

              {/* What this proves for Jury */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5 mt-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Operational Impact for Judges:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-1">
                  <li><b>Pre-dispense freeze:</b> Rupee notes never leave the shutter.</li>
                  <li><b>No human delay:</b> Smart lien activates autonomously.</li>
                  <li><b>Zero False Positives:</b> Genuine citizens withdraw normally.</li>
                </ul>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHANNEL 2: AePS / MICRO-ATM BIOMETRIC CSP SIMULATOR */}
      {/* ========================================================================= */}
      {activeChannel === "AEPS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Biometric POS Terminal Body (8 cols) */}
          <div className="lg:col-span-8 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 border-2 border-slate-300 rounded-2xl p-6 shadow-elevated relative">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
                <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                  AePS MICRO-ATM POS &bull; CSP KIOSK #MH-PUN-CSP-114
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs">
                UIDAI L1 SENSOR CONNECTED &bull; NPCI-ABPS
              </div>
            </div>

            {/* Terminal Screen & Biometric Pad */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-900 border-2 border-slate-700 rounded-xl p-6 min-h-[340px] text-slate-100 shadow-inner">
              {/* Left Side: Biometric Scanner Pad Graphic (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                <div className="relative w-36 h-48 rounded-xl bg-slate-950 border-2 border-cyan-800/60 flex flex-col items-center justify-center overflow-hidden shadow-inner p-2">
                  {/* Laser Scanning Line */}
                  {aepsStep === "SCANNING" && (
                    <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse top-1/2 -translate-y-1/2 z-20" />
                  )}

                  <Fingerprint
                    className={`w-24 h-24 transition-all duration-300 ${
                      aepsStep === "SCANNING"
                        ? "text-cyan-400 scale-105 animate-pulse"
                        : aepsStep === "REJECTED"
                        ? "text-rose-500 scale-100"
                        : aepsStep === "APPROVED"
                        ? "text-emerald-400 scale-100"
                        : "text-slate-600"
                    }`}
                  />

                  <span className="text-[9px] font-mono font-semibold uppercase mt-2 tracking-wider text-slate-400">
                    {aepsStep === "SCANNING"
                      ? "SCANNING L1..."
                      : aepsStep === "REJECTED"
                      ? "BIOMETRIC LIEN"
                      : aepsStep === "APPROVED"
                      ? "MATCH VERIFIED"
                      : "OPTICAL SENSOR"}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  Mantra MFS100 / Startek FM220
                </span>
              </div>

              {/* Right Side: Terminal Status Display (7 cols) */}
              <div className="md:col-span-7 flex flex-col justify-between">
                {aepsStep === "IDLE" && (
                  <div className="flex flex-col gap-3 my-auto">
                    <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4" />
                      <span>AADHAAR CASH-OUT TRANSACTION</span>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aadhaar UID:</span>
                        <span className="text-slate-200 font-bold">XXXX-XXXX-8912</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Requested Cashout:</span>
                        <span className="text-white font-bold">₹10,000 (Daily Max)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">CSP Agent ID:</span>
                        <span className="text-slate-300">SBI_CSP_PUN_114</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Switch Network:</span>
                        <span className="text-cyan-300">NPCI-ABPS Gateway</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Select a testing profile on the right to simulate a suspect thumbprint scan at a rural Customer Service Point.
                    </p>
                  </div>
                )}

                {aepsStep === "SCANNING" && (
                  <div className="flex flex-col items-center justify-center my-auto text-center gap-3">
                    <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm font-mono font-bold text-white">
                      AUTHENTICATING WITH UIDAI & NPCI SWITCH...
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Querying PRATYAKSH Consortium Smart Lien Registry for UID: XXXX-XXXX-8912
                    </div>
                  </div>
                )}

                {aepsStep === "REJECTED" && (
                  <div className="flex flex-col gap-3 my-auto">
                    <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm">
                      <XCircle className="w-5 h-5 text-rose-500" />
                      <span>AEPS CASHOUT REJECTED &bull; AADHAAR LIEN ACTIVE</span>
                    </div>

                    <div className="bg-rose-950/70 border border-rose-800 rounded-lg p-3 text-xs font-mono text-rose-200 space-y-1">
                      <div>&bull; Interdiction Notice: <b>SEC63-AEPS-902</b></div>
                      <div>&bull; Linked Aadhaar: <b>XXXX-XXXX-8912 (Sybil Mule 2B)</b></div>
                      <div>&bull; Action: <b>CASH DISPENSING INTERDICTED AT CSP KIOSK</b></div>
                      <div>&bull; PCR Van 18 alerted with CSP GPS coordinates.</div>
                    </div>

                    <button
                      onClick={handleResetAeps}
                      className="mt-1 px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 cursor-pointer self-start"
                    >
                      &larr; Reset AePS Terminal
                    </button>
                  </div>
                )}

                {aepsStep === "APPROVED" && (
                  <div className="flex flex-col gap-3 my-auto">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>AEPS CASHOUT APPROVED &bull; ₹10,000 DISPENSED</span>
                    </div>

                    <div className="bg-emerald-950/70 border border-emerald-800 rounded-lg p-3 text-xs font-mono text-emerald-200 space-y-1">
                      <div>&bull; UIDAI Biometric Auth: <b>VERIFIED (Clean Citizen)</b></div>
                      <div>&bull; Active Liens: <b>0 Found across Consortium</b></div>
                      <div>&bull; Cashout Status: <b>CSP Agent Authorized to Handover Cash</b></div>
                    </div>

                    <button
                      onClick={handleResetAeps}
                      className="mt-1 px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 cursor-pointer self-start"
                    >
                      &larr; Reset AePS Terminal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: AePS Controls (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Biometric Test Scenarios
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Test how Aadhaar-linked emergency liens prevent cash withdrawals at rural business correspondent kiosks.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAepsScan("MULE")}
                  disabled={aepsStep === "SCANNING"}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Scan Flagged Mule Runner Thumb
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-700 mt-1">
                    Triggers instant AePS smart lien rejection across all CSPs nationwide.
                  </div>
                </button>

                <button
                  onClick={() => handleAepsScan("CLEAN")}
                  disabled={aepsStep === "SCANNING"}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Scan Genuine Citizen Thumb
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    Authenticates normally with zero false positives.
                  </div>
                </button>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5 mt-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Why AePS Defense is Crucial:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cybercrime rings dispatch runners to rural CSP kiosks with cloned fingerprints to drain accounts without ATM cards. PRATYAKSH applies the lien at the <b>Aadhaar Payments Bridge (ABPS)</b> level, closing this major loophole.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHANNEL 3: MULTI-BANK UPI SMURFING / GRAPH INTERCEPTION */}
      {/* ========================================================================= */}
      {activeChannel === "UPI_SPLIT" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Graph Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-elevated flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">
                  High-Velocity Multi-Bank UPI Smurfing Interceptor
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                NPCI ISO-20022 CONSORTIUM HOOK
              </span>
            </div>

            {/* Split Flow Visual Diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
              {/* Source Node */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Victim Primary Account (SBI)</div>
                    <div className="text-[10px] text-slate-500 font-mono">A/C: XXXX-8902 &bull; ₹1,50,000 Unauthorized Ingestion</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                  ₹1,50,000 STOLEN
                </span>
              </div>

              {/* Arrow Connector */}
              <div className="flex items-center justify-center text-xs font-mono text-slate-400 gap-2">
                <span>&darr; Instant 3-Way UPI Rapid Fan-Out (Sybil Mule Smurfing) &darr;</span>
              </div>

              {/* Destination 3 Branches */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Branch 1: Axis */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    upiStep === "FROZEN"
                      ? "bg-emerald-50/80 border-emerald-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-800">Branch A: Axis Bank</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Mule 2A: ₹50,000</div>
                  <div className="mt-2 text-[10px] font-mono font-bold">
                    {upiStep === "FROZEN" ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> FROZEN IN 180ms
                      </span>
                    ) : (
                      <span className="text-slate-400">PENDING FANOUT</span>
                    )}
                  </div>
                </div>

                {/* Branch 2: Kotak */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    upiStep === "FROZEN"
                      ? "bg-emerald-50/80 border-emerald-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-800">Branch B: Kotak Bank</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Mule 2B: ₹50,000</div>
                  <div className="mt-2 text-[10px] font-mono font-bold">
                    {upiStep === "FROZEN" ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> FROZEN IN 240ms
                      </span>
                    ) : (
                      <span className="text-slate-400">PENDING FANOUT</span>
                    )}
                  </div>
                </div>

                {/* Branch 3: SBI */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    upiStep === "FROZEN"
                      ? "bg-emerald-50/80 border-emerald-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-800">Branch C: SBI Secondary</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Mule 2C: ₹50,000</div>
                  <div className="mt-2 text-[10px] font-mono font-bold">
                    {upiStep === "FROZEN" ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> FROZEN IN 380ms
                      </span>
                    ) : (
                      <span className="text-slate-400">PENDING FANOUT</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons & Execution Progress */}
            <div className="flex flex-col gap-3">
              {upiStep === "IDLE" && (
                <button
                  onClick={handleExecuteUpiSplit}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Execute High-Velocity Mule Split & Trigger Automated Interception</span>
                </button>
              )}

              {upiStep === "SPLITTING" && (
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-700 font-bold">DISPATCHING MULTI-BANK CONSORTIUM SMART LIENS...</span>
                    <span className="text-blue-600 font-bold">{splitProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-200"
                      style={{ width: `${splitProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {upiStep === "FROZEN" && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ALL 3 MULTI-BANK BRANCHES FROZEN IN 380 MILLISECONDS</span>
                    </div>
                    <button
                      onClick={handleResetUpi}
                      className="text-[11px] font-mono text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      Reset Test
                    </button>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    100% of the ₹1,50,000 interdicted across Axis, Kotak, and SBI simultaneously via NPCI Switch Consortium smart liens.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Graph Insights (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Consortium Freezing Metrics
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time synchronization across disparate banking core systems.
                </p>
              </div>

              <div className="flex flex-col gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-500">Mule Detection Engine:</span>
                  <span className="text-slate-900 font-bold">NetworkX Graph v2</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-500">Cross-Bank Latency:</span>
                  <span className="text-emerald-700 font-bold">380ms Total</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-500">Consortium Nodes:</span>
                  <span className="text-blue-700 font-bold">3 Banks + NPCI</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-500">Capital Secured:</span>
                  <span className="text-emerald-700 font-bold">₹1,50,000 (100%)</span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5 mt-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Why Multi-Bank Graph Defense Matters:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Criminals know that traditional bank-to-bank emails take hours. PRATYAKSH broadcasts the freeze order in parallel through a shared switch layer, freezing all 3 mule accounts before the runner can withdraw cash anywhere.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHANNEL 4: P2P CRYPTO OFF-RAMP / VASP GATEWAY INTERCEPTOR */}
      {/* ========================================================================= */}
      {activeChannel === "CRYPTO" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* P2P Order Terminal Mockup (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-elevated text-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  P2P CRYPTO EXCHANGE TERMINAL &bull; USDT / INR ESCROW
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                FIU-IND REGISTERED VASP GATEWAY
              </span>
            </div>

            {/* P2P Order Ticket */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-500">ASSET PAIR</div>
                  <div className="text-white font-bold mt-0.5">USDT / INR</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-500">PURCHASE AMOUNT</div>
                  <div className="text-amber-400 font-bold mt-0.5">₹1,50,000</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-500">ESTIMATED CRYPTO</div>
                  <div className="text-emerald-400 font-bold mt-0.5">1,657.45 USDT</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-500">PAYMENT METHOD</div>
                  <div className="text-blue-400 font-bold mt-0.5">IMPS / Fast UPI</div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">P2P Escrow Counterparty:</span>
                  <span className="text-slate-200">CryptoMerchant_Alpha (Verified VASP Merchant)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Escrow Smart Contract State:</span>
                  <span className="text-amber-400">1,657.45 USDT Locked in Exchange Escrow Vault</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Payment Gateway Origin:</span>
                  <span className="text-rose-400">Flagged Mule Account (0x9a3c...102c)</span>
                </div>
              </div>
            </div>

            {/* Interactive Crypto Execution States */}
            {cryptoStep === "IDLE" && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleExecuteCryptoTest(true)}
                  className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Attempt P2P Fiat Payment & Test VASP Interception</span>
                </button>
                <div className="text-center text-[11px] font-mono text-slate-400">
                  Simulates cybercriminal attempting to convert stolen INR into USDT on crypto exchange.
                </div>
              </div>
            )}

            {cryptoStep === "PROCESSING" && (
              <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <div className="font-mono text-xs font-bold text-amber-300">
                  INTERCEPTING VASP PAYMENT GATEWAY VIA FIU-IND CONSORTIUM...
                </div>
              </div>
            )}

            {cryptoStep === "INTERDICTED" && (
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>VASP P2P CASHOUT INTERDICTED &bull; FIU-IND SMART LIEN ACTIVE</span>
                  </div>
                  <button
                    onClick={handleResetCrypto}
                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Test
                  </button>
                </div>
                <div className="space-y-1 text-rose-200 text-[11px]">
                  <div>&bull; Action: <b>FIAT SETTLEMENT FROZEN AT PAYMENT SWITCH (₹1,50,000 SECURED)</b></div>
                  <div>&bull; Webhook Broadcast: <b>REGISTERED VASP ESCROW RELEASE HALTED</b></div>
                  <div>&bull; Result: <b>1,657.45 USDT REMAINS LOCKED IN ESCROW VAULT PENDING POLICE CLEARANCE</b></div>
                  <div>&bull; Zero capital allowed to exit Indian financial jurisdiction.</div>
                </div>
              </div>
            )}

            {cryptoStep === "CLEAN_APPROVED" && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-mono text-emerald-200 flex justify-between items-center">
                <span>Genuine retail crypto trade verified. No active FIU-IND lien.</span>
                <button
                  onClick={handleResetCrypto}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Crypto Compliance & FIU Info (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  FIU-IND & VASP Protocol
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Coordinated defense bridging traditional banking switches and Virtual Digital Asset (VDA) exchanges.
                </p>
              </div>

              <div className="flex flex-col gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-500">Compliance Authority:</span>
                  <span className="text-slate-900 font-bold">FIU-IND / PMLA</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-500">Escrow Hold Latency:</span>
                  <span className="text-emerald-700 font-bold">&lt; 500ms</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-500">Sybil Wallet Risk:</span>
                  <span className="text-rose-700 font-bold">99.2% (CRITICAL)</span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5 mt-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Why Crypto Defense Matters:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Once fiat is converted into stablecoins (USDT) on an exchange and transferred off-shore, recovery is impossible. PRATYAKSH connects directly with registered Indian VASPs to freeze the P2P escrow transaction at the fiat on-ramp.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
