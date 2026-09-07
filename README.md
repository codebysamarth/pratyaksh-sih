# PRATYAKSH (SIH 26184) 🛡️
### Predictive Cybercrime Cash-Out Hotspot Intelligence Platform

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
5. **Seals Court-Admissible Electronic Evidence** under Section 65B of the Indian Evidence Act / Section 63 of the Bharatiya Sakshya Adhiniyam (BSA) 2023.

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
│  • Auto-geocodes any Indian city / location (e.g. Pune, Kolhapur) │
│  • Dynamically queries real OpenStreetMap ATMs via Overpass API        │
│  • Scores candidate ATMs: Distance, Travel Time, Gang Prior, Kiosk Type│
│  • Generates Section 65B Certified Court Evidence PDF dossiers         │
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

The codebase is strictly decoupled into 3 isolated folders to ensure **100% conflict-free Git collaboration**:

| Developer | Assigned Role | Specification File | Working Folder | Git Branch | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🧠 **Dev 1** | **AI/ML Engine & Backend Microservice** | [`DEV1_AI_BACKEND_SPEC.md`](./DEV1_AI_BACKEND_SPEC.md) | `backend/` | `feature/dev1-ai-backend` | **Completed & Verified (100% Tests Pass)** |
| 🎨 **Dev 2** | **Frontend Command Center & GIS Dashboard** | [`DEV2_FRONTEND_GIS_UI_SPEC.md`](./DEV2_FRONTEND_GIS_UI_SPEC.md) | `frontend/` | `feature/dev2-frontend-ui` | In Progress / Integration |
| ⛓️ **Dev 3** | **Blockchain Consortium & Telegram Bot** | [`DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md`](./DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md) | `blockchain/` | `feature/dev3-blockchain` | In Progress / Integration |

---

## ⚙️ Environment & API Configuration Guide

Before running the full system, configure the optional external services (all services have built-in offline fallbacks for standalone execution):

### 1. 📱 Telegram Field Patrol Bot Configuration (Dev 3)
The Telegram Bot sends live tactical audible alerts with GPS navigation buttons directly to the patrol officer's physical smartphone.

1. Open Telegram on your phone and search for **`@BotFather`**.
2. Type `/newbot` and follow prompts to name your bot (e.g. `PratyakshPatrolBot`).
3. Copy your **HTTP API Token** (e.g. `7123456789:AAH...`).
4. Search for **`@userinfobot`** on Telegram, start a chat, and copy your personal **`Id`** (e.g. `123456789`).
5. Create or edit `blockchain/telegram/bot_config.json`:
   ```json
   {
     "bot_token": "YOUR_TELEGRAM_BOT_TOKEN",
     "chat_id": "YOUR_PERSONAL_CHAT_ID",
     "police_unit_id": "PCR_VAN_18_PUNE"
   }
   ```
> *Note: If no bot token is provided, the backend and frontend continue running in simulated mock mode without error.*

### 2. 🗺️ OpenStreetMap & Geocoding APIs (Dev 1)
- **Zero API Key Required:** Dynamic ATM extraction uses OpenStreetMap Overpass API with multi-mirror failover (`overpass-api.de`, `overpass.kumi.systems`, `maps.mail.ru`).
- Built-in in-memory coordinate caching and deterministic localized fallback ensure zero downtime even if internet is disconnected.

### 3. ⛓️ Blockchain Consortium EVM (Dev 3)
- Uses a local **Hardhat EVM Node** (`http://127.0.0.1:8545`) simulating an inter-bank consortium subnet.
- Pre-funded test accounts and contract deploy scripts are included in `blockchain/`.

---

## 🌐 Network & Port Map

| Microservice | Default Port | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | Next.js 14 Cyber Command Center |
| **AI Backend API** | `http://localhost:8000` | FastAPI (REST endpoints + WebSocket `/ws/threat-stream`) |
| **Swagger API Docs** | `http://localhost:8000/docs` | Interactive OpenAPI documentation & testing interface |
| **Web3 API Bridge** | `http://localhost:8001` | Python Web3 microservice interfacing with EVM |
| **Hardhat EVM Node** | `http://127.0.0.1:8545` | Local private consortium blockchain ledger |
| **Telegram Bot** | Cloud API / Polling | Real-time mobile push listener |

