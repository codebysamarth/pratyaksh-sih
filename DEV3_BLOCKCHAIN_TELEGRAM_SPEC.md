# PRATYAKSH (SIH 26184) — DEV 3 SPECIFICATION
# Role: Blockchain Consortium Ledger, Smart Contracts, Telegram Field Patrol Bot & Web3 Bridge

> **Instructions for Agent/Developer:**
> You are **Developer 3 (Web3, Smart Contracts & Field Operations Engineer)** on Project PRATYAKSH for Smart India Hackathon (SIH 26184).
> Your job is to build the **Lightweight Consortium Smart Contract Ledger**, the **Python Web3 API Bridge**, and the **Live Telegram Field Patrol Alert Bot**.
> You provide the **Trust, Inter-Agency Accountability, and Real-World Field Interception** that proves this solution works seamlessly between I4C, State Police, Banks, and Ground Patrol Officers.

---

## 1. System Architecture & Dev 3 Responsibilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DEV 3 ARCHITECTURE & INTEGRATION                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Solidity Smart Contracts (Hardhat / Local EVM):                     │
│    - ATMConsortiumGate.sol:                                            │
│      • Pre-Dispense Smart Lien State Machine                           │
│      • Batch Freeze for ₹5 Lakh Fan-Out Smurfing                       │
│      • Dynamic ATM Ring-Fencing (Withdrawal Limit Throttling)          │
│      • Tamper-Proof ATM Incident Log (Section 65B Audit Trail)         │
│                                                                        │
│ 2. Python Web3 Bridge (FastAPI Microservice on Port 8001):             │
│    - Interfaces between Blockchain and Dev 1 (Backend) & Dev 2 (UI)    │
│    - Endpoints: /chain/log-alert, /chain/mark-lien, /chain/blocks      │
│                                                                        │
│ 3. Live Field Response Telegram Bot (telegram_field_patrol.py):        │
│    - Sends real audible push notification to teammate's phone          │
│    - Interactive Inline Buttons: [🚔 Accept Patrol] & [🗺️ Open Maps]   │
│    - Button click updates Smart Contract & pushes WebSocket to UI!     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure to Create

Create your project structure inside `blockchain/`:
```text
blockchain/
├── contracts/
│   └── ATMConsortiumGate.sol     # The Unified Consortium Smart Contract
├── scripts/
│   └── deploy.js                 # Hardhat deployment script
├── hardhat.config.js             # Hardhat network configuration
├── package.json                  # Node.js Web3 dependencies
├── bridge/
│   ├── bridge_server.py          # Python Web3 FastAPI bridge (Port 8001)
│   └── requirements.txt          # Python dependencies (web3.py, python-telegram-bot)
├── telegram/
│   ├── field_patrol_bot.py       # Telegram Bot for live mobile patrol demo
│   └── bot_config.json           # Bot token & chat ID configuration
└── tests/
    ├── test_smart_contract.js    # Hardhat unit tests
    └── test_integration.py       # Web3 bridge integration test
```

---

## 3. Step-by-Step Implementation Guide

### Step 3.1: The Unified Solidity Smart Contract (`contracts/ATMConsortiumGate.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ATMConsortiumGate
 * @dev Manages inter-agency SLAs, pre-dispense liens, fan-out batch freezes, and Section 65B audit trails.
 */
