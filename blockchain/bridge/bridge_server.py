"""
bridge_server.py  ─  PRATYAKSH SIH26184  ─  Dev 3
====================================================
Python FastAPI microservice that bridges the Consortium Blockchain (Hardhat EVM)
with the AI Backend (Dev 1 / Port 8000) and the Frontend (Dev 2 / Port 3000).

Port : 8001
Start: uvicorn bridge_server:app --reload --port 8001

Endpoints
---------
  POST /chain/log-alert      — Log prediction + auto-place lien (called by Dev 1 after ML inference)
  POST /chain/mark-lien      — Manual lien on a single mule account hash
  POST /chain/batch-freeze   — Batch-freeze multiple mule accounts (fan-out smurfing)
  POST /chain/ack-dispatch   — Police unit acknowledges dispatch (called by Telegram bot callback)
  POST /chain/verify-card    — Pre-dispense ATM card check (ATM simulator)
  POST /chain/reverse-lien   — Admin-only: reverse a false-positive lien
  GET  /chain/blocks         — Last N block headers from the EVM
  GET  /chain/case/{case_id} — Fetch on-chain CaseEvidence struct
  GET  /chain/incidents      — Full ATM incident log
  GET  /health               — Service health probe

WebSocket
---------
  WS /ws/chain-events        — Streams new contract events to the frontend dashboard
"""

from __future__ import annotations

import asyncio
import json
import os
import hashlib
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from web3 import Web3
# web3.middleware POA not needed for Hardhat localhost

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("pratyaksh.bridge")

# ─────────────────────────────────────────────────────────────────────────────
# Web3 + Contract setup
# ─────────────────────────────────────────────────────────────────────────────
EVM_URL = os.getenv("HARDHAT_URL", "http://127.0.0.1:8545")
CONTRACT_INFO_PATH = Path(__file__).parent / "contract_info.json"

w3: Web3 = None          # initialised in lifespan
contract = None           # web3.contract instance
account: str = None       # deployer / I4C admin account


def _load_contract() -> tuple[Web3, object, str]:
    """Connect to the Hardhat EVM and load the deployed ATMConsortiumGate contract."""
    _w3 = Web3(Web3.HTTPProvider(EVM_URL))

    if not _w3.is_connected():
        log.warning("⚠️  Cannot connect to Hardhat EVM at %s. Running in MOCK mode.", EVM_URL)
        return _w3, None, ""

    if not CONTRACT_INFO_PATH.exists():
        log.warning("⚠️  contract_info.json not found. Run `npx hardhat run scripts/deploy.js --network localhost` first.")
        return _w3, None, ""

    with CONTRACT_INFO_PATH.open() as f:
        info = json.load(f)

    _contract = _w3.eth.contract(address=info["address"], abi=info["abi"])
    _account = _w3.eth.accounts[0]
    log.info("✅  Connected to Hardhat EVM at %s", EVM_URL)
    log.info("✅  ATMConsortiumGate @ %s", info["address"])
    log.info("✅  Using admin account: %s", _account)
    return _w3, _contract, _account


# ─────────────────────────────────────────────────────────────────────────────
# WebSocket manager (streams events to UI)
# ─────────────────────────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        message = json.dumps(data)
        for ws in list(self.active):
            try:
                await ws.send_text(message)
            except Exception:
                self.active.remove(ws)


manager = ConnectionManager()


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan (replaces @app.on_event)
# ─────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global w3, contract, account
    w3, contract, account = _load_contract()
    yield
    log.info("Bridge server shutting down.")


