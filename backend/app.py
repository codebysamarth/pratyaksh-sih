"""
PRATYAKSH (SIH 26184) - FastAPI AI Backend Microservice.
AI/ML Engine, NetworkX Graph Smurfing Tracer, XGBoost Spatial Ranker,
Dynamic OSM ATM Extractor, Section 65B Legal Evidence PDF & WebSocket Threat Stream.
"""
import os
import sys
import json
import asyncio
import hashlib
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field

# Ensure root backend dir is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from utils.geo_math import haversine_distance, estimate_travel_time
from utils.pdf_generator import generate_section65b_pdf, compute_sha256
from ml.osm_fetcher import fetch_real_atms_osm, geocode_city_or_location, DEFAULT_LAT, DEFAULT_LON
from ml.graph_engine import MuleGraphEngine
from ml.spatial_ranker import SpatialRanker

app = FastAPI(
    title="PRATYAKSH AI & Geospatial Backend",
    description="SIH 26184: Predictive Cybercrime Cash-Out Hotspot Intelligence Microservice",
    version="2.4.0",
)

# Enable CORS for Next.js frontend (localhost:3000) and any local clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize singletons
graph_engine = MuleGraphEngine()
spatial_ranker = SpatialRanker()

# In-memory case cache for quick retrieval
CASE_CACHE: Dict[str, Dict[str, Any]] = {}
WEB3_BRIDGE_URL = "http://localhost:8001/chain/log-alert"
USE_MOCK_CHAIN = True


# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        living_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
                living_connections.append(connection)
            except Exception:
                pass
        self.active_connections = living_connections


manager = ConnectionManager()


# --- Pydantic Request / Response Models ---
class SimulateFraudRequest(BaseModel):
    victim_name: str = Field(default="Ramesh Kulkarni")
    amount: float = Field(default=350000.0, description="Defrauded amount in INR")
    fraud_type: str = Field(default="DIGITAL_ARREST", description="Fraud category")
    center_lat: Optional[float] = Field(default=None, description="Latitude for incident epicenter (optional, auto-geocoded from location_name)")
    center_lon: Optional[float] = Field(default=None, description="Longitude for incident epicenter (optional, auto-geocoded from location_name)")
    location_name: str = Field(default="VIT Pune, Bibwewadi", description="Human readable area or City (e.g., Kolhapur, Pune, Mumbai, Delhi)")


class HelplineCallRequest(BaseModel):
    caller_phone: str = Field(default="+91 98220 12345", description="Victim phone number calling 1930")
    victim_name: str = Field(default="Suresh Patil", description="Name of complainant")
    amount: float = Field(default=420000.0, description="Amount lost in INR")
    fraud_type: str = Field(default="DIGITAL_ARREST", description="Category: DIGITAL_ARREST, APK_SCAM, INVESTMENT_SCAM")
    city_or_location: str = Field(default="Kolhapur, Maharashtra", description="City / area where victim is situated")
    suspect_upi_or_account: Optional[str] = Field(default="paytmqr2810@paytm", description="Mule account/UPI ID")


class PredictHotspotsRequest(BaseModel):
    mule_lat: float
    mule_lon: float
    candidate_atms: Optional[List[Dict[str, Any]]] = None
    radius: Optional[int] = 2500


# --- REST Endpoints ---

@app.get("/")
def read_root():
    return {
        "project": "PRATYAKSH (SIH 26184)",
        "service": "AI/ML & Geospatial Microservice",
        "status": "ONLINE",
        "model_loaded": spatial_ranker.model is not None,
        "default_hotspot": "VIT Pune (Bibwewadi)",
        "active_ws_clients": len(manager.active_connections),
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "graph_engine": "ready",
        "spatial_ranker": "ready" if spatial_ranker.model is not None else "heuristic_fallback",
        "osm_fetcher": "ready",
    }


@app.post("/api/1930-helpline/call")
async def simulate_helpline_call(payload: HelplineCallRequest):
    """
    Simulates a citizen dialing 1930 National Cyber Helpline (IVR Triage).
    Verifies phone, geocodes the location (e.g. Kolhapur), isolates mule, and triggers live AI prediction.
    """
    # 1. Geocode city / area
    geo = geocode_city_or_location(payload.city_or_location)
    
    # 2. Forward to simulate fraud engine
    fraud_req = SimulateFraudRequest(
        victim_name=payload.victim_name,
        amount=payload.amount,
        fraud_type=payload.fraud_type,
        center_lat=geo["lat"],
        center_lon=geo["lon"],
        location_name=geo["display"],
    )
    result = await simulate_fraud(fraud_req)
    result["helpline_call"] = {
        "caller_phone": payload.caller_phone,
        "call_status": "IVR_VERIFIED_CONNECTED",
        "sla_dispatch": "NATIONAL_THREAT_MAP_SYNCED",
    }
    return result


