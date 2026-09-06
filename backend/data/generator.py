"""
Synthetic Data Generation Engine for PRATYAKSH (SIH 26184).
Generates realistic NCRP 1930 fraud complaints, multi-hop mule transaction trails,
and candidate ATM training matrices.
"""
import os
import random
import pandas as pd
import numpy as np
import sys
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from utils.geo_math import haversine_distance, estimate_travel_time

# Target data directory
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

FRAUD_TYPES = [
    "DIGITAL_ARREST",
    "APK_SCAM",
    "INVESTMENT_SCAM",
    "PART_TIME_JOB_FRAUD",
    "SEBI_IMPERSONATION",
    "PHISHING_OTP",
]

CITIES = [
    {"name": "Pune - Bibwewadi (VIT)", "lat": 18.4636, "lon": 73.8682},
    {"name": "Delhi - Rohini Sec 7", "lat": 28.7041, "lon": 77.1025},
    {"name": "Mumbai - Andheri West", "lat": 19.1363, "lon": 72.8277},
    {"name": "Bengaluru - Koramangala", "lat": 12.9352, "lon": 77.6245},
    {"name": "Hyderabad - Cyberabad", "lat": 17.4483, "lon": 78.3915},
    {"name": "Ahmedabad - SG Highway", "lat": 23.0338, "lon": 72.5186},
]

VICTIM_NAMES = [
    "Ramesh Kulkarni", "Sunita Sharma", "Vikas Deshmukh", "Pooja Hegde",
    "Rajesh Narang", "Ananya Banerjee", "Sanjay Singhal", "Geeta Patel",
    "Dr. Arvind Joshi", "Meera Iyer", "Kishore Bhatt", "Deepa Nair"
]


def generate_complaints_seed(n_records: int = 120) -> pd.DataFrame:
    """
    Generates historical NCRP / 1930 citizen complaints.
    """
    records = []
    base_time = datetime.now() - timedelta(days=30)

    for i in range(1, n_records + 1):
        city = random.choice(CITIES)
        victim = random.choice(VICTIM_NAMES)
        fraud_type = random.choice(FRAUD_TYPES)
        
        # Stolen amount distribution: ₹30,000 to ₹12,00,000
        if fraud_type in ["DIGITAL_ARREST", "INVESTMENT_SCAM"]:
            amount = round(random.uniform(250000, 1200000), 2)
        else:
            amount = round(random.uniform(30000, 240000), 2)

        created_at = base_time + timedelta(hours=i * 5 + random.randint(10, 180))
        lat_jitter = random.uniform(-0.015, 0.015)
        lon_jitter = random.uniform(-0.015, 0.015)

        records.append({
            "case_id": f"NCRP-2024-{1000 + i}",
            "ack_no": f"1930-{20240000 + i}",
            "victim_name": victim,
            "fraud_type": fraud_type,
            "amount_stolen": amount,
            "victim_city": city["name"],
            "victim_lat": round(city["lat"] + lat_jitter, 6),
            "victim_lon": round(city["lon"] + lon_jitter, 6),
            "timestamp": created_at.isoformat(),
            "status": random.choice(["RESOLVED_FUNDS_FROZEN", "CASHOUT_OCCURRED", "UNDER_PATROL"]),
        })

    df = pd.DataFrame(records)
    output_path = os.path.join(DATA_DIR, "complaints_seed.csv")
    df.to_csv(output_path, index=False)
    print(f"[DataGen] Created {len(df)} complaints seed at {output_path}")
    return df


def generate_training_dataset(n_samples: int = 2500) -> pd.DataFrame:
    """
    Generates realistic candidate ATM feature matrices and labels for training XGBoost spatial ranker.
    Label is_cashout_atm = 1 (ATM chosen by mule) or 0 (candidate not chosen).
    """
    rows = []
    np.random.seed(42)
    random.seed(42)

    for i in range(n_samples):
        # Scenario mule location
        m_lat = random.uniform(18.40, 28.80)
        m_lon = random.uniform(72.80, 78.40)

        # Generate 4-6 candidate ATMs around this mule location
        num_candidates = random.randint(4, 6)
        candidates = []

        for c_idx in range(num_candidates):
            dist_km = round(abs(np.random.exponential(scale=1.8)) + 0.1, 2)
            # Cap distance within typical urban mule radius (0.1 to 8 km)
            dist_km = min(dist_km, 8.0)
            
            travel_mins = estimate_travel_time(dist_km)
            hist_fraud = int(np.random.choice([0, 1, 2, 3, 5, 8, 12], p=[0.35, 0.25, 0.15, 0.10, 0.08, 0.05, 0.02]))
            is_standalone = int(np.random.choice([1, 0], p=[0.65, 0.35]))
            supports_cardless = int(np.random.choice([1, 0], p=[0.75, 0.25]))

            # Ground truth cashout heuristic score
            # Mules prefer: Closer distance, lower travel time, high historical prior (isolated/unmonitored), standalone kiosk, cardless
            score = (
                - 1.6 * dist_km
                - 0.08 * travel_mins
                + 0.45 * hist_fraud
                + 1.2 * is_standalone
                + 0.9 * supports_cardless
                + np.random.normal(0, 0.4)
            )
            candidates.append({
                "sample_id": i,
                "candidate_idx": c_idx,
                "distance_km": dist_km,
                "travel_time_mins": travel_mins,
                "historical_fraud_count": hist_fraud,
                "is_standalone_kiosk": is_standalone,
                "supports_cardless": supports_cardless,
                "raw_score": score,
            })

        # The candidate with highest score is the chosen cash-out ATM (label = 1)
        best_cand = max(candidates, key=lambda x: x["raw_score"])
        for cand in candidates:
            cand["is_cashout_atm"] = 1 if cand["candidate_idx"] == best_cand["candidate_idx"] else 0
            del cand["raw_score"]
            rows.append(cand)

    df = pd.DataFrame(rows)
    output_path = os.path.join(DATA_DIR, "training_labels.csv")
    df.to_csv(output_path, index=False)
    print(f"[DataGen] Created {len(df)} ATM ranking training samples at {output_path}")
    return df


if __name__ == "__main__":
    generate_complaints_seed()
    generate_training_dataset()