# ─────────────────────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PRATYAKSH Web3 Bridge",
    description=(
        "**DEV 3** microservice — bridges Consortium Blockchain with Dev 1 AI Backend & Dev 2 Frontend.\n\n"
        "Port **8001**. Endpoints follow `/chain/*` naming to avoid collision with Dev 1 (`/predict`, `/trace`) "
        "on Port 8000 and Dev 2 Frontend on Port 3000."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow all origins for hackathon/demo — tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────────────────────────────────────
class AlertPayload(BaseModel):
    case_id:      str = Field(..., example="CASE_26184_001")
    top_atm:      str = Field(..., example="SBI ATM - VIT Pune Main Gate")
    mule_account: str = Field(..., example="9876543210_HDFC")
    bank_id:      str = Field("HDFC_NODE_PUN", example="HDFC_NODE_PUN")

class LienPayload(BaseModel):
    case_id:      str = Field(..., example="CASE_26184_001")
    bank_id:      str = Field(..., example="HDFC_NODE_PUN")
    mule_account: str = Field(..., example="9876543210_HDFC")

class BatchFreezePayload(BaseModel):
    case_id:       str         = Field(..., example="CASE_26184_001")
    bank_id:       str         = Field(..., example="HDFC_NODE_PUN")
    mule_accounts: List[str]   = Field(..., example=["ACC_001","ACC_002","ACC_003"])

class AckDispatchPayload(BaseModel):
    case_id: str = Field(..., example="CASE_26184_001")
    unit_id: str = Field("PCR_VAN_18", example="PCR_VAN_18")

class VerifyCardPayload(BaseModel):
    card_number: str = Field(..., example="4111111111111111")
    atm_id:      str = Field(..., example="ATM_SBI_VITP_01")

class ReverseLienPayload(BaseModel):
    mule_account: str = Field(..., example="9876543210_HDFC")


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────
def _require_contract():
    if contract is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Blockchain not available. "
                "Start Hardhat with `npx hardhat node` and deploy via `npx hardhat run scripts/deploy.js --network localhost`."
            )
        )


def _keccak(text: str) -> bytes:
    return Web3.keccak(text=text)


