// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ATMConsortiumGate
 * @author PRATYAKSH — SIH 26184 (Dev 3)
 * @notice Manages inter-agency SLAs, pre-dispense liens, fan-out batch freezes,
 *         and Section 65B / BSA 2023 tamper-proof audit trails for cybercrime cash-out interception.
 * @dev    Deployed on a private consortium EVM (Hardhat localhost). Admin is the I4C authority node.
 */
contract ATMConsortiumGate {

    // ─────────────────────────────────────────────────────────────────────────
    // State variables
    // ─────────────────────────────────────────────────────────────────────────

    address public i4cAdmin;

    // Lien lifecycle state machine
    enum LienStatus { NONE, HOLD_REQUESTED, LIEN_ACTIVE, REVERSED }

    // ─────────────────────────────────────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Section 65B / BSA-compliant evidence record for a cybercrime case
    struct CaseEvidence {
        string  caseId;
        bytes32 alertHash;           // SHA-256 of (caseId:topATM:timestamp)
        string  topATMCluster;
        uint256 alertTimestamp;
        bool    isPoliceDispatched;
        string  dispatchedUnitId;
        uint256 policeAckTimestamp;
    }

    /// @notice Pre-dispense lien placed on a mule account hash by a bank node
    struct MuleLien {
        bytes32    muleAccountHash;
        string     caseId;
        string     bankId;
        LienStatus status;
        uint256    lienTimestamp;
    }

    /// @notice ATM-level incident record (blocked or allowed)
    struct ATMIncident {
        string  atmId;
        bytes32 cardHash;
        string  outcome;     // "BLOCKED_BY_SMART_LIEN" | "ALLOWED"
        uint256 timestamp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Storage
    // ─────────────────────────────────────────────────────────────────────────

    mapping(string  => CaseEvidence) public cases;
    mapping(bytes32 => MuleLien)     public muleLiens;
    ATMIncident[]                    public incidentHistory;

    // ─────────────────────────────────────────────────────────────────────────
    // Events — consumed by frontend WebSocket listener (Dev 2) and Python bridge
    // ─────────────────────────────────────────────────────────────────────────

    event AlertLogged(
        string  indexed caseId,
        bytes32         alertHash,
        string          topATMCluster,
        uint256         timestamp
    );

    event BankLienMarked(
        string  indexed caseId,
        string          bankId,
        bytes32 indexed muleAccountHash,
        uint256         timestamp
    );

    event PoliceDispatched(
        string  indexed caseId,
        string          unitId,
        uint256         timestamp
    );

    event ATMCashoutBlocked(
        string  indexed atmId,
        bytes32 indexed cardHash,
        uint256         timestamp
    );

    event LienReversed(
        bytes32 indexed muleAccountHash,
        string          caseId,
        uint256         timestamp
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == i4cAdmin, "Only I4C Authority can execute");
        _;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    constructor() {
        i4cAdmin = msg.sender;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Core Functions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice 1. Logs Prediction & Proof of Alert (Section 65B Evidence)
     * @dev    Any consortium node may call; admin privilege not required so
     *         bank and police nodes can also anchor evidence without routing through I4C.
     * @param _caseId        Unique cybercrime case identifier (e.g. "CASE_26184_001")
     * @param _alertHash     keccak256 / SHA-256 computed off-chain from case payload
     * @param _topATMCluster Human-readable ATM location cluster (e.g. "SBI ATM - VIT Pune")
     */
    function logPrediction(
        string memory _caseId,
        bytes32       _alertHash,
        string memory _topATMCluster
    ) public {
        cases[_caseId] = CaseEvidence({
            caseId:              _caseId,
            alertHash:           _alertHash,
            topATMCluster:       _topATMCluster,
            alertTimestamp:      block.timestamp,
            isPoliceDispatched:  false,
            dispatchedUnitId:    "",
            policeAckTimestamp:  0
        });

        emit AlertLogged(_caseId, _alertHash, _topATMCluster, block.timestamp);
    }

    /**
     * @notice 2. Bank Node places an Automated Pre-Dispense Lien
     * @param _caseId          Linked cybercrime case
     * @param _bankId          Participating bank node ID (e.g. "HDFC_NODE_PUN")
     * @param _muleAccountHash keccak256 of mule account number — no raw PII on-chain
     */
    function markBankLien(
        string memory _caseId,
        string memory _bankId,
        bytes32       _muleAccountHash
    ) public {
        muleLiens[_muleAccountHash] = MuleLien({
            muleAccountHash: _muleAccountHash,
            caseId:          _caseId,
            bankId:          _bankId,
            status:          LienStatus.LIEN_ACTIVE,
            lienTimestamp:   block.timestamp
        });

        emit BankLienMarked(_caseId, _bankId, _muleAccountHash, block.timestamp);
    }

    /**
     * @notice 3. Batch Freeze for Fan-Out Smurfing (e.g. ₹5 Lakh split across 10 accounts)
     * @dev    Calls markBankLien internally; emits BankLienMarked once per mule hash.
     * @param _caseId     Linked cybercrime case
     * @param _bankId     Participating bank node ID
     * @param _muleHashes Array of mule account keccak256 hashes
     */
    function batchFreezeMules(
        string memory   _caseId,
        string memory   _bankId,
        bytes32[] memory _muleHashes
    ) public {
        for (uint256 i = 0; i < _muleHashes.length; i++) {
            markBankLien(_caseId, _bankId, _muleHashes[i]);
        }
    }

    /**
     * @notice 4. Ground Police Unit / Telegram Bot Acknowledges Dispatch
     * @dev    Called by the Web3 bridge when the field officer taps "Accept Beat Patrol".
     * @param _caseId  Linked cybercrime case
     * @param _unitId  Police unit identifier (e.g. "PCR_VAN_18")
     */
    function acknowledgePoliceDispatch(
        string memory _caseId,
        string memory _unitId
    ) public {
        CaseEvidence storage c = cases[_caseId];
        c.isPoliceDispatched   = true;
        c.dispatchedUnitId     = _unitId;
        c.policeAckTimestamp   = block.timestamp;

        emit PoliceDispatched(_caseId, _unitId, block.timestamp);
    }

    /**
     * @notice 5. Pre-Dispense Verification — called by ATM Terminal Simulator
     * @dev    Checks whether a lien exists. Writes to incidentHistory for audit.
     * @param _cardOrMuleHash keccak256 hash of the card / mule account being verified
     * @param _atmId          ATM identifier string
     * @return canDispense    false if lien is active (cash-out blocked)
     */
    function verifyCardBeforeDispense(
        bytes32       _cardOrMuleHash,
        string memory _atmId
    ) public returns (bool canDispense) {
        if (muleLiens[_cardOrMuleHash].status == LienStatus.LIEN_ACTIVE) {
            incidentHistory.push(ATMIncident({
                atmId:     _atmId,
                cardHash:  _cardOrMuleHash,
                outcome:   "BLOCKED_BY_SMART_LIEN",
                timestamp: block.timestamp
            }));
            emit ATMCashoutBlocked(_atmId, _cardOrMuleHash, block.timestamp);
            return false;
        }
        // Log allowed dispense too (for full audit trail)
        incidentHistory.push(ATMIncident({
            atmId:     _atmId,
            cardHash:  _cardOrMuleHash,
            outcome:   "ALLOWED",
            timestamp: block.timestamp
        }));
        return true;
    }

    /**
     * @notice 6. Reverse a lien (admin only) — e.g. false positive or court order
     * @param _muleAccountHash Target mule account hash
     */
    function reverseLien(bytes32 _muleAccountHash) public onlyAdmin {
        MuleLien storage lien = muleLiens[_muleAccountHash];
        require(lien.status == LienStatus.LIEN_ACTIVE, "No active lien to reverse");
        lien.status = LienStatus.REVERSED;
        emit LienReversed(_muleAccountHash, lien.caseId, block.timestamp);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// @return Total number of ATM blocked/allowed incidents logged
    function getIncidentCount() public view returns (uint256) {
        return incidentHistory.length;
    }

    /// @return Lien status for a given mule account hash (0=NONE,1=HOLD,2=ACTIVE,3=REVERSED)
    function getLienStatus(bytes32 _muleAccountHash) public view returns (LienStatus) {
        return muleLiens[_muleAccountHash].status;
    }

    /// @return True if a case exists and police has been dispatched
    function isCaseDispatched(string memory _caseId) public view returns (bool) {
        return cases[_caseId].isPoliceDispatched;
    }
}