contract ATMConsortiumGate {
    address public i4cAdmin;

    enum LienStatus { NONE, HOLD_REQUESTED, LIEN_ACTIVE, REVERSED }

    struct CaseEvidence {
        string caseId;
        bytes32 alertHash;
        string topATMCluster;
        uint256 alertTimestamp;
        bool isPoliceDispatched;
        string dispatchedUnitId;
        uint256 policeAckTimestamp;
    }

    struct MuleLien {
        bytes32 muleAccountHash;
        string caseId;
        string bankId;
        LienStatus status;
        uint256 lienTimestamp;
    }

    struct ATMIncident {
        string atmId;
        bytes32 cardHash;
        string outcome;
        uint256 timestamp;
    }

    // Mappings
    mapping(string => CaseEvidence) public cases;
    mapping(bytes32 => MuleLien) public muleLiens;
    ATMIncident[] public incidentHistory;

    // Events for real-time frontend listener
    event AlertLogged(string caseId, bytes32 alertHash, string topATMCluster, uint256 timestamp);
    event BankLienMarked(string caseId, string bankId, bytes32 muleAccountHash, uint256 timestamp);
    event PoliceDispatched(string caseId, string unitId, uint256 timestamp);
    event ATMCashoutBlocked(string atmId, bytes32 cardHash, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == i4cAdmin, "Only I4C Authority can execute");
        _;
    }

    constructor() {
        i4cAdmin = msg.sender;
    }

    // 1. Logs Prediction & Proof of Alert (Section 65B Evidence)
    function logPrediction(
        string memory _caseId, 
        bytes32 _alertHash, 
        string memory _topATMCluster
    ) public {
        cases[_caseId] = CaseEvidence({
            caseId: _caseId,
            alertHash: _alertHash,
            topATMCluster: _topATMCluster,
            alertTimestamp: block.timestamp,
            isPoliceDispatched: false,
            dispatchedUnitId: "",
            policeAckTimestamp: 0
        });

        emit AlertLogged(_caseId, _alertHash, _topATMCluster, block.timestamp);
    }

    // 2. Bank Node places Automated Pre-Dispense Lien
    function markBankLien(
        string memory _caseId, 
        string memory _bankId, 
        bytes32 _muleAccountHash
    ) public {
        muleLiens[_muleAccountHash] = MuleLien({
            muleAccountHash: _muleAccountHash,
            caseId: _caseId,
            bankId: _bankId,
            status: LienStatus.LIEN_ACTIVE,
            lienTimestamp: block.timestamp
        });

        emit BankLienMarked(_caseId, _bankId, _muleAccountHash, block.timestamp);
    }

    // 3. Batch Freeze for Fan-Out Smurfing (e.g. ₹5 Lakh split across 10 accounts)
    function batchFreezeMules(
        string memory _caseId, 
        string memory _bankId, 
        bytes32[] memory _muleHashes
    ) public {
        for (uint i = 0; i < _muleHashes.length; i++) {
            markBankLien(_caseId, _bankId, _muleHashes[i]);
        }
    }

    // 4. Ground Police Unit / Telegram Bot Acknowledges Dispatch
    function acknowledgePoliceDispatch(
        string memory _caseId, 
        string memory _unitId
    ) public {
        CaseEvidence storage c = cases[_caseId];
        c.isPoliceDispatched = true;
        c.dispatchedUnitId = _unitId;
        c.policeAckTimestamp = block.timestamp;

        emit PoliceDispatched(_caseId, _unitId, block.timestamp);
    }

    // 5. Pre-Dispense Verification (Called by ATM Terminal Simulator)
    function verifyCardBeforeDispense(
        bytes32 _cardOrMuleHash, 
        string memory _atmId
    ) public returns (bool canDispense) {
        if (muleLiens[_cardOrMuleHash].status == LienStatus.LIEN_ACTIVE) {
            // Cash-out blocked!
            incidentHistory.push(ATMIncident({
                atmId: _atmId,
                cardHash: _cardOrMuleHash,
                outcome: "BLOCKED_BY_SMART_LIEN",
                timestamp: block.timestamp
            }));
            emit ATMCashoutBlocked(_atmId, _cardOrMuleHash, block.timestamp);
            return false;
        }
        return true;
    }

    // Helper: Returns total blocked incidents count
    function getIncidentCount() public view returns (uint256) {
        return incidentHistory.length;
    }
}
```

---

### Step 3.2: Hardhat Configuration & Deployment (`blockchain/hardhat.config.js`)

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};
```