def _mock_response(endpoint: str, payload: dict) -> dict:
    """Return a mock response when blockchain is unavailable (for CI/dev without Hardhat)."""
    fake_hash = "0x" + hashlib.sha256(json.dumps(payload).encode()).hexdigest()
    return {
        "status": "MOCK_OFFLINE",
        "endpoint": endpoint,
        "note": "Hardhat EVM not running. Deploy it with `npx hardhat node` then re-call.",
        "mock_tx_hash": fake_hash,
        **payload,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Meta"])
def health_check():
    """Service health + EVM connectivity probe."""
    connected = w3.is_connected() if w3 else False
    contract_loaded = contract is not None
    return {
        "status": "ok",
        "service": "PRATYAKSH Web3 Bridge",
        "port": 8001,
        "evm_connected": connected,
        "contract_loaded": contract_loaded,
        "evm_url": EVM_URL,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/chain/log-alert", tags=["Core"])
async def log_alert(payload: AlertPayload):
    """
    **Primary Integration Point with Dev 1.**
    Logs the ML prediction on-chain and auto-places a lien on the mule account.
    Called immediately after the AI backend emits a high-risk case.
    """
    if contract is None:
        return _mock_response("log-alert", payload.model_dump())

    # Compute SHA-256 / keccak alert hash
    raw_str   = f"{payload.case_id}:{payload.top_atm}:{w3.eth.get_block('latest').timestamp}"
    alert_hash = _keccak(raw_str)

    # 1. Log prediction on-chain
    tx1     = contract.functions.logPrediction(payload.case_id, alert_hash, payload.top_atm).transact({"from": account})
    receipt1 = w3.eth.wait_for_transaction_receipt(tx1)
    log.info("logPrediction mined: block=%s tx=%s", receipt1.blockNumber, receipt1.transactionHash.hex())

    # 2. Auto-place lien
    mule_hash = _keccak(payload.mule_account)
    tx2       = contract.functions.markBankLien(payload.case_id, payload.bank_id, mule_hash).transact({"from": account})
    receipt2  = w3.eth.wait_for_transaction_receipt(tx2)
    log.info("markBankLien mined:  block=%s tx=%s", receipt2.blockNumber, receipt2.transactionHash.hex())

    result = {
        "status":       "MINED_ON_CHAIN",
        "case_id":      payload.case_id,
        "alert_hash":   alert_hash.hex(),
        "tx_hash":      receipt1.transactionHash.hex(),
        "lien_tx_hash": receipt2.transactionHash.hex(),
        "block_number": receipt1.blockNumber,
        "top_atm":      payload.top_atm,
    }

    # Push event to WebSocket listeners (Dev 2 dashboard)
    await manager.broadcast({"event": "ALERT_LOGGED", **result})
    return result


@app.post("/chain/mark-lien", tags=["Core"])
async def mark_lien(payload: LienPayload):
    """Place a pre-dispense lien on a single mule account."""
    if contract is None:
        return _mock_response("mark-lien", payload.model_dump())

    mule_hash = _keccak(payload.mule_account)
    tx        = contract.functions.markBankLien(payload.case_id, payload.bank_id, mule_hash).transact({"from": account})
    receipt   = w3.eth.wait_for_transaction_receipt(tx)

    result = {
        "status":          "LIEN_PLACED",
        "case_id":         payload.case_id,
        "bank_id":         payload.bank_id,
        "mule_hash":       mule_hash.hex(),
        "tx_hash":         receipt.transactionHash.hex(),
        "block_number":    receipt.blockNumber,
    }
    await manager.broadcast({"event": "LIEN_MARKED", **result})
    return result


@app.post("/chain/batch-freeze", tags=["Core"])
async def batch_freeze(payload: BatchFreezePayload):
    """Batch-freeze multiple mule accounts in a single transaction (fan-out smurfing)."""
    if contract is None:
        return _mock_response("batch-freeze", payload.model_dump())

    mule_hashes = [_keccak(acc) for acc in payload.mule_accounts]
    tx          = contract.functions.batchFreezeMules(payload.case_id, payload.bank_id, mule_hashes).transact({"from": account})
    receipt     = w3.eth.wait_for_transaction_receipt(tx)

    result = {
        "status":       "BATCH_FROZEN",
        "case_id":      payload.case_id,
        "bank_id":      payload.bank_id,
        "frozen_count": len(mule_hashes),
        "tx_hash":      receipt.transactionHash.hex(),
        "block_number": receipt.blockNumber,
    }
    await manager.broadcast({"event": "BATCH_FROZEN", **result})
    return result


@app.post("/chain/ack-dispatch", tags=["Core"])
async def ack_dispatch(payload: AckDispatchPayload):
    """
    **Telegram Bot Integration Point.**
    Called when a police officer taps 'Accept Beat Patrol' on the Telegram inline keyboard.
    Anchors the acknowledgement on-chain (SLA timer starts).
    """
    if contract is None:
        return _mock_response("ack-dispatch", payload.model_dump())

    tx      = contract.functions.acknowledgePoliceDispatch(payload.case_id, payload.unit_id).transact({"from": account})
    receipt = w3.eth.wait_for_transaction_receipt(tx)

    result = {
        "status":       "DISPATCH_ACKNOWLEDGED",
        "case_id":      payload.case_id,
        "unit_id":      payload.unit_id,
        "tx_hash":      receipt.transactionHash.hex(),
        "block_number": receipt.blockNumber,
    }
    await manager.broadcast({"event": "POLICE_DISPATCHED", **result})
    return result


@app.post("/chain/verify-card", tags=["ATM Simulator"])
async def verify_card(payload: VerifyCardPayload):
    """
    **ATM Simulator Integration Point.**
    Checks whether a card/account hash is under an active lien before dispensing.
    Returns can_dispense=false if the smart lien is active.
    """
    if contract is None:
        return _mock_response("verify-card", payload.model_dump())

    card_hash = _keccak(payload.card_number)
    tx        = contract.functions.verifyCardBeforeDispense(card_hash, payload.atm_id).transact({"from": account})
    receipt   = w3.eth.wait_for_transaction_receipt(tx)

    # Read lien status (0=NONE, 1=HOLD_REQUESTED, 2=LIEN_ACTIVE, 3=REVERSED)
    lien_data   = contract.functions.muleLiens(card_hash).call()
    is_blocked  = (lien_data[3] == 2)  # LienStatus.LIEN_ACTIVE

    result = {
        "can_dispense": not is_blocked,
        "is_blocked":   is_blocked,
        "atm_id":       payload.atm_id,
        "card_hash":    card_hash.hex(),
        "tx_hash":      receipt.transactionHash.hex(),
        "block_number": receipt.blockNumber,
    }
    if is_blocked:
        await manager.broadcast({"event": "ATM_BLOCKED", **result})
    return result


@app.post("/chain/reverse-lien", tags=["Admin"])
async def reverse_lien(payload: ReverseLienPayload):
    """Admin-only: reverse a lien (false positive or court order)."""
    if contract is None:
        return _mock_response("reverse-lien", payload.model_dump())

    mule_hash = _keccak(payload.mule_account)
    tx        = contract.functions.reverseLien(mule_hash).transact({"from": account})
    receipt   = w3.eth.wait_for_transaction_receipt(tx)

    return {
        "status":       "LIEN_REVERSED",
        "mule_hash":    mule_hash.hex(),
        "tx_hash":      receipt.transactionHash.hex(),
        "block_number": receipt.blockNumber,
    }


@app.get("/chain/blocks", tags=["Explorer"])
def get_blocks(n: int = Query(10, ge=1, le=50, description="Number of latest blocks to return")):
    """Returns the latest N block headers from the local EVM (for the dashboard block explorer)."""
    if not w3.is_connected():
        return {"error": "EVM not connected", "blocks": []}

    latest = w3.eth.block_number
    blocks = []
    for i in range(min(n, latest + 1)):
        b = w3.eth.get_block(latest - i)
        blocks.append({
            "number":    b.number,
            "hash":      b.hash.hex(),
            "timestamp": b.timestamp,
            "tx_count":  len(b.transactions),
        })
    return {"latest_block": latest, "blocks": blocks}


@app.get("/chain/case/{case_id}", tags=["Explorer"])
def get_case(case_id: str):
    """Fetch the on-chain CaseEvidence record for a given case ID."""
    _require_contract()
    raw = contract.functions.cases(case_id).call()
    # Tuple order: caseId, alertHash, topATMCluster, alertTimestamp,
    #              isPoliceDispatched, dispatchedUnitId, policeAckTimestamp
    return {
        "case_id":             raw[0],
        "alert_hash":          raw[1].hex(),
        "top_atm_cluster":     raw[2],
        "alert_timestamp":     raw[3],
        "is_police_dispatched": raw[4],
        "dispatched_unit_id":  raw[5],
        "police_ack_timestamp": raw[6],
    }


@app.get("/chain/incidents", tags=["Explorer"])
def get_incidents(limit: int = Query(20, ge=1, le=100)):
    """Return the last N ATM incidents from the on-chain log."""
    _require_contract()
    total = contract.functions.getIncidentCount().call()
    incidents = []
    start = max(0, total - limit)
    for i in range(start, total):
        raw = contract.functions.incidentHistory(i).call()
        incidents.append({
            "index":     i,
            "atm_id":    raw[0],
            "card_hash": raw[1].hex(),
            "outcome":   raw[2],
            "timestamp": raw[3],
        })
    return {"total": total, "shown": len(incidents), "incidents": incidents}


# ─────────────────────────────────────────────────────────────────────────────
# WebSocket — real-time chain event stream → Dev 2 Frontend
# ─────────────────────────────────────────────────────────────────────────────
@app.websocket("/ws/chain-events")
async def websocket_chain_events(ws: WebSocket):
    """
    WebSocket endpoint consumed by the Next.js frontend dashboard.
    Events are broadcast whenever a contract write completes on-chain.
    """
    await manager.connect(ws)
    log.info("WebSocket client connected: %s", ws.client)
    try:
        await ws.send_json({"event": "CONNECTED", "message": "PRATYAKSH Web3 Bridge live"})
        while True:
            # Keep-alive ping every 30 s
            await asyncio.sleep(30)
            await ws.send_json({"event": "PING", "ts": datetime.now(timezone.utc).isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(ws)
        log.info("WebSocket client disconnected.")


# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint (direct run)
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("bridge_server:app", host="0.0.0.0", port=8001, reload=True)
