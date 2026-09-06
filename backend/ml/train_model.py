"""
Model Training & Serialization Script for PRATYAKSH ATM Spatial Ranker.
Trains XGBoost model on synthetic/historical labels and outputs pratyaksh_atm_ranker.json.
"""
import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, log_loss
import xgboost as xgb

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
DATA_PATH = os.path.join(BASE_DIR, "data", "training_labels.csv")
MODEL_OUTPUT_PATH = os.path.join(BASE_DIR, "ml", "pratyaksh_atm_ranker.json")

FEATURE_COLS = [
    "distance_km",
    "travel_time_mins",
    "historical_fraud_count",
    "is_standalone_kiosk",
    "supports_cardless",
]
TARGET_COL = "is_cashout_atm"


def train_spatial_ranker():
    # Ensure data exists
    if not os.path.exists(DATA_PATH):
        print("[Train] training_labels.csv not found. Running data generator...")
        import sys
        sys.path.insert(0, BASE_DIR)
        from data.generator import generate_training_dataset, generate_complaints_seed
        generate_complaints_seed()
        generate_training_dataset()

    print(f"[Train] Loading training data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    print(f"[Train] Loaded {len(df)} samples.")

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
    )

    print("[Train] Training XGBoost Spatial Classifier...")
    clf.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    preds_prob = clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, preds_prob)
    loss = log_loss(y_test, preds_prob)

    print(f"[Train] Model Performance: ROC-AUC = {auc:.4f} | Log Loss = {loss:.4f}")
    assert auc > 0.85, f"Expected AUC > 0.85, got {auc:.4f}"

    # Save model as JSON booster
    clf.get_booster().save_model(MODEL_OUTPUT_PATH)
    print(f"[Train] Successfully saved model to {MODEL_OUTPUT_PATH}")
    return auc


if __name__ == "__main__":
    train_spatial_ranker()
