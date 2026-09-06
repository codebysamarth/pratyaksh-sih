/**
 * deploy.js — PRATYAKSH SIH26184 (Dev 3)
 *
 * Deploys ATMConsortiumGate.sol to the active Hardhat network.
 * On success writes blockchain/bridge/contract_info.json so the
 * Python Web3 bridge can always find the latest contract address + ABI.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 */

const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  console.log("\n========================================");
  console.log("  PRATYAKSH — ATMConsortiumGate Deploy  ");
  console.log("========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`[Info] Deploying with account: ${deployer.address}`);
  console.log(`[Info] Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy contract
  const GateFactory = await hre.ethers.getContractFactory("ATMConsortiumGate");
  const gate = await GateFactory.deploy();
  await gate.waitForDeployment();

  const address = await gate.getAddress();
  console.log(`[Success] ATMConsortiumGate deployed to: ${address}`);

  // Fetch ABI from Hardhat artifacts
  const artifact = await hre.artifacts.readArtifact("ATMConsortiumGate");

  // Write contract_info.json into bridge/ folder so Python bridge loads it
  const outPath = path.resolve(__dirname, "../bridge/contract_info.json");
  const contractInfo = {
    address:     address,
    abi:         artifact.abi,
    network:     hre.network.name,
    deployedAt:  new Date().toISOString(),
    deployer:    deployer.address,
  };
  fs.writeFileSync(outPath, JSON.stringify(contractInfo, null, 2));
  console.log(`[Success] contract_info.json written to: ${outPath}`);

  // Log a summary
  console.log("\n--- Deployment Summary ---");
  console.log(`  Contract  : ATMConsortiumGate`);
  console.log(`  Address   : ${address}`);
  console.log(`  Network   : ${hre.network.name}`);
  console.log(`  Timestamp : ${contractInfo.deployedAt}`);
  console.log("--------------------------\n");

  // Quick smoke test — call a view function to verify the contract is live
  const i4cAdmin = await gate.i4cAdmin();
  console.log(`[Verify] i4cAdmin = ${i4cAdmin}`);
  console.log("[Verify] Deployment confirmed ✓\n");
}

main().catch((error) => {
  console.error("[Error]", error);
  process.exitCode = 1;
});