@app.post("/api/simulate-fraud")
async def simulate_fraud(payload: SimulateFraudRequest):
    """
    Simulates a live 1930 Cybercrime incident:
    1. Geocodes location (Kolhapur, Pune, Mumbai, Delhi, or custom coords).
    2. Traces multi-hop money flow & fan-out smurfing.
    3. Dynamically pulls real candidate ATMs via OSM.
    4. Runs 2-stage spatial ranker with SHAP feature explainability.
    5. Computes SHA-256 evidence hashes & Merkle root proof.
    6. Broadcasts event over WebSocket `/ws/threat-stream`.
    """
    case_num = len(CASE_CACHE) + 1
    case_id = f"NCRP-2024-PUN{1000 + case_num}"
    now = datetime.now()

    # Dynamic Geocode Resolution if lat/lon not explicitly set or default
    eff_lat = payload.center_lat
    eff_lon = payload.center_lon
    if eff_lat is None or eff_lon is None:
        geo = geocode_city_or_location(payload.location_name)
        eff_lat = geo["lat"]
        eff_lon = geo["lon"]
        payload.location_name = geo["display"]

    # 1. Multi-hop Mule Trail Generation
    trail = graph_engine.generate_mule_trail(
        case_id=case_id,
        victim_name=payload.victim_name,
        amount=payload.amount,
        fraud_type=payload.fraud_type,
        center_lat=eff_lat,
        center_lon=eff_lon,
        start_time=now,
    )

    mule_lat = trail["primary_mule_lat"]
    mule_lon = trail["primary_mule_lon"]

    # 2. Dynamic Real ATM Retrieval
    raw_atms = fetch_real_atms_osm(lat=mule_lat, lon=mule_lon, radius=2800, area_name=payload.location_name)

    # 3. XGBoost Geospatial Inference & Softmax Calibration
    ranked_atms = spatial_ranker.rank_candidate_atms(
        mule_lat=mule_lat,
        mule_lon=mule_lon,
        candidate_atms=raw_atms,
        top_k=5,
    )

    top_atm = ranked_atms[0] if ranked_atms else {}
    top_atm_name = top_atm.get("name", "SBI ATM - VIT Main Gate")

    # 4. Cryptographic Proof & SLA Calculation
    model_version = "PRATYAKSH_XGB_v2.4"
    alert_hash = compute_sha256(f"{case_id}:{now.isoformat()}:{top_atm_name}:{model_version}")
    merkle_root = compute_sha256(f"{alert_hash}:{trail['primary_mule_account']}:{payload.amount}:{payload.fraud_type}")
    simulated_tx_hash = "0x" + compute_sha256(f"BLOCK_TX_{case_id}_{alert_hash}")[:64]

    # Attempt logging to Dev 3 Web3 Bridge if active and mock chain is disabled
    contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    if not USE_MOCK_CHAIN:
        try:
            bridge_resp = requests.post(
                WEB3_BRIDGE_URL,
                json={
                    "case_id": case_id,
                    "top_atm": top_atm_name,
                    "mule_account": trail["primary_mule_account"],
                },
                timeout=0.5,
            )
            if bridge_resp.status_code == 200:
                bridge_data = bridge_resp.json()
                simulated_tx_hash = bridge_data.get("tx_hash", simulated_tx_hash)
                contract_address = bridge_data.get("contract_address", contract_address)
        except Exception:
            # Fallback to local deterministic mock EVM state
            pass

    # Cash-out window countdown (e.g. 22m 14s)
    top_travel_time = top_atm.get("travel_time_mins", 8.0)
    cashout_window_seconds = int(max(600, (top_travel_time * 60) + 900))

    response_data = {
        "case_id": case_id,
        "ack_no": f"1930-{now.strftime('%Y%m%d%H%M')}-{case_num}",
        "timestamp": now.isoformat(),
        "victim_name": payload.victim_name,
        "amount": payload.amount,
        "fraud_type": payload.fraud_type,
        "location_name": payload.location_name,
        "center_coordinates": {"lat": payload.center_lat, "lon": payload.center_lon},
        "mule_signal_coordinates": {"lat": mule_lat, "lon": mule_lon},
        "is_fan_out_smurfing": trail["is_fan_out_smurfing"],
        "primary_mule_node": trail["active_cashout_node"],
        "primary_mule_holder": trail["primary_mule_holder"],
        "primary_mule_bank": trail["primary_mule_bank"],
        "primary_mule_account": trail["primary_mule_account"],
        "graph_data": {
            "nodes": trail["nodes"],
            "edges": trail["edges"],
            "num_nodes": trail["num_nodes"],
            "num_edges": trail["num_edges"],
        },
        "predicted_atms": ranked_atms,
        "top_predicted_atm": top_atm,
        "cashout_window_seconds": cashout_window_seconds,
        "cashout_window_display": f"{cashout_window_seconds // 60}m {cashout_window_seconds % 60}s",
        "cryptographic_proof": {
            "alert_hash": alert_hash,
            "merkle_root": merkle_root,
            "contract_address": contract_address,
            "tx_hash": simulated_tx_hash,
            "model_version": model_version,
            "legal_section": "Section 65B Indian Evidence Act / Section 63 BSA 2023",
        },
        "sla_timeline": [
            {"time": "T+00:00", "action": "Citizen 1930 Complaint Ingested", "status": "LOGGED"},
            {"time": "T+00:03", "action": "NetworkX Multi-Hop Smurfing Engine Traced Dispersion", "status": "ISOLATED"},
            {"time": "T+00:05", "action": f"XGBoost Identified Hotspot ({top_atm.get('risk_probability', 82)}% Risk)", "status": "PREDICTED"},
            {"time": "T+00:06", "action": "Smart Contract Pre-Dispense Lien Marked", "status": "LIEN_REQUESTED"},
            {"time": "T+00:08", "action": "Telegram Tactical Alert Sent to LEA Beat Patrol", "status": "DISPATCHED"},
        ],
        "status": "AI_PREDICTED",
    }

    # Store in memory
    CASE_CACHE[case_id] = response_data

    # 5. Broadcast to all active WebSocket listeners (Frontend & Telegram)
    await manager.broadcast({
        "event_type": "THREAT_DETECTED",
        "case_id": case_id,
        "victim_name": payload.victim_name,
        "amount": payload.amount,
        "fraud_type": payload.fraud_type,
        "location": payload.location_name,
        "top_atm": top_atm_name,
        "risk_probability": top_atm.get("risk_probability", 82.0),
        "eta_mins": top_atm.get("travel_time_mins", 8.0),
        "is_fan_out": trail["is_fan_out_smurfing"],
        "alert_hash": alert_hash,
        "tx_hash": simulated_tx_hash,
        "timestamp": now.isoformat(),
    })

    return response_data


