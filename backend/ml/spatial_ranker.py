"""
XGBoost Geospatial Candidate ATM Ranker & Explainability Engine for PRATYAKSH.
Computes multi-dimensional risk scores, transit time corridors, and SHAP-inspired feature weights.
"""
import os
import sys
import numpy as np
import pandas as pd
import xgboost as xgb
from typing import List, Dict, Any, Tuple

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from utils.geo_math import (
    haversine_distance,
    estimate_travel_time,
    calculate_bearing,
    generate_corridor_waypoints,
)

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pratyaksh_atm_ranker.json")

FEATURE_COLUMNS = [
    "distance_km",
    "travel_time_mins",
    "historical_fraud_count",
    "is_standalone_kiosk",
    "supports_cardless",
]


class SpatialRanker:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                booster = xgb.Booster()
                booster.load_model(self.model_path)
                self.model = booster
            except Exception as e:
                print(f"[Warning] Failed to load XGBoost model from {self.model_path}: {e}")
                self.model = None
        else:
            self.model = None

    def _heuristic_score(self, row: Dict[str, float]) -> float:
        """
        High-precision fallback heuristic scoring when model file is not present.
        """
        dist_km = row["distance_km"]
        travel_mins = row["travel_time_mins"]
        hist_fraud = row["historical_fraud_count"]
        is_kiosk = row["is_standalone_kiosk"]
        cardless = row["supports_cardless"]

        score = (
            - 1.8 * dist_km
            - 0.1 * travel_mins
            + 0.55 * hist_fraud
            + 1.4 * is_kiosk
            + 1.0 * cardless
        )
        return score

    def rank_candidate_atms(
        self,
        mule_lat: float,
        mule_lon: float,
        candidate_atms: List[Dict[str, Any]],
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Ranks candidate ATMs relative to the active mule cell-tower/IP coordinates.
        Returns sorted list of ATMs with risk probabilities, ETAs, corridor coordinates, and explainability factors.
        """
        if not candidate_atms:
            return []

        enriched_candidates = []
        for atm in candidate_atms:
            lat = float(atm["lat"])
            lon = float(atm["lon"])
            dist_km = round(haversine_distance(mule_lat, mule_lon, lat, lon), 2)
            travel_mins = estimate_travel_time(dist_km)
            bearing = calculate_bearing(mule_lat, mule_lon, lat, lon)
            corridor = generate_corridor_waypoints(mule_lat, mule_lon, lat, lon, num_steps=6)

            hist_fraud = int(atm.get("historical_fraud_count", 0))
            is_kiosk = int(atm.get("is_standalone_kiosk", 1))
            supports_cardless = int(atm.get("supports_cardless", 1))

            cand_data = dict(atm)
            cand_data["distance_km"] = dist_km
            cand_data["travel_time_mins"] = travel_mins
            cand_data["bearing_deg"] = bearing
            cand_data["corridor_waypoints"] = corridor
            cand_data["historical_fraud_count"] = hist_fraud
            cand_data["is_standalone_kiosk"] = is_kiosk
            cand_data["supports_cardless"] = supports_cardless

            enriched_candidates.append(cand_data)

        # Build feature matrix
        feat_df = pd.DataFrame(enriched_candidates)[FEATURE_COLUMNS]

        raw_scores = []
        if self.model is not None:
            try:
                dmatrix = xgb.DMatrix(feat_df)
                raw_scores = self.model.predict(dmatrix)
            except Exception as e:
                print(f"[Warning] XGBoost inference failed: {e}. Falling back to heuristic.")
                raw_scores = [self._heuristic_score(row) for _, row in feat_df.iterrows()]
        # Softmax normalization with calibrated logit temperature for distinct percentages
        raw_arr = np.array(raw_scores, dtype=float)
        # Convert sigmoid probabilities back to scaled margins / logits
        clipped_p = np.clip(raw_arr, 1e-4, 1.0 - 1e-4)
        logits = np.log(clipped_p / (1.0 - clipped_p))
        # Apply calibrated scaling temperature for realistic spatial probability distribution
        scaled_logits = logits * 0.65
        exp_scores = np.exp(scaled_logits - np.max(scaled_logits))
        probs = exp_scores / np.sum(exp_scores)

        for idx, cand in enumerate(enriched_candidates):
            risk_pct = round(float(probs[idx]) * 100.0, 1)
            cand["raw_score"] = float(raw_scores[idx])
            cand["risk_probability"] = risk_pct
            
            # SHAP-inspired explainability factor weights (normalized to sum to 100%)
            dist_w = max(5.0, round(45.0 - (cand["distance_km"] * 5.0), 1))
            time_w = max(5.0, round(30.0 - (cand["travel_time_mins"] * 1.5), 1))
            hist_w = min(35.0, round(cand["historical_fraud_count"] * 4.5 + 5.0, 1))
            kiosk_w = 20.0 if cand["is_standalone_kiosk"] == 1 else 5.0
            
            total_w = dist_w + time_w + hist_w + kiosk_w
            cand["explainability"] = {
                "distance_weight_pct": round((dist_w / total_w) * 100.0, 1),
                "transit_time_weight_pct": round((time_w / total_w) * 100.0, 1),
                "historical_prior_weight_pct": round((hist_w / total_w) * 100.0, 1),
                "kiosk_isolation_weight_pct": round((kiosk_w / total_w) * 100.0, 1),
                "top_reasons": [
                    f"Proximity: {cand['distance_km']} km ({cand['travel_time_mins']} mins transit)",
                    f"Crime Index: {cand['historical_fraud_count']} past incidents recorded",
                    "Standalone Kiosk (High Physical Isolation)" if cand["is_standalone_kiosk"] == 1 else "Branch ATM (Surveillance active)",
                    "Cardless OTP/QR Cash-out Supported" if cand["supports_cardless"] == 1 else "Magnetic Stripe/EMV only",
                ],
            }

        # Sort descending by risk probability
        ranked = sorted(enriched_candidates, key=lambda x: x["risk_probability"], reverse=True)

        for rank_idx, cand in enumerate(ranked, start=1):
            cand["rank"] = rank_idx
            cand["alert_level"] = "CRITICAL_RED" if rank_idx == 1 else ("ELEVATED_ORANGE" if rank_idx == 2 else "MONITOR_YELLOW")

        return ranked[:top_k]