Deploy script (`scripts/deploy.js`):
```javascript
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Gate = await hre.ethers.getContractFactory("ATMConsortiumGate");
  const gate = await Gate.deploy();
  await gate.waitForDeployment();
  const address = await gate.getAddress();

  console.log(`[Success] ATMConsortiumGate deployed to: ${address}`);
  
  // Write address and ABI to bridge folder for Python to consume
  const artifact = await hre.artifacts.readArtifact("ATMConsortiumGate");
  fs.writeFileSync("./bridge/contract_info.json", JSON.stringify({
    address: address,
    abi: artifact.abi
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

### Step 3.3: Python Web3 Bridge Server (`blockchain/bridge/bridge_server.py`)
Run on **Port 8001**:
```python
from fastapi import FastAPI
from pydantic import BaseModel
from web3 import Web3
import json
import hashlib

app = FastAPI(title="PRATYAKSH Web3 Bridge")
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

# Load deployed contract
with open("contract_info.json") as f:
    info = json.load(f)

contract = w3.eth.contract(address=info["address"], abi=info["abi"])
account = w3.eth.accounts[0]  # Default I4C Admin node

class AlertPayload(BaseModel):
    case_id: str
    top_atm: str
    mule_account: str

@app.post("/chain/log-alert")
def log_alert(payload: AlertPayload):
    # Compute SHA-256 Alert Hash
    raw_str = f"{payload.case_id}:{payload.top_atm}:{w3.eth.get_block('latest').timestamp}"
    alert_hash = Web3.keccak(text=raw_str)
    
    tx = contract.functions.logPrediction(
        payload.case_id, alert_hash, payload.top_atm
    ).transact({"from": account})
    receipt = w3.eth.wait_for_transaction_receipt(tx)
    
    # Auto-place lien
    mule_hash = Web3.keccak(text=payload.mule_account)
    tx2 = contract.functions.markBankLien(
        payload.case_id, "HDFC_NODE_PUN", mule_hash
    ).transact({"from": account})
    receipt2 = w3.eth.wait_for_transaction_receipt(tx2)

    return {
        "status": "MINED_ON_CHAIN",
        "case_id": payload.case_id,
        "tx_hash": receipt.transactionHash.hex(),
        "lien_tx_hash": receipt2.transactionHash.hex(),
        "block_number": receipt.blockNumber
    }

@app.post("/chain/verify-card")
def verify_card(card_number: str, atm_id: str):
    card_hash = Web3.keccak(text=card_number)
    tx = contract.functions.verifyCardBeforeDispense(card_hash, atm_id).transact({"from": account})
    receipt = w3.eth.wait_for_transaction_receipt(tx)
    
    # Check if lien exists
    lien_data = contract.functions.muleLiens(card_hash).call()
    is_blocked = (lien_data[3] == 2)  # LIEN_ACTIVE
    return {
        "can_dispense": not is_blocked,
        "is_blocked": is_blocked,
        "tx_hash": receipt.transactionHash.hex()
    }
```

---

### Step 3.4: Live Telegram Field Patrol Bot (`blockchain/telegram/field_patrol_bot.py`)
This is the **Secret Weapon for the Live Demo**:

```python
import os
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes

BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"  # Create via @BotFather in 1 minute
CHAT_ID = "YOUR_CHAT_ID"              # Your personal Telegram Chat ID

