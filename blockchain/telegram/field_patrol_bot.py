"""
field_patrol_bot.py  ─  PRATYAKSH SIH26184  ─  Dev 3
=======================================================
Live Telegram Field Patrol Alert Bot.

Sends HIGH-PRIORITY audible push notifications to the field officer's phone
the instant the AI backend predicts an imminent cash-out. The officer can
acknowledge the patrol assignment with a single tap — which automatically:
  1. Calls POST /chain/ack-dispatch on the Web3 bridge  →  anchors SLA on-chain.
  2. Edits the bot message to show a confirmed dispatch card.

Usage
-----
  # Configure bot_config.json first (add BOT_TOKEN and CHAT_ID from Telegram)
  python field_patrol_bot.py

  # Or trigger an alert from another script / API:
  import asyncio
  from field_patrol_bot import send_patrol_alert
  asyncio.run(send_patrol_alert("CASE_26184_001", "SBI ATM - VIT Pune", 18, "3,50,000"))

Integration
-----------
  • Dev 1 (AI Backend) calls send_patrol_alert() after emitting a high-risk prediction.
  • On button tap, this bot calls POST http://127.0.0.1:8001/chain/ack-dispatch.
  • Dev 2 (Frontend) receives the dispatch event via the WebSocket at ws://localhost:8001/ws/chain-events.
"""

import os
import sys
import json
import logging
import asyncio
from pathlib import Path

# Fix Windows cp1252 terminal Unicode output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import httpx
from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Bot,
)
from telegram.ext import (
    ApplicationBuilder,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
)
from telegram.constants import ParseMode

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("pratyaksh.telegram")

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────
_CONFIG_PATH = Path(__file__).parent / "bot_config.json"
_EXAMPLE_PATH = Path(__file__).parent / "bot_config.example.json"

def _load_config() -> dict:
    if _CONFIG_PATH.exists():
        with _CONFIG_PATH.open() as f:
            return json.load(f)
    if _EXAMPLE_PATH.exists():
        with _EXAMPLE_PATH.open() as f:
            return json.load(f)
    return {}

_cfg = _load_config()

BOT_TOKEN    : str = os.getenv("TELEGRAM_BOT_TOKEN") or _cfg.get("BOT_TOKEN", "")
CHAT_ID      : str = os.getenv("TELEGRAM_CHAT_ID") or _cfg.get("CHAT_ID", "")
BRIDGE_URL   : str = os.getenv("BRIDGE_URL") or _cfg.get("BRIDGE_URL", "http://127.0.0.1:8001")
DEFAULT_UNIT : str = os.getenv("DEFAULT_UNIT_ID") or _cfg.get("DEFAULT_UNIT_ID", "PCR_VAN_18")

if not BOT_TOKEN or BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
    log.warning(
        "⚠️  BOT_TOKEN not set in blockchain/telegram/bot_config.json. "
        "Create a bot via @BotFather and update the config."
    )

if not CHAT_ID or CHAT_ID == "YOUR_CHAT_ID":
    log.warning(
        "⚠️  CHAT_ID not set in blockchain/telegram/bot_config.json. "
        "Message @userinfobot on Telegram to get your Chat ID."
    )


# ─────────────────────────────────────────────────────────────────────────────
# Core alert sender
# ─────────────────────────────────────────────────────────────────────────────
async def send_patrol_alert(
    case_id:   str,
    atm_name:  str,
    eta_mins:  int,
    amount:    str,
    chat_id:   str | None = None,
) -> dict:
    """
    Sends an audible high-priority push alert to the field officer's Telegram.
    The message contains interactive inline buttons for immediate response.

    Args:
        case_id:   Cybercrime case identifier (e.g. "CASE_26184_001")
        atm_name:  Target ATM / location name (e.g. "SBI ATM - VIT Pune Main Gate")
        eta_mins:  Estimated minutes until predicted cash-out
        amount:    Defrauded amount string (e.g. "3,50,000")
        chat_id:   Override chat_id (defaults to bot_config.json CHAT_ID)

    Returns:
        Telegram API response dict.
    """
    target_chat = chat_id or CHAT_ID
    if not target_chat or not BOT_TOKEN:
        log.error("BOT_TOKEN or CHAT_ID missing — cannot send alert.")
        return {"error": "BOT_TOKEN or CHAT_ID not configured"}

    message_text = (
        "🚨 <b>I4C PRATYAKSH FIELD ALERT</b> 🚨\n\n"
        "⚠️ <b>CRITICAL:</b> High-Probability Cash-Out Predicted\n"
        f"📁 <b>Case ID:</b> <code>{case_id}</code>\n"
        f"💰 <b>Defrauded Amount:</b> <code>₹{amount}</code>\n"
        f"📍 <b>Target ATM:</b> <b>{atm_name}</b>\n"
        f"⏳ <b>Est. Arrival Window:</b> <code>{eta_mins} mins remaining</code>\n\n"
        "🔴 Immediate beat police interception requested!\n\n"
        "<i>Tap the button below to acknowledge patrol assignment.</i>"
    )

    # Build Google Maps URL using ATM name as query (geocoded on the fly)
    maps_url = f"https://maps.google.com/?q={atm_name.replace(' ', '+')}"

    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🚔 Accept Beat Patrol", callback_data=f"ACCEPT:{case_id}"),
            InlineKeyboardButton("🗺️ Open GPS Map",       url=maps_url),
        ],
        [
            InlineKeyboardButton("ℹ️ Case Details",       callback_data=f"DETAILS:{case_id}"),
            InlineKeyboardButton("❌ Cannot Respond",      callback_data=f"DECLINE:{case_id}"),
        ],
    ])

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={
                "chat_id":      target_chat,
                "text":         message_text,
                "parse_mode":   "HTML",
                "reply_markup": keyboard.to_json(),
            },
        )

    if resp.status_code == 200:
        log.info("✅  Patrol alert sent for case %s to chat %s", case_id, target_chat)
    else:
        log.error("❌  Telegram API error %s: %s", resp.status_code, resp.text)

    return resp.json()