@app.post("/api/predict-hotspots")
def predict_hotspots(payload: PredictHotspotsRequest):
    """
    Direct endpoint to rank ATMs around any given mule coordinates.
    """
    candidates = payload.candidate_atms
    if not candidates:
        candidates = fetch_real_atms_osm(lat=payload.mule_lat, lon=payload.mule_lon, radius=payload.radius or 2500)

    ranked = spatial_ranker.rank_candidate_atms(
        mule_lat=payload.mule_lat,
        mule_lon=payload.mule_lon,
        candidate_atms=candidates,
        top_k=5,
    )
    return {
        "mule_lat": payload.mule_lat,
        "mule_lon": payload.mule_lon,
        "candidates_evaluated": len(candidates),
        "ranked_hotspots": ranked,
    }


@app.get("/api/atms/nearby")
def get_nearby_atms(
    lat: float = Query(default=DEFAULT_LAT, description="Latitude"),
    lon: float = Query(default=DEFAULT_LON, description="Longitude"),
    radius: int = Query(default=2500, description="Search radius in meters"),
):
    """
    Returns nearby OpenStreetMap ATMs for any lat/lon in India with VIT Pune default.
    """
    atms = fetch_real_atms_osm(lat=lat, lon=lon, radius=radius)
    return {
        "query_lat": lat,
        "query_lon": lon,
        "radius_meters": radius,
        "count": len(atms),
        "atms": atms,
    }


@app.post("/api/export-section65b")
def export_section65b(payload: Dict[str, Any]):
    """
    Generates and streams the Section 65B Certified Legal Evidence PDF.
    """
    try:
        pdf_bytes = generate_section65b_pdf(payload)
        case_id = payload.get("case_id", "EVIDENCE")
        filename = f"PRATYAKSH_LEGAL_EVIDENCE_CASE_{case_id}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {str(e)}")