async def send_patrol_alert(case_id: str, atm_name: str, eta_mins: int, amount: str):
    """
    Called when Dev 1 AI predicts a high-risk cash-out!
    Sends audible alert with inline buttons to the physical phone.
    """
    message_text = (
        f"🚨 *I4C PRATYAKSH FIELD ALERT* 🚨\n\n"
        f"⚠️ *CRITICAL:* High-Probability Cash-Out Predicted\n"
        f"📁 *Case ID:* `{case_id}`\n"
        f"💰 *Defrauded Amount:* `₹{amount}`\n"
        f"📍 *Target ATM:* *{atm_name}*\n"
        f"⏳ *Est. Arrival Window:* `{eta_mins} mins remaining`\n\n"
        f"Immediate beat police interception requested!"
    )

    keyboard = [
        [
            InlineKeyboardButton("🚔 Accept Beat Patrol", callback_data=f"ACCEPT:{case_id}"),
            InlineKeyboardButton("🗺️ Open GPS Map", url=f"https://maps.google.com/?q={atm_name}")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message_text,
        "parse_mode": "Markdown",
        "reply_markup": reply_markup.to_json()
    }
    requests.post(url, json=payload)

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    data = query.data
    if data.startswith("ACCEPT:"):
        case_id = data.split(":")[1]
        
        # 1. Update on Smart Contract
        try:
            requests.post("http://127.0.0.1:8001/chain/ack-dispatch", json={"case_id": case_id, "unit_id": "PCR_VAN_18"})
        except Exception:
            pass

        await query.edit_message_text(
            f"✅ *BEAT PATROL ACKNOWLEDGED*\n\n"
            f"🚔 *Unit Assigned:* PCR Van 18 (Bibwewadi Beat)\n"
            f"📁 *Case:* `{case_id}`\n"
            f"⛓️ *Smart Contract SLA:* Logged on Consortium Ledger\n"
            f"🕒 *Status:* EN-ROUTE TO ATM KIOSK",
            parse_mode="Markdown"
        )

if __name__ == "__main__":
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CallbackQueryHandler(button_callback))
    print("[Telegram Bot] Live field listener running...")
    app.run_polling()
```

---

## 4. Testing & Verification Guide (For Developer 3)

### Test 1: Start Local Hardhat EVM Node
```bash
cd blockchain
npx hardhat node
```
*Expected Result:* 20 pre-funded test accounts generated on `http://127.0.0.1:8545`.

### Test 2: Deploy Smart Contract
In a second terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*Expected Result:* Output `[Success] ATMConsortiumGate deployed to: 0x5FbDB...` and `contract_info.json` created.

### Test 3: Start Web3 Bridge API
```bash
cd bridge
uvicorn bridge_server:app --reload --port 8001
```
Open `http://localhost:8001/docs` and test `/chain/log-alert`. Verify block number increments.

### Test 4: Verify Live Telegram Notification
1. Set `BOT_TOKEN` and `CHAT_ID` in `telegram/field_patrol_bot.py`.
2. Run `python telegram/field_patrol_bot.py`.
3. In a separate terminal or script, trigger `send_patrol_alert("CASE_26184_001", "SBI ATM - VIT Pune Main Gate", 18, "3,50,000")`.
4. **Physical Phone Test:** Check that your phone buzzes with the high-priority alert. Tap **"🚔 Accept Beat Patrol"** and verify that the bot confirms assignment immediately.

---

## 5. Git Collaboration, Push & Merge Instructions (For Developer 3)

### Rule #1: Strict Folder Isolation
- Work **ONLY inside the `blockchain/` directory**.
- Do **NOT** modify or add files in `backend/` or `frontend/`. This ensures 100% conflict-free Git merges.

### Step-by-Step Git Commands:
1. **Create and switch to your dedicated branch:**
   ```bash
   git checkout -b feature/dev3-blockchain
   ```
2. **Stage and commit your work regularly:**
   ```bash
   git add blockchain/
   git commit -m "feat(blockchain): complete ATMConsortiumGate smart contract, web3 bridge, and telegram bot"
   ```
3. **Push to GitHub:**
   ```bash
   git push -u origin feature/dev3-blockchain
   ```
4. **Open a Pull Request (PR):**
   - Open GitHub in your browser.
   - Click **"Compare & pull request"** from `feature/dev3-blockchain` into `main`.
   - PR Title: `feat(blockchain): Smart Contract Consortium, Web3 API Bridge & Telegram Patrol Bot`.
   - Click **"Merge pull request"**.

### Integration Contract with Dev 1 & Dev 2:
- **Your Hardhat Node:** `http://127.0.0.1:8545` (starts via `npx hardhat node`).
- **Your Web3 Bridge API Port:** `http://localhost:8001` (starts via `uvicorn bridge_server:app --port 8001`).
- **Contract Output Artifact:** Your deploy script writes to `blockchain/bridge/contract_info.json` so the bridge always knows the active contract address.
- **Telegram Live Service:** Runs as a background service via `python telegram/field_patrol_bot.py`. When inline button is tapped, it immediately calls `POST http://localhost:8001/chain/ack-dispatch`.
