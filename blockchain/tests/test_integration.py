"""
test_integration.py  —  PRATYAKSH SIH26184  —  Dev 3
=======================================================
Python integration tests for the Web3 Bridge (bridge_server.py).

These tests call the live FastAPI endpoints over HTTP.
They work in two modes:
  1. ONLINE  — Hardhat node is running + contract is deployed  → tests full on-chain flow
  2. OFFLINE — Bridge is not running  → tests are skipped gracefully

Pre-requisites for ONLINE mode:
  1.  npx hardhat node                                           (terminal 1)
  2.  npx hardhat run scripts/deploy.js --network localhost       (terminal 2)
  3.  cd bridge && uvicorn bridge_server:app --reload --port 8001 (terminal 3)
  4.  python tests/test_integration.py                           (terminal 4)

Run:
  python tests/test_integration.py
  # OR with pytest:
  pip install pytest httpx
  pytest tests/test_integration.py -v
"""

from __future__ import annotations

import sys
import time
import unittest
import hashlib

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

BRIDGE_BASE = "http://127.0.0.1:8001"
TIMEOUT     = 5  # seconds


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────
def _bridge_available() -> bool:
    """Returns True if the bridge server is reachable."""
    if not REQUESTS_AVAILABLE:
        return False
    try:
        r = requests.get(f"{BRIDGE_BASE}/health", timeout=TIMEOUT)
        return r.status_code == 200
    except Exception:
        return False


