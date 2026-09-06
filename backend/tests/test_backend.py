"""
Automated Test Suite for PRATYAKSH AI Backend.
Tests OSM fetcher, graph engine, ML ranker, PDF generator, and FastAPI REST/WebSocket endpoints.
"""
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(TESTS_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from utils.geo_math import haversine_distance, estimate_travel_time, calculate_bearing, generate_corridor_waypoints
from utils.pdf_generator import generate_section65b_pdf, compute_sha256
from ml.osm_fetcher import fetch_real_atms_osm, DEFAULT_LAT, DEFAULT_LON
from ml.graph_engine import MuleGraphEngine
from ml.spatial_ranker import SpatialRanker
from app import app


@pytest.fixture
def client():
    return TestClient(app)


def test_osm_fetcher_vit_pune():
    """Verify OSM ATM extractor returns valid ATMs around VIT Pune"""
    atms = fetch_real_atms_osm(lat=DEFAULT_LAT, lon=DEFAULT_LON, radius=2500)
    assert len(atms) >= 3
    for atm in atms:
        assert "atm_id" in atm
        assert "name" in atm
        assert "bank" in atm
        assert "lat" in atm
        assert "lon" in atm
        assert "is_standalone_kiosk" in atm
        assert "supports_cardless" in atm


def test_geo_math():
    """Verify Haversine and travel time math"""
    # Distance between two known points in Pune
    d = haversine_distance(18.4636, 73.8682, 18.4736, 73.8782)
    assert 1.0 < d < 2.0  # Approx 1.5 km
    
    # Travel time for 2.5 km in city
    t = estimate_travel_time(2.5, speed_kmh=25.0)
    assert 5.0 < t < 12.0

    bearing = calculate_bearing(18.4636, 73.8682, 18.4736, 73.8782)
    assert 0 <= bearing <= 360

    waypoints = generate_corridor_waypoints(18.4636, 73.8682, 18.4736, 73.8782, num_steps=4)
    assert len(waypoints) == 5


def test_graph_engine_direct():
    """Verify graph generation for amount <= ₹2,00,000 without fan-out"""
    engine = MuleGraphEngine()
    res = engine.generate_mule_trail(
        case_id="TEST_001",
        victim_name="Ramesh Test",
        amount=150000.0,
        fraud_type="APK_SCAM",
        center_lat=DEFAULT_LAT,
        center_lon=DEFAULT_LON,
    )
    assert res["is_fan_out_smurfing"] is False
    assert res["num_nodes"] >= 3  # Victim, L1, L2
    assert "primary_mule_lat" in res
    assert "primary_mule_account" in res


def test_graph_engine_fan_out():
    """Verify graph generation for amount > ₹2,00,000 with fan-out smurfing"""
    engine = MuleGraphEngine()
    res = engine.generate_mule_trail(
        case_id="TEST_002",
        victim_name="Sanjay HighValue",
        amount=450000.0,
        fraud_type="DIGITAL_ARREST",
        center_lat=DEFAULT_LAT,
        center_lon=DEFAULT_LON,
    )
    assert res["is_fan_out_smurfing"] is True
    assert res["num_nodes"] >= 5  # Victim, L1, multiple L2 smurf accounts
    assert len(res["edges"]) >= 4


def test_spatial_ranker():
    """Verify XGBoost spatial ranker predictions and explainability weights"""
    ranker = SpatialRanker()
    atms = fetch_real_atms_osm(lat=DEFAULT_LAT, lon=DEFAULT_LON, radius=2500)
    ranked = ranker.rank_candidate_atms(
        mule_lat=DEFAULT_LAT,
        mule_lon=DEFAULT_LON,
        candidate_atms=atms,
        top_k=3,
    )
    assert len(ranked) == min(3, len(atms))
    assert ranked[0]["rank"] == 1
    assert ranked[0]["risk_probability"] >= ranked[1]["risk_probability"]
    assert "explainability" in ranked[0]
    assert "top_reasons" in ranked[0]["explainability"]
    
    # Check weight percentage sum
    exp = ranked[0]["explainability"]
    total_pct = (
        exp["distance_weight_pct"]
        + exp["transit_time_weight_pct"]
        + exp["historical_prior_weight_pct"]
        + exp["kiosk_isolation_weight_pct"]
    )
    assert 99.0 <= total_pct <= 101.0


def test_pdf_generation():
    """Verify Section 65B PDF generation returns non-empty valid PDF bytes"""
    case_data = {
        "case_id": "NCRP-2024-TEST",
        "victim_name": "Ramesh Kulkarni",
        "fraud_type": "DIGITAL_ARREST",
        "amount": 350000.0,
        "location_name": "VIT Pune, Bibwewadi",
        "predicted_atms": [
            {
                "name": "SBI ATM - VIT Main Gate",
                "bank": "State Bank of India",
                "lat": 18.4657,
                "lon": 73.8700,
                "distance_km": 0.35,
                "travel_time_mins": 4.5,
                "risk_probability": 82.4,
                "explainability": {"top_reasons": ["Proximity: 0.35 km", "Historical prior: 8 incidents"]},
            }
        ],
    }
    pdf_bytes = generate_section65b_pdf(case_data)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF")


def test_api_endpoints(client):
    """Verify all FastAPI REST endpoints"""
    # Root
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["project"] == "PRATYAKSH (SIH 26184)"

    # Health
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"

    # Nearby ATMs
    r = client.get(f"/api/atms/nearby?lat={DEFAULT_LAT}&lon={DEFAULT_LON}&radius=2000")
    assert r.status_code == 200
    data = r.json()
    assert data["count"] >= 3

    # Simulate Fraud
    sim_payload = {
        "victim_name": "Ramesh Kulkarni",
        "amount": 350000.0,
        "fraud_type": "DIGITAL_ARREST",
        "center_lat": DEFAULT_LAT,
        "center_lon": DEFAULT_LON,
        "location_name": "VIT Pune, Bibwewadi",
    }
    r = client.post("/api/simulate-fraud", json=sim_payload)
    assert r.status_code == 200
    res = r.json()
    assert "case_id" in res
    assert res["is_fan_out_smurfing"] is True
    assert len(res["predicted_atms"]) > 0
    assert "cryptographic_proof" in res
    assert "alert_hash" in res["cryptographic_proof"]

    # Export Section 65B PDF
    r_pdf = client.post("/api/export-section65b", json=res)
    assert r_pdf.status_code == 200
    assert r_pdf.headers["content-type"] == "application/pdf"
    assert r_pdf.content.startswith(b"%PDF")

    # Predict Hotspots direct
    pred_payload = {
        "mule_lat": DEFAULT_LAT,
        "mule_lon": DEFAULT_LON,
    }
    r_pred = client.post("/api/predict-hotspots", json=pred_payload)
    assert r_pred.status_code == 200
    assert len(r_pred.json()["ranked_hotspots"]) > 0


def test_websocket_threat_stream(client):
    """Verify WebSocket connection and initial handshake"""
    with client.websocket_connect("/ws/threat-stream") as ws:
        data = ws.receive_json()
        assert data["event_type"] == "CONNECTED"
        assert "PRATYAKSH Threat Stream Active" in data["message"]