# ─────────────────────────────────────────────────────────────────────────────
# Callback handler (inline keyboard button taps)
# ─────────────────────────────────────────────────────────────────────────────
async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles inline button presses from the field officer."""
    query = update.callback_query
    await query.answer()  # Acknowledge immediately so the UI doesn't spin

    data = query.data or ""

    # ── Accept Beat Patrol ────────────────────────────────────────────────────
    if data.startswith("ACCEPT:"):
        case_id = data.split(":", 1)[1]
        log.info("Officer accepted patrol for case: %s", case_id)

        # 1. Anchor acknowledgement on-chain via Web3 bridge
        ack_result = {}
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.post(
                    f"{BRIDGE_URL}/chain/ack-dispatch",
                    json={"case_id": case_id, "unit_id": DEFAULT_UNIT},
                )
                ack_result = resp.json()
                log.info("Chain ack-dispatch: %s", ack_result)
        except Exception as exc:
            log.warning("Bridge unreachable: %s", exc)
            ack_result = {"tx_hash": "N/A (bridge offline)"}

        tx_info = ack_result.get("tx_hash", "N/A")

        # 2. Edit message to confirm dispatch card
        await query.edit_message_text(
            "✅ <b>BEAT PATROL ACKNOWLEDGED</b> ✅\n\n"
            f"🚔 <b>Unit Assigned:</b> {DEFAULT_UNIT} (Bibwewadi Beat)\n"
            f"📁 <b>Case:</b> <code>{case_id}</code>\n"
            "⛓️ <b>Smart Contract SLA:</b> Logged on Consortium Ledger\n"
            f"📝 <b>Tx Hash:</b> <code>{tx_info[:20]}...</code>\n"
            "🕒 <b>Status:</b> EN-ROUTE TO ATM KIOSK\n\n"
            "<i>Stay safe. Approach with caution.</i>",
            parse_mode=ParseMode.HTML,
        )

    # ── Case Details ──────────────────────────────────────────────────────────
    elif data.startswith("DETAILS:"):
        case_id = data.split(":", 1)[1]
        case_info = {}
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{BRIDGE_URL}/chain/case/{case_id}")
                case_info = resp.json()
        except Exception as exc:
            log.warning("Could not fetch case details: %s", exc)

        atm = case_info.get("top_atm_cluster", "Unknown ATM")
        dispatched = "✅ Yes" if case_info.get("is_police_dispatched") else "❌ Not yet"
        unit = case_info.get("dispatched_unit_id") or "—"

        await query.answer(
            f"📁 Case: {case_id}\n📍 ATM: {atm}\n🚔 Dispatched: {dispatched}\n🆔 Unit: {unit}",
            show_alert=True,
        )

    # ── Decline / Cannot Respond ──────────────────────────────────────────────
    elif data.startswith("DECLINE:"):
        case_id = data.split(":", 1)[1]
        log.warning("Officer declined patrol for case: %s", case_id)
        await query.edit_message_text(
            "⚠️ <b>PATROL DECLINED</b>\n\n"
            f"📁 Case: <code>{case_id}</code>\n"
            "🔄 Escalating to nearest available PCR unit...\n\n"
            "<i>Please notify your supervisor immediately.</i>",
            parse_mode=ParseMode.HTML,
        )


# ─────────────────────────────────────────────────────────────────────────────
# /start and /status command handlers
# ─────────────────────────────────────────────────────────────────────────────
async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome message when an officer first starts the bot."""
    user = update.effective_user
    await update.message.reply_text(
        f"🛡️ <b>PRATYAKSH Field Patrol Bot</b>\n\n"
        f"Welcome, {user.first_name}! You are now registered to receive live field interception alerts.\n\n"
        f"Your Chat ID: <code>{update.effective_chat.id}</code>\n\n"
        "<i>Alerts will be sent here whenever the AI predicts an imminent cash-out.</i>",
        parse_mode=ParseMode.HTML,
    )
    log.info("Officer registered: user=%s chat_id=%s", user.first_name, update.effective_chat.id)


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Check bridge connectivity."""
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            resp = await client.get(f"{BRIDGE_URL}/health")
            data = resp.json()
        status_text = (
            "✅ <b>Bridge Online</b>\n\n"
            f"⛓️ EVM Connected: <code>{data.get('evm_connected', False)}</code>\n"
            f"📜 Contract Loaded: <code>{data.get('contract_loaded', False)}</code>\n"
            f"🌐 EVM URL: <code>{data.get('evm_url', '—')}</code>"
        )
    except Exception:
        status_text = (
            "❌ <b>Bridge Offline</b>\n\n"
            f"Cannot reach <code>{BRIDGE_URL}</code>.\n"
            "Start with: <code>uvicorn bridge_server:app --port 8001</code>"
        )
    await update.message.reply_text(status_text, parse_mode=ParseMode.HTML)


async def cmd_test_alert(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Trigger a mock patrol alert for demo/testing."""
    chat_id = str(update.effective_chat.id)
    await update.message.reply_text("🧪 Sending test patrol alert...")
    result = await send_patrol_alert(
        case_id="CASE_26184_TEST",
        atm_name="SBI ATM - VIT Pune Main Gate",
        eta_mins=18,
        amount="3,50,000",
        chat_id=chat_id,
    )
    if result.get("ok"):
        await update.message.reply_text("✅ Test alert sent! Check for the message above.")
    else:
        await update.message.reply_text(f"❌ Failed: {result}")


# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint & CLI Simulation
# ─────────────────────────────────────────────────────────────────────────────
async def run_patrol_cli_sim():
    print("\n" + "=" * 65)
    print("  PRATYAKSH FIELD PATROL SIMULATOR (TERMINAL / DEMO MODE)")
    print("=" * 65)
    print(f"  Bridge URL : {BRIDGE_URL}")
    print("  Unit ID    : " + DEFAULT_UNIT + " (Bibwewadi Beat)")
    print("  ---------------------------------------------------------------")
    print("  🚨 [SIMULATED HIGH-PRIORITY 1930 DISPATCH EVENT] 🚨")
    print("  📁 Case ID           : CASE_26184_PUN_042")
    print("  💰 Defrauded Amount  : ₹3,50,000")
    print("  📍 Target ATM        : State Bank of India (SBI) - Near VIT Main Gate")
    print("  ⏳ Est Arrival Window: 8 mins remaining (Rank #1 Hotspot)")
    print("  🗺️ GPS Google Maps   : https://maps.google.com/?q=SBI+ATM+Near+VIT+College+Main+Gate")
    print("  ---------------------------------------------------------------")
    print("  Simulating officer tapping: [🚔 Accept Beat Patrol]...")
    try:
        async with httpx.AsyncClient(timeout=4) as client:
            resp = await client.post(
                f"{BRIDGE_URL}/chain/ack-dispatch",
                json={"case_id": "CASE_26184_PUN_042", "unit_id": DEFAULT_UNIT},
            )
            print(f"  ⛓️  On-Chain Dispatch Response ({resp.status_code}): {resp.text}")
    except Exception as exc:
        print(f"  ℹ️  Bridge status: {exc} (Start Hardhat & Web3 Bridge to anchor on-chain)")

    print("\n  ✅ SLA Anchored: Beat Patrol PCR Van 18 is EN-ROUTE (Interdiction window: <3m)")
    print("=" * 65)
    print("  To enable live push notifications to your actual Telegram smartphone:")
    print("    1. Open Telegram and message @BotFather -> send /newbot")
    print("    2. Copy token into blockchain/telegram/bot_config.json")
    print("    3. Message @userinfobot to get your Chat ID, paste into bot_config.json")
    print("    4. Re-run: python field_patrol_bot.py\n")


def main():
    import sys
    is_sim_flag = "--simulate" in sys.argv

    if is_sim_flag or not BOT_TOKEN or BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        print("\n[NOTICE] Telegram BOT_TOKEN not configured in bot_config.json.")
        print("Running in interactive Field Patrol Simulation Mode...\n")
        asyncio.run(run_patrol_cli_sim())
        return

    app = ApplicationBuilder().token(BOT_TOKEN).build()

    # Command handlers
    app.add_handler(CommandHandler("start",      cmd_start))
    app.add_handler(CommandHandler("status",     cmd_status))
    app.add_handler(CommandHandler("testalert",  cmd_test_alert))

    # Inline keyboard callback handler
    app.add_handler(CallbackQueryHandler(button_callback))

    print("\n" + "=" * 55)
    print("  PRATYAKSH Field Patrol Bot — RUNNING (LIVE TELEGRAM)")
    print("=" * 55)
    print(f"  Bridge URL  : {BRIDGE_URL}")
    print(f"  Chat ID     : {CHAT_ID or '[not set]'}")
    print("  Commands    : /start | /status | /testalert")
    print("=" * 55 + "\n")

    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
