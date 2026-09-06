# PRATYAKSH (SIH 26184) — DEV 1 SPECIFICATION
# Role: AI/ML Engine, Synthetic Data Engineering & Backend Microservice

> **Instructions for Agent/Developer:**
> You are **Developer 1 (Data Science & Backend AI Engineer)** on Project PRATYAKSH for Smart India Hackathon (SIH 26184: Predictive Cybercrime Cash-Out Hotspot Intelligence).
> Your job is to build the complete **Python / FastAPI Backend, Synthetic Data Generation Engine, 2-Stage Predictive ML Pipeline (NetworkX Graph + XGBoost Spatial Ranker), Dynamic OpenStreetMap ATM Integration (supporting VIT Pune and any India location), and Section 65B PDF Evidence Generator**.
> Build everything modularly so it integrates directly with Dev 2 (Frontend) and Dev 3 (Blockchain & Telegram Bot).

---

## 1. System Architecture & Dev 1 Responsibilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DEV 1 ARCHITECTURE & DATA FLOW                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Synthetic Data Pipeline:                                            │
│    - Complaints Generator (NCRP / 1930 format)                         │
│    - Multi-Hop Mule Graph Generator (with Fan-Out Smurfing logic)      │
│    - Dynamic OSM ATM Extractor (Overpass API for any lat/lon)          │
│                                                                        │
│ 2. Predictive AI Engine:                                               │
│    - Stage 1: NetworkX Graph Router (Mule Path & Fan-out Tracer)       │
│    - Stage 2: XGBoost/LightGBM Geospatial Candidate ATM Ranker         │
│    - Explainability Engine (SHAP-inspired feature weight breakdown)    │
│                                                                        │
│ 3. FastAPI REST & WebSocket Server:                                    │
│    - /api/simulate-fraud (Case ingestion & trigger)                   │
│    - /api/predict-hotspots (2-Stage AI inference)                      │
│    - /api/atms/nearby (Dynamic OSM fetcher with VIT Pune default)      │
│    - /api/export-section65b (Court Evidence PDF generator)             │
│    - WebSocket: /ws/threat-stream (Real-time dashboard pushes)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure to Create

Create your project structure inside `backend/`:
```text
backend/
├── data/
│   ├── generator.py              # Script to generate synthetic datasets
│   ├── complaints_seed.csv       # Pre-seeded historical fraud complaints
│   ├── historical_mule_graph.csv # Past mule transactions for training
│   └── training_labels.csv       # Training labels (ATM chosen vs not)
├── ml/
│   ├── __init__.py
│   ├── graph_engine.py           # NetworkX multi-hop & smurfing tracer
│   ├── spatial_ranker.py         # XGBoost ATM candidate ranking model
│   ├── train_model.py            # Model training & serialization script
│   └── osm_fetcher.py            # Live OpenStreetMap ATM fetcher
├── utils/
│   ├── __init__.py
│   ├── pdf_generator.py          # ReportLab Section 65B legal PDF export
│   └── geo_math.py               # Haversine & travel time calculation
├── app.py                        # FastAPI main application & routes
├── requirements.txt              # Python dependencies
└── tests/
    └── test_backend.py           # Automated unit & integration tests
```

---

## 3. Step-by-Step Implementation Guide

### Step 3.1: Python Dependencies (`backend/requirements.txt`)
```text
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
networkx>=3.2.1
xgboost>=2.0.3
scikit-learn>=1.4.0
pandas>=2.2.0
numpy>=1.26.0
requests>=2.31.0
reportlab>=4.1.0
python-multipart>=0.0.9
pytest>=8.0.0
```

---

### Step 3.2: Synthetic Data Generator (`backend/data/generator.py`)
Must generate realistic data following NCRP (1930) schemas:
1. **Complaints:** Case ID, Timestamp, Fraud Type (`APK_SCAM`, `DIGITAL_ARREST`, `INVESTMENT_SCAM`, `PHISHING`), Stolen Amount (e.g., ₹50,000 to ₹10,00,000), Victim Location.
2. **Mule Multi-Hop Trail:**
   - Layer 1 (Transfer from victim within 5-10 mins).
   - Layer 2/3 (Mule accounts with IP/BTS pings).
   - **Fan-Out Smurfing Logic:** When amount > ₹2,00,000, split into 3 to 6 Layer-2 sub-accounts of ₹40k–₹50k each.
3. **Training Data Generation:** Historical candidate ATMs with features: `distance_km`, `travel_time_mins`, `historical_fraud_count`, `is_standalone_kiosk`, `supports_cardless`, and label `is_cashout_atm` (1 or 0).