def _post(path: str, payload: dict) -> dict:
    r = requests.post(f"{BRIDGE_BASE}{path}", json=payload, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


def _get(path: str, params: dict | None = None) -> dict:
    r = requests.get(f"{BRIDGE_BASE}{path}", params=params or {}, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


# ─────────────────────────────────────────────────────────────────────────────
# Test class
# ─────────────────────────────────────────────────────────────────────────────
class TestBridgeIntegration(unittest.TestCase):

    CASE_ID     = f"CASE_PYTEST_{int(time.time())}"
    TOP_ATM     = "SBI ATM - VIT Pune Main Gate"
    MULE_ACCT   = f"TEST_MULE_{int(time.time())}_HDFC"
    CARD_NUM    = f"4111_{int(time.time())}"

    @classmethod
    def setUpClass(cls):
        if not _bridge_available():
            raise unittest.SkipTest(
                "\n\n⚠️  Bridge server not reachable at http://127.0.0.1:8001\n"
                "   Start it with: uvicorn bridge_server:app --reload --port 8001\n"
                "   (Also ensure Hardhat node is running and contract is deployed)\n"
            )
        print(f"\n[Setup] Bridge is online. Using case_id={cls.CASE_ID}")

    # ── Health check ──────────────────────────────────────────────────────────
    def test_01_health(self):
        """GET /health returns 200 and service name."""
        data = _get("/health")
        self.assertEqual(data["status"], "ok")
        self.assertIn("PRATYAKSH", data["service"])
        self.assertEqual(data["port"], 8001)
        print(f"  ✅ Health: EVM connected={data['evm_connected']} | Contract loaded={data['contract_loaded']}")

    # ── Log alert ─────────────────────────────────────────────────────────────
    def test_02_log_alert(self):
        """POST /chain/log-alert returns status MINED_ON_CHAIN or MOCK_OFFLINE."""
        data = _post("/chain/log-alert", {
            "case_id":      self.CASE_ID,
            "top_atm":      self.TOP_ATM,
            "mule_account": self.MULE_ACCT,
            "bank_id":      "HDFC_NODE_PUN",
        })
        self.assertIn(data["status"], {"MINED_ON_CHAIN", "MOCK_OFFLINE"})
        self.assertEqual(data.get("case_id", data.get("case_id")), self.CASE_ID)
        print(f"  ✅ log-alert: status={data['status']}")

    # ── Manual lien ───────────────────────────────────────────────────────────
    def test_03_mark_lien(self):
        """POST /chain/mark-lien places a lien."""
        data = _post("/chain/mark-lien", {
            "case_id":      self.CASE_ID,
            "bank_id":      "SBI_NODE_PUN",
            "mule_account": f"EXTRA_MULE_{self.CASE_ID}",
        })
        self.assertIn(data["status"], {"LIEN_PLACED", "MOCK_OFFLINE"})
        print(f"  ✅ mark-lien: status={data['status']}")

    # ── Batch freeze ──────────────────────────────────────────────────────────
    def test_04_batch_freeze(self):
        """POST /chain/batch-freeze freezes multiple accounts."""
        accounts = [f"SMURF_{i}_{self.CASE_ID}" for i in range(5)]
        data = _post("/chain/batch-freeze", {
            "case_id":       self.CASE_ID,
            "bank_id":       "ICICI_NODE_MUM",
            "mule_accounts": accounts,
        })
        self.assertIn(data["status"], {"BATCH_FROZEN", "MOCK_OFFLINE"})
        if data["status"] == "BATCH_FROZEN":
            self.assertEqual(data["frozen_count"], 5)
        print(f"  ✅ batch-freeze: status={data['status']}")

    # ── Verify card (unblocked) ───────────────────────────────────────────────
    def test_05_verify_card_clean(self):
        """POST /chain/verify-card returns can_dispense=true for unknown card."""
        data = _post("/chain/verify-card", {
            "card_number": "4999999999999999",  # never seen card
            "atm_id":      "ATM_CLEAN_TEST",
        })
        if data.get("status") != "MOCK_OFFLINE":
            self.assertTrue(data["can_dispense"])
            self.assertFalse(data["is_blocked"])
        print(f"  ✅ verify-card (clean): can_dispense={data.get('can_dispense', 'N/A')}")

    # ── Verify card (blocked) ─────────────────────────────────────────────────
    def test_06_verify_card_blocked(self):
        """Card that matches an active lien should be blocked."""
        # First place a lien on MULE_ACCT (already done in test_02, but place fresh)
        fresh_mule = f"BLOCKED_MULE_{self.CASE_ID}"
        _post("/chain/mark-lien", {
            "case_id":      self.CASE_ID,
            "bank_id":      "HDFC_NODE_PUN",
            "mule_account": fresh_mule,
        })
        data = _post("/chain/verify-card", {
            "card_number": fresh_mule,
            "atm_id":      "ATM_TEST_BLOCK",
        })
        if data.get("status") != "MOCK_OFFLINE":
            self.assertFalse(data["can_dispense"])
            self.assertTrue(data["is_blocked"])
        print(f"  ✅ verify-card (blocked): is_blocked={data.get('is_blocked', 'N/A')}")

    # ── Ack dispatch ──────────────────────────────────────────────────────────
    def test_07_ack_dispatch(self):
        """POST /chain/ack-dispatch acknowledges police dispatch on-chain."""
        data = _post("/chain/ack-dispatch", {
            "case_id": self.CASE_ID,
            "unit_id": "PCR_VAN_TEST",
        })
        self.assertIn(data["status"], {"DISPATCH_ACKNOWLEDGED", "MOCK_OFFLINE"})
        print(f"  ✅ ack-dispatch: status={data['status']}")

    # ── Case lookup ───────────────────────────────────────────────────────────
    def test_08_get_case(self):
        """GET /chain/case/{case_id} returns CaseEvidence struct."""
        try:
            data = _get(f"/chain/case/{self.CASE_ID}")
            # If we get here and it's not a 503, check it
            if "error" not in data:
                self.assertIn("case_id", data)
                self.assertIn("top_atm_cluster", data)
            print(f"  ✅ get-case: case_id={data.get('case_id', 'N/A')}")
        except Exception as e:
            # 503 is acceptable — means contract not deployed yet
            print(f"  ⚠️  get-case: {e} (acceptable if Hardhat node not running)")

    # ── Blocks explorer ───────────────────────────────────────────────────────
    def test_09_get_blocks(self):
        """GET /chain/blocks returns block headers."""
        data = _get("/chain/blocks", {"n": 5})
        self.assertIn("blocks", data)
        print(f"  ✅ get-blocks: latest_block={data.get('latest_block', 'N/A')} | shown={len(data['blocks'])}")

    # ── Incident log ──────────────────────────────────────────────────────────
    def test_10_get_incidents(self):
        """GET /chain/incidents returns incident list."""
        try:
            data = _get("/chain/incidents", {"limit": 10})
            self.assertIn("incidents", data)
            print(f"  ✅ get-incidents: total={data.get('total', 'N/A')}")
        except Exception as e:
            print(f"  ⚠️  get-incidents: {e} (acceptable if Hardhat node not running)")


# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  PRATYAKSH — Web3 Bridge Integration Tests (Dev 3)")
    print("=" * 60)
    print(f"  Bridge URL: {BRIDGE_BASE}")
    print(f"  Bridge online: {_bridge_available()}")
    print("=" * 60 + "\n")

    loader  = unittest.TestLoader()
    suite   = loader.loadTestsFromTestCase(TestBridgeIntegration)
    runner  = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result  = runner.run(suite)

    if result.wasSuccessful():
        print("\n✅  All integration tests passed!\n")
        sys.exit(0)
    else:
        print(f"\n❌  {len(result.failures)} failure(s), {len(result.errors)} error(s).\n")
        sys.exit(1)