@app.get("/api/cases")
def list_seeded_cases():
    """
    Returns seeded historical fraud complaints from CSV seed file.
    """
    csv_path = os.path.join(BASE_DIR, "data", "complaints_seed.csv")
    if os.path.exists(csv_path):
        import pandas as pd
        df = pd.read_csv(csv_path)
        return {"total": len(df), "cases": df.to_dict(orient="records")}
    return {"total": len(CASE_CACHE), "cases": list(CASE_CACHE.values())}


class DispatchPatrolRequest(BaseModel):
    case_id: str = "CASE_26184_PUN_042"
    atm_name: str = "SBI ATM - VIT Pune Main Gate"
    eta_mins: int = 8
    amount: str = "3,50,000"
    lat: Optional[float] = None
    lon: Optional[float] = None


@app.post("/api/dispatch-patrol")
async def api_dispatch_patrol(payload: DispatchPatrolRequest):
    """
    Direct Telegram Dispatch endpoint.
    Sends high-priority push alert directly to on-duty police officer's Telegram with GPS navigation.
    """
    cfg_path = os.path.join(BASE_DIR, "..", "blockchain", "telegram", "bot_config.json")
    bot_token = ""
    chat_id = ""
    if os.path.exists(cfg_path):
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                c = json.load(f)
                bot_token = c.get("BOT_TOKEN", "")
                chat_id = str(c.get("CHAT_ID", ""))
        except Exception:
            pass

    if not bot_token:
        bot_token = "8602710035:AAGLdlmik_aGqIL8KL2H8vxwqTF0tvojMEc"
    if not chat_id:
        chat_id = "8049856894"

    coords_line = f"🌐 <b>GPS Coords:</b> <code>{payload.lat:.4f}, {payload.lon:.4f}</code>\n" if (payload.lat and payload.lon) else ""
    if payload.lat and payload.lon:
        maps_url = f"https://www.google.com/maps/dir/?api=1&destination={payload.lat},{payload.lon}"
    else:
        maps_url = f"https://maps.google.com/?q={payload.atm_name.replace(' ', '+')}"

    msg_text = (
        "🚨 <b>I4C PRATYAKSH FIELD ALERT</b> 🚨\n\n"
        "⚠️ <b>CRITICAL:</b> High-Probability Cash-Out Predicted\n"
        f"📁 <b>Case ID:</b> <code>{payload.case_id}</code>\n"
        f"💰 <b>Defrauded Amount:</b> <code>₹{payload.amount}</code>\n"
        f"📍 <b>Target ATM:</b> <b>{payload.atm_name}</b>\n"
        f"{coords_line}"
        f"⏳ <b>Est. Arrival Window:</b> <code>{payload.eta_mins} mins remaining</code>\n\n"
        "🔴 Immediate beat police interception requested!\n\n"
        "<i>Tap 'Accept Beat Patrol' or 'Open Turn-by-Turn GPS' below:</i>"
    )

    keyboard = {
        "inline_keyboard": [
            [
                {"text": "🚔 Accept Beat Patrol", "callback_data": f"ACCEPT:{payload.case_id}"},
                {"text": "🗺️ Open Turn-by-Turn GPS", "url": maps_url},
            ],
            [
                {"text": "ℹ️ Case Details", "callback_data": f"DETAILS:{payload.case_id}"},
            ],
        ]
    }

    import urllib.request
    req_body = json.dumps({
        "chat_id": chat_id,
        "text": msg_text,
        "parse_mode": "HTML",
        "reply_markup": keyboard,
    }).encode("utf-8")

    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        req = urllib.request.Request(url, data=req_body, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return {"status": "DISPATCH_BROADCASTED", "telegram_status": "SENT_LIVE_TO_TELEGRAM", "tg_response": data}
    except Exception as e:
        return {"status": "DISPATCH_BROADCASTED", "telegram_status": f"ERROR: {str(e)}"}


# --- WebSocket Stream ---
@app.websocket("/ws/threat-stream")
async def threat_stream(websocket: WebSocket):
    """
    WebSocket endpoint consumed by Dev 2 Next.js Dashboard and Dev 3 Telegram bot.
    """
    await manager.connect(websocket)
    # Send initial handshake
    await websocket.send_text(json.dumps({
        "event_type": "CONNECTED",
        "message": "PRATYAKSH Threat Stream Active",
        "timestamp": datetime.now().isoformat(),
    }))
    try:
        while True:
            # Keep-alive receive loop
            data = await websocket.receive_text()
            # Echo or acknowledge if client pings
            if data == "PING":
                await websocket.send_text(json.dumps({"event_type": "PONG", "timestamp": datetime.now().isoformat()}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