---

### Step 3.3: Dynamic OpenStreetMap ATM Fetcher (`backend/ml/osm_fetcher.py`)
This enables the **VIT Pune / Any India Location** demo:
```python
import requests
from typing import List, Dict

# Default: VIT Pune (Bibwewadi, Pune, Maharashtra)
DEFAULT_LAT = 18.4636
DEFAULT_LON = 73.8682

def fetch_real_atms_osm(lat: float = DEFAULT_LAT, lon: float = DEFAULT_LON, radius: int = 2500) -> List[Dict]:
    """
    Queries OpenStreetMap Overpass API for real ATMs within radius meters of lat/lon.
    Falls back to high-quality realistic fallback ATMs if Overpass API is slow/offline.
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json][timeout:10];
    (
      node["amenity"="atm"](around:{radius},{lat},{lon});
      node["amenity"="bank"]["atm"="yes"](around:{radius},{lat},{lon});
    );
    out body;
    """
    try:
        response = requests.get(overpass_url, params={'data': query}, timeout=8)
        if response.status_code == 200:
            data = response.json()
            atms = []
            for elem in data.get('elements', []):
                tags = elem.get('tags', {})
                name = tags.get('name') or tags.get('operator') or f"{tags.get('brand', 'Bank')} ATM"
                atms.append({
                    "atm_id": f"ATM_OSM_{elem['id']}",
                    "name": name,
                    "bank": tags.get('operator', tags.get('brand', 'Scheduled Commercial Bank')),
                    "lat": elem['lat'],
                    "lon": elem['lon'],
                    "is_standalone_kiosk": 1 if "branch" not in name.lower() else 0,
                    "supports_cardless": 1,
                    "historical_fraud_count": (elem['id'] % 7)  # Deterministic realistic prior
                })
            if len(atms) >= 3:
                return atms
    except Exception as e:
        print(f"[Warning] OSM Fetch error: {e}. Using deterministic fallback.")
        
    # Guaranteed fallback centered on the requested lat/lon (e.g. VIT Pune)
    return [
        {
            "atm_id": "ATM_PUN_01",
            "name": "State Bank of India ATM - VIT Main Gate",
            "bank": "SBI",
            "lat": lat + 0.0021,
            "lon": lon + 0.0018,
            "is_standalone_kiosk": 1,
            "supports_cardless": 1,
            "historical_fraud_count": 8
        },
        {
            "atm_id": "ATM_PUN_02",
            "name": "HDFC Bank ATM - Bibwewadi Kondhwa Road",
            "bank": "HDFC",
            "lat": lat - 0.0042,
            "lon": lon + 0.0035,
            "is_standalone_kiosk": 1,
            "supports_cardless": 1,
            "historical_fraud_count": 3
        },
        {
            "atm_id": "ATM_PUN_03",
            "name": "Bank of Maharashtra ATM - Upper Indira Nagar Depot",
            "bank": "Bank of Maharashtra",
            "lat": lat + 0.0065,
            "lon": lon - 0.0028,
            "is_standalone_kiosk": 0,
            "supports_cardless": 0,
            "historical_fraud_count": 1
        },
        {
            "atm_id": "ATM_PUN_04",
            "name": "ICICI Bank ATM - Market Yard Commercial Complex",
            "bank": "ICICI",
            "lat": lat + 0.0089,
            "lon": lon + 0.0062,
            "is_standalone_kiosk": 1,
            "supports_cardless": 1,
            "historical_fraud_count": 5
        }
    ]
```

---

### Step 3.4: Predictive ML Engine (`backend/ml/spatial_ranker.py`)
1. **Feature Calculation:**
   - `distance_km`: Haversine formula from mule signal coordinates to candidate ATM.
   - `travel_time_mins`: Estimated assuming average city transit speed ($25 \text{ km/h}$).
   - `historical_fraud_count`: Prior crime index.
   - `is_standalone_kiosk`: Isolation factor ($1$ or $0$).
   - `supports_cardless`: Exit channel vector.
2. **Model Training & Prediction:**
   - Train an `xgb.XGBClassifier` with `objective='binary:logistic'`.
   - Provide `rank_candidate_atms(mule_lat, mule_lon, candidate_atms)`:
     - Calculates features for each ATM.
     - Runs model inference.
     - Applies Softmax normalization over the candidates to yield clear percentage probabilities (e.g. 82%, 13%, 5%).
     - Returns Top-3 ATMs with SHAP-inspired explanation factors (`top_reasons`).

---

