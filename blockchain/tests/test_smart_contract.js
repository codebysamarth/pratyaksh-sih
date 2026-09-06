/**
 * test_smart_contract.js  —  PRATYAKSH SIH26184  —  Dev 3
 * ==========================================================
 * Hardhat/Ethers.js unit tests for ATMConsortiumGate.sol
 *
 * Run: npx hardhat test
 * Run (verbose): npx hardhat test --verbose
 */

const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("ATMConsortiumGate", function () {
  let gate;
  let owner, addr1, addr2;

  // ── Setup ──────────────────────────────────────────────────────────────────
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const GateFactory = await ethers.getContractFactory("ATMConsortiumGate");
    gate = await GateFactory.deploy();
    await gate.waitForDeployment();
  });

  // ── 1. Deployment ──────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("Sets the deployer as i4cAdmin", async function () {
      expect(await gate.i4cAdmin()).to.equal(owner.address);
    });

    it("Starts with zero incidents", async function () {
      expect(await gate.getIncidentCount()).to.equal(0n);
    });
  });

  // ── 2. logPrediction ───────────────────────────────────────────────────────
  describe("logPrediction()", function () {
    const CASE_ID   = "CASE_26184_001";
    const ATM_NAME  = "SBI ATM - VIT Pune";
    const alertHash = ethers.keccak256(ethers.toUtf8Bytes("mock-alert-payload"));

    it("Stores CaseEvidence with correct fields", async function () {
      await gate.logPrediction(CASE_ID, alertHash, ATM_NAME);

      const c = await gate.cases(CASE_ID);
      expect(c.caseId).to.equal(CASE_ID);
      expect(c.alertHash).to.equal(alertHash);
      expect(c.topATMCluster).to.equal(ATM_NAME);
      expect(c.isPoliceDispatched).to.equal(false);
      expect(c.alertTimestamp).to.be.gt(0n);
    });

    it("Emits AlertLogged event with correct arguments", async function () {
      const tx = gate.logPrediction(CASE_ID, alertHash, ATM_NAME);
      await expect(tx)
        .to.emit(gate, "AlertLogged")
        .withArgs(CASE_ID, alertHash, ATM_NAME, anyValue);
    });

    it("Allows any address to log a prediction", async function () {
      // Non-admin addresses should be allowed (only admin-only funcs are restricted)
      await expect(
        gate.connect(addr1).logPrediction("CASE_ADDR1", alertHash, ATM_NAME)
      ).to.not.be.reverted;
    });
  });

  // ── 3. markBankLien ────────────────────────────────────────────────────────
  describe("markBankLien()", function () {
    const CASE_ID    = "CASE_26184_001";
    const BANK_ID    = "HDFC_NODE_PUN";
    let muleHash;

    beforeEach(function () {
      muleHash = ethers.keccak256(ethers.toUtf8Bytes("9876543210_HDFC"));
    });

    it("Sets lien status to LIEN_ACTIVE (2)", async function () {
      await gate.markBankLien(CASE_ID, BANK_ID, muleHash);
      const lien = await gate.muleLiens(muleHash);
      expect(lien.status).to.equal(2n); // LienStatus.LIEN_ACTIVE
    });

    it("Stores correct caseId and bankId", async function () {
      await gate.markBankLien(CASE_ID, BANK_ID, muleHash);
      const lien = await gate.muleLiens(muleHash);
      expect(lien.caseId).to.equal(CASE_ID);
      expect(lien.bankId).to.equal(BANK_ID);
    });

    it("Emits BankLienMarked event", async function () {
      await expect(gate.markBankLien(CASE_ID, BANK_ID, muleHash))
        .to.emit(gate, "BankLienMarked")
        .withArgs(CASE_ID, BANK_ID, muleHash, anyValue);
    });

    it("getLienStatus() returns LIEN_ACTIVE", async function () {
      await gate.markBankLien(CASE_ID, BANK_ID, muleHash);
      expect(await gate.getLienStatus(muleHash)).to.equal(2n);
    });
  });

  // ── 4. batchFreezeMules ────────────────────────────────────────────────────
  describe("batchFreezeMules()", function () {
    const CASE_ID = "CASE_26184_BATCH";
    const BANK_ID = "SBI_NODE_MUM";
    let muleHashes;

    beforeEach(function () {
      const accounts = ["ACC_001", "ACC_002", "ACC_003", "ACC_004", "ACC_005"];
      muleHashes = accounts.map(a => ethers.keccak256(ethers.toUtf8Bytes(a)));
    });

    it("Freezes all mule accounts in one transaction", async function () {
      await gate.batchFreezeMules(CASE_ID, BANK_ID, muleHashes);
      for (const h of muleHashes) {
        const lien = await gate.muleLiens(h);
        expect(lien.status).to.equal(2n, `Expected LIEN_ACTIVE for hash ${h}`);
      }
    });

    it("Emits BankLienMarked for each account", async function () {
      const tx = await gate.batchFreezeMules(CASE_ID, BANK_ID, muleHashes);
      const receipt = await tx.wait();
      const lienEvents = receipt.logs.filter(
        log => log.fragment && log.fragment.name === "BankLienMarked"
      );
      expect(lienEvents.length).to.equal(muleHashes.length);
    });

    it("Handles empty batch gracefully", async function () {
      await expect(gate.batchFreezeMules(CASE_ID, BANK_ID, [])).to.not.be.reverted;
    });
  });

  // ── 5. acknowledgePoliceDispatch ───────────────────────────────────────────
  describe("acknowledgePoliceDispatch()", function () {
    const CASE_ID = "CASE_26184_001";
    const UNIT_ID = "PCR_VAN_18";
    const alertHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

    beforeEach(async function () {
      await gate.logPrediction(CASE_ID, alertHash, "SBI ATM Pune");
    });

    it("Sets isPoliceDispatched to true", async function () {
      await gate.acknowledgePoliceDispatch(CASE_ID, UNIT_ID);
      const c = await gate.cases(CASE_ID);
      expect(c.isPoliceDispatched).to.equal(true);
    });

    it("Sets dispatchedUnitId correctly", async function () {
      await gate.acknowledgePoliceDispatch(CASE_ID, UNIT_ID);
      const c = await gate.cases(CASE_ID);
      expect(c.dispatchedUnitId).to.equal(UNIT_ID);
    });

    it("Sets policeAckTimestamp > 0", async function () {
      await gate.acknowledgePoliceDispatch(CASE_ID, UNIT_ID);
      const c = await gate.cases(CASE_ID);
      expect(c.policeAckTimestamp).to.be.gt(0n);
    });

    it("Emits PoliceDispatched event", async function () {
      await expect(gate.acknowledgePoliceDispatch(CASE_ID, UNIT_ID))
        .to.emit(gate, "PoliceDispatched")
        .withArgs(CASE_ID, UNIT_ID, anyValue);
    });

    it("isCaseDispatched() returns true after dispatch", async function () {
      await gate.acknowledgePoliceDispatch(CASE_ID, UNIT_ID);
      expect(await gate.isCaseDispatched(CASE_ID)).to.equal(true);
    });
  });

  // ── 6. verifyCardBeforeDispense ────────────────────────────────────────────
  describe("verifyCardBeforeDispense()", function () {
    const ATM_ID   = "ATM_SBI_VITP_01";
    const CASE_ID  = "CASE_26184_001";
    const BANK_ID  = "HDFC_NODE_PUN";
    let cardHash;

    beforeEach(function () {
      cardHash = ethers.keccak256(ethers.toUtf8Bytes("4111111111111111"));
    });

    it("Returns true (canDispense) when no lien exists", async function () {
      const result = await gate.verifyCardBeforeDispense.staticCall(cardHash, ATM_ID);
      expect(result).to.equal(true);
    });

    it("Returns false (BLOCKED) when lien is active", async function () {
      await gate.markBankLien(CASE_ID, BANK_ID, cardHash);
      const result = await gate.verifyCardBeforeDispense.staticCall(cardHash, ATM_ID);
      expect(result).to.equal(false);
    });

    it("Increments incident count when blocked", async function () {
      await gate.markBankLien(CASE_ID, BANK_ID, cardHash);
      const before = await gate.getIncidentCount();
      await gate.verifyCardBeforeDispense(cardHash, ATM_ID);
      const after = await gate.getIncidentCount();
      expect(after).to.equal(before + 1n);
    });

    it("Emits ATMCashoutBlocked when blocked", async function () {
      await gate.markBankLien(CASE_ID, BANK_ID, cardHash);
      await expect(gate.verifyCardBeforeDispense(cardHash, ATM_ID))
        .to.emit(gate, "ATMCashoutBlocked")
        .withArgs(ATM_ID, cardHash, anyValue);
    });

    it("Records ALLOWED outcome when no lien", async function () {
      await gate.verifyCardBeforeDispense(cardHash, ATM_ID);
      const inc = await gate.incidentHistory(0);
      expect(inc.outcome).to.equal("ALLOWED");
    });

    it("Records BLOCKED_BY_SMART_LIEN outcome when lien active", async function () {
      await gate.markBankLien(CASE_ID, BANK_ID, cardHash);
      await gate.verifyCardBeforeDispense(cardHash, ATM_ID);
      const count = await gate.getIncidentCount();
      const inc = await gate.incidentHistory(count - 1n);
      expect(inc.outcome).to.equal("BLOCKED_BY_SMART_LIEN");
    });
  });

  // ── 7. reverseLien (admin-only) ────────────────────────────────────────────
  describe("reverseLien()", function () {
    const CASE_ID = "CASE_26184_001";
    const BANK_ID = "HDFC_NODE_PUN";
    let muleHash;

    beforeEach(async function () {
      muleHash = ethers.keccak256(ethers.toUtf8Bytes("MULE_ACC_X"));
      await gate.markBankLien(CASE_ID, BANK_ID, muleHash);
    });

    it("Changes lien status to REVERSED (3)", async function () {
      await gate.reverseLien(muleHash);
      expect(await gate.getLienStatus(muleHash)).to.equal(3n);
    });

    it("Emits LienReversed event", async function () {
      await expect(gate.reverseLien(muleHash))
        .to.emit(gate, "LienReversed")
        .withArgs(muleHash, CASE_ID, anyValue);
    });

    it("Reverts if called by non-admin", async function () {
      await expect(
        gate.connect(addr1).reverseLien(muleHash)
      ).to.be.revertedWith("Only I4C Authority can execute");
    });

    it("Reverts if lien is not active", async function () {
      await gate.reverseLien(muleHash);  // First reversal
      await expect(gate.reverseLien(muleHash)).to.be.revertedWith("No active lien to reverse");
    });
  });

  // ── 8. Full Integration Flow ───────────────────────────────────────────────
  describe("End-to-End: Fraud case → lien → block → dispatch", function () {
    it("Simulates a complete PRATYAKSH interception", async function () {
      const CASE    = "CASE_E2E_001";
      const ATM     = "HDFC ATM - Kalyani Nagar";
      const BANK    = "HDFC_NODE_PUN";
      const aHash   = ethers.keccak256(ethers.toUtf8Bytes(`${CASE}:${ATM}:9999`));
      const muleAcc = "92001234_HDFC_MULE";
      const muleH   = ethers.keccak256(ethers.toUtf8Bytes(muleAcc));
      const cardH   = muleH; // card = same account hash in this scenario

      // Step 1: Log AI prediction
      await expect(gate.logPrediction(CASE, aHash, ATM))
        .to.emit(gate, "AlertLogged");

      // Step 2: Bank places lien
      await expect(gate.markBankLien(CASE, BANK, muleH))
        .to.emit(gate, "BankLienMarked");

      // Step 3: ATM attempts to dispense — BLOCKED (state-changing call to write incident log)
      await expect(gate.verifyCardBeforeDispense(cardH, "ATM_HDFC_KN_01"))
        .to.emit(gate, "ATMCashoutBlocked");

      // Step 4: Police acknowledges dispatch (Telegram bot tap)
      await expect(gate.acknowledgePoliceDispatch(CASE, "PCR_VAN_18"))
        .to.emit(gate, "PoliceDispatched");

      // Verify final state
      expect(await gate.isCaseDispatched(CASE)).to.equal(true);
      expect(await gate.getIncidentCount()).to.be.gte(1n);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
async function _latestTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return BigInt(block.timestamp);
}
