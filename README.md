# PRATYAKSH (SIH 26184) 🛡️
### Predictive Cybercrime Cash-Out Intelligence Platform

> **Ministry:** Ministry of Home Affairs (MHA)  
> **Department:** Indian Cyber Crime Coordination Centre (I4C), CIS Division  
> **Problem Statement ID:** 26184  
> **Theme:** Blockchain & Cybersecurity  

---

## 📌 Executive Summary

Every day, over **8,000 cyber financial complaints** are filed across India on the **1930 Helpline** and the National Cybercrime Reporting Portal (NCRP). By the time complaints are processed and formal emails reach banks, "mule runners" on the street have already pulled cash from ATMs, reducing fund recovery to near zero.

**PRATYAKSH** transforms cyber fraud defense from **reactive investigation to proactive intervention**. Operating during the critical **30 to 120-minute "Golden Window"** between fraud transfer and physical cash withdrawal, PRATYAKSH:
1. **Tracks the Multi-Hop Money Trail** across mule layers and fan-out smurfing branches in milliseconds.
2. **Predicts the Top-3 Likely ATM Hotspots** and estimated cash-out time windows using a 2-stage AI pipeline (NetworkX + XGBoost).
3. **Executes Automated Smart Contract Liens** at the bank switch level before cash dispensing can occur.
4. **Dispatches Geofenced Beat Patrol Alerts** directly to local police officers via Telegram.
5. **Seals Court-Admissible Electronic Evidence** under Section 65B of the Indian Evidence Act / Bharatiya Sakshya Adhiniyam (BSA) 2023.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRATYAKSH PROACTIVE INTERVENTION FLOW                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1930 / NCRP Complaint Ingested
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  🧠 AI PREDICTIVE CORE (FastAPI + NetworkX + XGBoost)                  │
│  • Traces mule routing & fan-out smurfing across Layer 1-3 accounts   │
│  • Narrows search using 3-Stage Geo-Funnel (India -> City -> Corridor) │
│  • Dynamically queries real OpenStreetMap ATMs (e.g. VIT Pune)         │
│  • Scores candidate ATMs: Distance, Travel Time, Gang Prior, Kiosk Type│
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Top-3 ATMs Predicted           │ Alert & Evidence Hash
                    ▼                                ▼
┌──────────────────────────────────────┐   ┌─────────────────────────────┐
│ 🎨 CYBER COMMAND CENTER (Next.js 14) │   │ ⛓️ CONSORTIUM BLOCKCHAIN     │
│ • Dark satellite radar map & beacons │   │ • Pre-Dispense Smart Lien   │
│ • Animated money-trail graph         │   │ • Inter-Agency SLA Ledger   │
│ • Interactive ATM simulator          │   │ • Fan-Out Batch Freezes     │
└──────────────────────────────────────┘   └──────────────┬──────────────┘
                                                          │ Push Notification
                                                          ▼
                                           ┌─────────────────────────────┐
                                           │ 📱 TELEGRAM FIELD PATROL    │
                                           │ • Real phone audible alerts │
                                           │ • Inline [Accept Beat] btn  │
                                           │ • Two-way sync to dashboard │
                                           └─────────────────────────────┘
```

---

## 👥 Team Modular Architecture (Independent Workstreams)

The prototype is strictly decoupled into 3 isolated folders to ensure **100% conflict-free Git collaboration**:

| Developer | Assigned Role | Specification File | Working Folder | Git Branch |
| :--- | :--- | :--- | :--- | :--- |
| 🧠 **Dev 1** | **AI/ML Engine & Backend Microservice** | [`DEV1_AI_BACKEND_SPEC.md`](./DEV1_AI_BACKEND_SPEC.md) | `backend/` | `feature/dev1-ai-backend` |
| 🎨 **Dev 2** | **Frontend Command Center & GIS Dashboard** | [`DEV2_FRONTEND_GIS_UI_SPEC.md`](./DEV2_FRONTEND_GIS_UI_SPEC.md) | `frontend/` | `feature/dev2-frontend-ui` |
| ⛓️ **Dev 3** | **Blockchain Consortium & Telegram Bot** | [`DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md`](./DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md) | `blockchain/` | `feature/dev3-blockchain` |

---

## 🌐 Network & Port Map

| Microservice | Default Port | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | Next.js 14 Cyber Command Center |
| **AI Backend API** | `http://localhost:8000` | FastAPI (REST endpoints + WebSocket `/ws/threat-stream`) |
| **Web3 API Bridge** | `http://localhost:8001` | Python Web3 microservice interfacing with EVM |
| **Hardhat EVM Node** | `http://127.0.0.1:8545` | Local private consortium blockchain ledger |
| **Telegram Bot** | Cloud API / Polling | Real-time mobile push listener |

---

## 🚀 1-Click Launch (Demo Day)

On Windows, launch all 5 microservices simultaneously with a single click:

```cmd
run_pratyaksh.bat
```

This starts:
1. Hardhat local blockchain node (`:8545`)
2. Smart contract deployment & Web3 bridge (`:8001`)
3. FastAPI AI / ML predictive backend (`:8000`)
4. Telegram field patrol notification listener
5. Next.js 14 Frontend Command Center (`:3000`) and opens your browser automatically!

---

## 📖 Complete Documentation & References

* **Master Project Context:** [`PRATYAKSH_SIH26184_MASTER_PROJECT_CONTEXT.md`](./PRATYAKSH_SIH26184_MASTER_PROJECT_CONTEXT.md)
* **Master Q&A Guide (Q1–Q15):** [`PRATYAKSH_SIH26184_COMPLETE_QNA_GUIDE.md`](./PRATYAKSH_SIH26184_COMPLETE_QNA_GUIDE.md)
* **Dev 1 Specification:** [`DEV1_AI_BACKEND_SPEC.md`](./DEV1_AI_BACKEND_SPEC.md)
* **Dev 2 Specification:** [`DEV2_FRONTEND_GIS_UI_SPEC.md`](./DEV2_FRONTEND_GIS_UI_SPEC.md)
* **Dev 3 Specification:** [`DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md`](./DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md)

---

## ⚖️ Legal & Regulatory Compliance
* **DPDP Act 2023 (Digital Personal Data Protection Act):** No citizen PII or raw transaction records are stored on-chain; only one-way cryptographic SHA-256 hashes and state transitions are anchored.
* **Section 65B Indian Evidence Act / Section 63 BSA 2023:** Generates tamper-proof, verifiable digital chain-of-custody certificates for legal prosecution in court.