### Step 3.5: Section 65B Evidence PDF Generator (`backend/utils/pdf_generator.py`)
Using `reportlab`:
- Generates a PDF named `PRATYAKSH_LEGAL_EVIDENCE_CASE_<id>.pdf`.
- Contains:
  - Official I4C / MHA Header & Problem Statement ID: 26184.
  - Case Metadata: Victim Name, Reported Amount, Timestamp, Initial Mule Node.
  - **Cryptographic Audit Proof:**
    - `AlertHash = SHA256(CaseID + Timestamp + TopATM + ModelVersion)`
    - `MerkleRootHash = SHA256(...)`
  - Top 3 Predicted ATM Hotspots with Coordinates and Risk Scores.
  - Inter-Agency SLA Log (Alert Sent $\to$ Bank Lien Marked $\to$ Police Dispatched).
  - Legal Certificate Clause under Section 65B Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam 2023.

---

### Step 3.6: FastAPI Application (`backend/app.py`)
Expose the following endpoints:

1. `POST /api/simulate-fraud`
   - Accepts:
     ```json
     {
       "victim_name": "Ramesh Kulkarni",
       "amount": 350000,
       "fraud_type": "DIGITAL_ARREST",
       "center_lat": 18.4636,
       "center_lon": 73.8682,
       "location_name": "VIT Pune, Bibwewadi"
     }
     ```
   - Runs:
     - Generates multi-hop mule trail (with fan-out if amount > ₹2,00,000).
     - Fetches nearby real ATMs.
     - Ranks ATMs and estimates time-to-cashout (e.g., 22 mins).
     - Computes SHA-256 evidence hashes.
     - Broadcasts event over WebSocket `/ws/threat-stream`.
   - Returns full response JSON.

2. `GET /api/atms/nearby?lat=...&lon=...&radius=...`
   - Returns nearby real ATMs for any coordinate.

3. `POST /api/export-section65b`
   - Accepts case data payload and returns streaming PDF download.

4. `WebSocket /ws/threat-stream`
   - Broadcasts real-time events to Dev 2 (Frontend) and Dev 3 (Telegram/Web3).

---

## 4. Testing & Verification Guide (For Developer 1)

### Test 1: Test OSM ATM Fetcher
```bash
python -c "from ml.osm_fetcher import fetch_real_atms_osm; print(fetch_real_atms_osm(18.4636, 73.8682))"
```
*Expected Result:* Array of at least 4 real ATMs around VIT Pune with lat, lon, and bank names.

### Test 2: Train Model & Verify Inference
```bash
python ml/train_model.py
```
*Expected Result:* `pratyaksh_atm_ranker.json` created with AUC > 0.85.

### Test 3: Run FastAPI Server
```bash
uvicorn app:app --reload --port 8000
```
Open `http://localhost:8000/docs` and test `POST /api/simulate-fraud`.

### Test 4: PDF Generator Verification
Test generating a PDF and ensure it opens cleanly with proper tables, hashes, and legal certificate.

---

## 5. Git Collaboration, Push & Merge Instructions (For Developer 1)

### Rule #1: Strict Folder Isolation
- Work **ONLY inside the `backend/` directory**.
- Do **NOT** modify or add files in `frontend/` or `blockchain/`. This ensures 100% conflict-free Git merges.

### Step-by-Step Git Commands:
1. **Create and switch to your dedicated branch:**
   ```bash
   git checkout -b feature/dev1-ai-backend
   ```
2. **Stage and commit your work regularly:**
   ```bash
   git add backend/
   git commit -m "feat(backend): complete ML ranker, OSM fetcher, and FastAPI endpoints"
   ```
3. **Push to GitHub:**
   ```bash
   git push -u origin feature/dev1-ai-backend
   ```
4. **Open a Pull Request (PR):**
   - Go to your repository on GitHub.
   - Click **"Compare & pull request"** from `feature/dev1-ai-backend` into `main`.
   - PR Title: `feat(backend): AI Engine, OSM Integration & FastAPI Microservice`.
   - Click **"Merge pull request"**.

### Integration Contract with Dev 2 & Dev 3:
- **Your Service Port:** `http://localhost:8000`
- **WebSocket Stream:** `ws://localhost:8000/ws/threat-stream` (consumed by Dev 2 Frontend).
- **Web3 Bridge Target:** `http://localhost:8001/chain/log-alert` (calls Dev 3 Bridge).
- **Fallback Guarantee:** If Dev 3 bridge is offline during testing, set `USE_MOCK_CHAIN = True` in `app.py` so your backend generates simulated hashes without erroring.
