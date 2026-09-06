# PRATYAKSH (SIH 26184) — DEV 2 SPECIFICATION
# Role: Lead Frontend Engineer & Cyber-Command GIS Dashboard Specialist

> **Instructions for Agent/Developer:**
> You are **Developer 2 (Frontend UI/UX & GIS Visualization Engineer)** on Project PRATYAKSH for Smart India Hackathon (SIH 26184).
> Your goal is to build a **world-class, visually stunning Cyber Command Center** inspired by *Palantir Gotham*, *CrowdStrike Falcon*, and *Darktrace*.
> **Judges must say "WOW" the moment they see this screen.**
> You will build a responsive **Single-Page Application (SPA) with 4 tabbed interactive views**, dynamic dark-mode GIS maps with pulsating radar beacons, animated transaction graphs, an interactive ATM Terminal simulator for judges to test, and a live blockchain explorer.

---

## 1. Visual Design System & Aesthetics

```
┌────────────────────────────────────────────────────────────────────────┐
│                        "CYBER-COMMAND" THEME                           │
├───────────────────┬────────────────────────────────────────────────────┤
│ 🌌 Canvas Base    │ Deep Obsidian Black `#0A0E17`, Navy Slate `#0F172A`│
│ 💎 Surface Cards  │ Glassmorphism: `bg-slate-900/80 backdrop-blur-md`  │
│                   │ Border: `border border-slate-800/80`               │
│ 🚨 Critical Alert │ Glowing Crimson / Neon Coral `#FF3366`, `#EF4444`   │
│ ⚡ AI & Predict   │ Neon Electric Cyan `#00F0FF`, Sky `#38BDF8`        │
│ ⛓️ Blockchain     │ Holographic Violet `#8B5CF6`, Emerald `#10B981`    │
│ 🔤 Typography     │ Plus Jakarta Sans (Headings), JetBrains Mono (Codes│
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure to Create

Create your project structure inside `frontend/`:
```text
frontend/
├── package.json
├── tailwind.config.js
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Master Single-Page App with Tab Switching
│   ├── components/
│   │   ├── Navbar.tsx            # High-tech header with Live Threat LED
│   │   ├── views/
│   │   │   ├── CommandCenter.tsx # Tab 1: Hero View (Map + Stream + Actions)
│   │   │   ├── CaseDeepDive.tsx  # Tab 2: Transaction Graph & SHAP Explain
│   │   │   ├── ATMSimulator.tsx  # Tab 3: Interactive Judge Playground
│   │   │   └── LedgerExplorer.tsx# Tab 4: Blockchain Explorer & SLA Tracker
│   │   ├── map/
│   │   │   ├── RadarMap.tsx      # Leaflet / Mapbox Dark-Mode Satellite Map
│   │   │   └── RadarBeacon.tsx   # Pulsating CSS radar halo animation
│   │   ├── graph/
│   │   │   └── MoneyTrailGraph.tsx # Animated node network (React Flow / SVG)
│   │   └── ui/
│   │       ├── GlassCard.tsx
│   │       ├── CyberBadge.tsx
│   │       └── CountdownTimer.tsx
│   ├── hooks/
│   │   ├── useThreatStream.ts    # WebSocket hook to Dev 1 Backend
│   │   └── useCaseSimulation.ts  # State management for active case
│   └── lib/
│       ├── api.ts                # REST client to Dev 1 FastAPI
│       └── mockData.ts           # Instant demo fallback data (VIT Pune)
└── tests/
    └── ui_smoke_test.spec.ts     # Verification test
```

---

## 3. The 4 Hero Views (Detailed Specifications)

### Tab 1: Master Command Center (The Hero Screen)
The default view when opening the application:
1. **Top Sub-Bar:**
   - Location Selector: Dropdown with `[📍 VIT Pune (Bibwewadi, Maharashtra)]`, `[📍 Delhi - Rohini Sector 7]`, `[📍 Mumbai - Andheri West]`, plus a button `[🎯 Drop Pin on Map]`.
   - Action Button: `[ ⚡ Trigger Live 1930 Fraud Simulation ]` (calls Dev 1 `POST /api/simulate-fraud`).
2. **3-Column Layout:**
   - **Left Column (25% width) — Live 1930 Threat Stream:**
     - Displays incoming case cards (`#26184-PUN`, `₹3,50,000`, `Digital Arrest`).
     - Shows progressive status badges: `DETECTED` $\to$ `AI PREDICTED` $\to$ `LIEN REQUESTED`.
   - **Center Column (50% width) — GIS Predictive Radar Map:**
     - Dark-themed satellite tiles (CartoDB Dark Matter / Mapbox Dark).
     - Centered by default on **VIT Pune (`18.4636, 73.8682`)**.
     - **Pulsating Radar Rings (Beacon Animation):**
       - 🔴 Rank 1 ATM (e.g. *SBI ATM - VIT College Gate*): Pulsating red radar halo (`82% Risk | ETA 8 mins`).
       - 🟠 Rank 2 ATM (e.g. *HDFC ATM - Bibwewadi Road*): Amber ring (`13% Risk | ETA 14 mins`).
       - ⚪ Rank 3 ATM (e.g. *Bank of Maharashtra ATM*): Yellow ring (`5% Risk | ETA 18 mins`).
     - Neon dashed cyan line showing the **travel corridor** from last mule IP signal to Rank-1 ATM.
     - Clicking any ATM opens a sleek glassmorphic popup showing distance, kiosk status, and fast-action buttons.
   - **Right Column (25% width) — Proactive Action Panel:**
     - **Countdown Widget:** `⏳ 22m 14s Remaining until Cash-Out Window Closes`.
     - **Button 1:** `[ 🔒 Auto-Trigger Smart Contract Bank Lien ]` $\to$ Turns green with badge `LIEN ACTIVE` and shows block hash `0x8f...e2a`.
     - **Button 2:** `[ 🚔 Dispatch Beat Police Patrol ]` $\to$ Triggers Telegram Bot (Dev 3) and shows `PCR Van 18 Dispatched`.

---

### Tab 2: Case Deep-Dive & AI Explainability (The "Why" View)
1. **Interactive Multi-Hop Money Graph:**
   - Nodes: `Victim (Pune)` $\to$ `Layer 1 Mule` $\to$ `Layer 2 Mule (Bibwewadi)` $\to$ `Candidate ATM`.
   - **Fan-Out Smurfing Visualizer:** If amount > ₹2,00,000, shows the money splitting into 3 parallel branches with glowing particle pulses travelling along the edges.
2. **AI Feature Importance Chart (SHAP Weights):**
   - Bar chart or radar chart explaining **WHY** the AI picked Rank-1 ATM:
     - Distance from last IP: $40\%$ weight
     - Road Transit Travel Time: $30\%$ weight
     - Historical Gang Cash-out Prior: $20\%$ weight
     - Standalone 24/7 Kiosk Isolation: $10\%$ weight
3. **Legal Document Button:**
   - Big glowing button: `[ 📄 Download Section 65B Certified Legal Evidence PDF ]`.
   - Downloads the cryptographically signed court report generated by Dev 1 backend.

---

### Tab 3: Interactive ATM Terminal Simulator (The Judge Playground)
This is an interactive feature designed to let judges test the system:
1. **Visual:** Render a photorealistic ATM touchscreen bezel (Keypad, Card Slot, Cash Dispenser).
2. **Interaction Flow:**
   - Step 1: Judge clicks "Insert Mule Card" (auto-fills Card Hash `0x9a3c...`).
   - Step 2: Screen prompts: "Enter PIN & Amount" (Judge types PIN and enters `₹50,000`).
   - Step 3: Judge clicks **"WITHDRAW CASH"**.
3. **The Climax:**
   - The screen flashes red with alarm audio:
     ```text
     ❌ TRANSACTION DECLINED
     REASON: ACTIVE ON-CHAIN SMART LIEN BY I4C CONSORTIUM
     BLOCK REFERENCE: #1042 (Tx: 0x9b3f...e82a)
     FUNDS FROZEN AT NPCI SWITCH LEVEL
     ```
   - Cash dispenser stays locked. Proves to the judge that the cash-out was prevented!

---

### Tab 4: Consortium Blockchain Explorer (The Trust View)
1. **Live Block Stream:**
   - Table of recently mined blocks on the local testnet.
   - Shows: Block Number, Event (`ALERT_ISSUED`, `LIEN_MARKED`, `DISPATCH_ACK`), Agency Signer (I4C Node, HDFC Node, Police Node), and SHA-256 Hash.
2. **Inter-Agency SLA Tracker Table:**
   - Eliminates the inter-agency blame game:
     - `10:06:12` — I4C AI Alert Generated
     - `10:07:05` — Bank Node Lien Marked (Response: **53 seconds**)
     - `10:08:42` — Police Beat Patrol Acknowledged (Response: **1m 37s**)
   - Displays total inter-agency response time badge: `⏱️ 2m 30s (Well inside 45-min Golden Window)`.

---

## 4. Frontend Tech Stack & Dependencies (`frontend/package.json`)

```json
{
  "name": "pratyaksh-command-center",
  "version": "1.0.0",
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "lucide-react": "^0.344.0",
    "framer-motion": "^11.0.8",
    "recharts": "^2.12.2",
    "reactflow": "^11.10.4",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "typescript": "^5.3.3",
    "@types/node": "^20.11.24",
    "@types/react": "^18.2.61",
    "@types/leaflet": "^1.9.8"
  }
}
```

---

## 5. Radar Halo Pulse Animation (Tailwind CSS in `globals.css`)

```css
@keyframes radar-pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

.animate-radar {
  animation: radar-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

---

## 6. Testing & Verification Guide (For Developer 2)

### Test 1: Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`. Ensure:
- Dark cyber aesthetic loads cleanly.
- Top navigation toggles seamlessly across all 4 Views without full page reload.

### Test 2: Map Radar Verification
- Verify Leaflet map loads with dark satellite tiles centered at VIT Pune (`18.4636, 73.8682`).
- Verify pulsating red beacon renders over Rank-1 ATM.

### Test 3: ATM Simulator Interaction
- Go to Tab 3 (ATM Simulator).
- Click "Insert Card", type `50000`, click "Withdraw".
- Ensure the red "TRANSACTION DECLINED: SMART LIEN" modal triggers reliably.

### Test 4: WebSocket End-to-End Test
- With Dev 1 backend running on port 8000, click "Trigger Live 1930 Fraud Simulation".
- Check that the live map zooms to the new coordinates, pins update dynamically, and the countdown timer begins immediately.

---

## 7. Git Collaboration, Push & Merge Instructions (For Developer 2)

### Rule #1: Strict Folder Isolation
- Work **ONLY inside the `frontend/` directory**.
- Do **NOT** modify or add files in `backend/` or `blockchain/`. This guarantees zero Git merge conflicts when merging into `main`.

### Step-by-Step Git Commands:
1. **Create and switch to your dedicated branch:**
   ```bash
   git checkout -b feature/dev2-frontend-ui
   ```
2. **Stage and commit your work regularly:**
   ```bash
   git add frontend/
   git commit -m "feat(ui): complete Cyber Command Center, GIS radar map, and ATM simulator"
   ```
3. **Push to GitHub:**
   ```bash
   git push -u origin feature/dev2-frontend-ui
   ```
4. **Open a Pull Request (PR):**
   - Open GitHub in your browser.
   - Click **"Compare & pull request"** from `feature/dev2-frontend-ui` into `main`.
   - PR Title: `feat(frontend): Command Center SPA, Dark Satellite Map & Interactive Simulator`.
   - Click **"Merge pull request"**.

### Integration Contract with Dev 1 & Dev 3:
- **Your App Port:** `http://localhost:3000`
- **Backend Connection:** Requests sent to `http://localhost:8000/api/simulate-fraud` and WebSocket `ws://localhost:8000/ws/threat-stream`.
- **Web3 ATM Simulator Check:** Requests sent to `http://localhost:8001/chain/verify-card`.
- **Offline Mock Fallback:** If Dev 1 or Dev 3 are not running yet, keep `USE_MOCK = true` in `lib/api.ts` to test all 4 views (including VIT Pune map and denied ATM cashout) with realistic mock data!