---

## 🚀 How to Run the Project

### Option A: 1-Click Launch (Windows Demo Day) ⚡

Run the automated launcher script from the root directory:
```cmd
run_pratyaksh.bat
```
This automatically launches:
1. Hardhat local blockchain node (`:8545`)
2. Smart contract deployment & Web3 bridge (`:8001`)
3. FastAPI AI / ML predictive backend (`:8000`)
4. Telegram field patrol notification listener
5. Next.js 14 Frontend Command Center (`:3000`) and opens your browser automatically!

---

### Option B: Manual / Microservice-by-Microservice Launch

You can run each component independently in separate terminal windows:

#### 1. Start the AI Backend (Port 8000):
```powershell
# In Terminal 1
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
*Access API Docs:* `http://localhost:8000/docs`

#### 2. Start the Blockchain Local Node & Web3 Bridge (Ports 8545 & 8001):
```powershell
# In Terminal 2: Start Hardhat Node
cd blockchain
npm install
npx hardhat node
```
```powershell
# In Terminal 3: Deploy Contract & Start Bridge Server
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
cd bridge
pip install -r requirements.txt
uvicorn bridge_server:app --port 8001 --reload
```

#### 3. Start the Telegram Patrol Bot:
```powershell
# In Terminal 4
cd blockchain/telegram
python field_patrol_bot.py
```

#### 4. Start the Frontend Command Center (Port 3000):
```powershell
# In Terminal 5
cd frontend
npm install
npm run dev
```
*Access Dashboard:* `http://localhost:3000`

---

## 🧪 Testing & Verification

### Run Backend Unit & Integration Tests:
```powershell
pytest backend/tests/test_backend.py -v
```

**Test Coverage (100% Passed):**
- `test_osm_fetcher_vit_pune`: Verifies dynamic OSM ATM extraction with VIT Pune default.
- `test_geo_math`: Verifies Haversine distance, speed, and corridor waypoints.
- `test_graph_engine_direct`: Tests small-value direct mule transfers.
- `test_graph_engine_fan_out`: Tests multi-hop Fan-Out Smurfing logic for amounts > ₹2,00,000.
- `test_spatial_ranker`: Tests XGBoost spatial scoring and SHAP explainability weights.
- `test_pdf_generation`: Tests Section 65B certified legal PDF binary generation.
- `test_api_endpoints`: Tests `/api/simulate-fraud`, `/api/atms/nearby`, `/api/predict-hotspots`, `/api/export-section65b`.
- `test_websocket_threat_stream`: Tests real-time threat stream handshakes.

---

## 📖 Documentation & Specifications

* **Master Project Context:** [`PRATYAKSH_SIH26184_MASTER_PROJECT_CONTEXT.md`](./PRATYAKSH_SIH26184_MASTER_PROJECT_CONTEXT.md)
* **Master Q&A Guide (Q1–Q15):** [`PRATYAKSH_SIH26184_COMPLETE_QNA_GUIDE.md`](./PRATYAKSH_SIH26184_COMPLETE_QNA_GUIDE.md)
* **Dev 1 Backend Specification:** [`DEV1_AI_BACKEND_SPEC.md`](./DEV1_AI_BACKEND_SPEC.md)
* **Dev 2 Frontend Specification:** [`DEV2_FRONTEND_GIS_UI_SPEC.md`](./DEV2_FRONTEND_GIS_UI_SPEC.md)
* **Dev 3 Blockchain Specification:** [`DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md`](./DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md)

---

## ⚖️ Legal & Regulatory Compliance
* **DPDP Act 2023 (Digital Personal Data Protection Act):** No citizen PII or raw transaction records are stored on-chain; only one-way cryptographic SHA-256 hashes and state transitions are anchored.
* **Section 65B Indian Evidence Act / Section 63 BSA 2023:** Generates tamper-proof, verifiable digital chain-of-custody certificates for legal prosecution in court.
