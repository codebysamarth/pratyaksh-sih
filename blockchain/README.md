# PRATYAKSH SIH26184 — Dev 3: Blockchain Layer
# =============================================
#
# This module provides:
#   1. ATMConsortiumGate.sol — Consortium Blockchain Smart Contract
#   2. Python Web3 FastAPI Bridge (Port 8001)
#   3. Live Telegram Field Patrol Alert Bot

## Prerequisites

### Node.js (for Hardhat)
```bash
node --version   # >= 18.x
npm  --version   # >= 9.x
```

### Python (for Bridge & Bot)
```bash
python --version  # >= 3.11
```

---

## Setup

### 1. Install Node.js dependencies
```bash
cd blockchain
npm install
```

### 2. Install Python dependencies
```bash
cd blockchain/bridge
pip install -r requirements.txt
```

### 3. Configure Telegram Bot (optional for demo)
Edit `blockchain/telegram/bot_config.json`:
- `BOT_TOKEN` — create a bot via **@BotFather** on Telegram
- `CHAT_ID`   — message **@userinfobot** to get your numeric Chat ID

---

## Running

### Terminal 1 — Start Hardhat EVM Node
```bash
cd blockchain
npx hardhat node
```
> 20 pre-funded test accounts on `http://127.0.0.1:8545`

### Terminal 2 — Deploy Smart Contract
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
> Writes `blockchain/bridge/contract_info.json`

### Terminal 3 — Start Web3 Bridge API
```bash
cd blockchain/bridge
uvicorn bridge_server:app --reload --port 8001
```
> Open `http://localhost:8001/docs` for interactive Swagger UI

### Terminal 4 — Start Telegram Patrol Bot
```bash
cd blockchain/telegram
python field_patrol_bot.py
```

---

## Testing

### Smart Contract Unit Tests (Hardhat/Mocha)
```bash
cd blockchain
npx hardhat test
```

### Web3 Bridge Integration Tests (Python)
```bash
cd blockchain
python tests/test_integration.py
```
> Requires terminals 1+2+3 to be running first.

---

## API Endpoints (Port 8001)

| Method | Endpoint                | Description |
|--------|-------------------------|-------------|
| GET    | `/health`               | Service health probe |
| POST   | `/chain/log-alert`      | Log ML prediction + auto-place lien |
| POST   | `/chain/mark-lien`      | Manual lien on single mule account |
| POST   | `/chain/batch-freeze`   | Batch-freeze multiple mule accounts |
| POST   | `/chain/ack-dispatch`   | Police unit acknowledges dispatch |
| POST   | `/chain/verify-card`    | Pre-dispense ATM card check |
| POST   | `/chain/reverse-lien`   | Admin: reverse a false-positive lien |
| GET    | `/chain/blocks`         | Recent EVM block headers |
| GET    | `/chain/case/{case_id}` | On-chain CaseEvidence record |
| GET    | `/chain/incidents`      | ATM incident log |
| WS     | `/ws/chain-events`      | Real-time chain events → Frontend |

---

## Git Branch

```bash
git checkout -b feature/dev3-blockchain
git add blockchain/
git commit -m "feat(blockchain): ATMConsortiumGate, Web3 bridge, Telegram patrol bot"
git push -u origin feature/dev3-blockchain
```
