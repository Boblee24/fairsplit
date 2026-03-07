import { ethers } from "hardhat";

async function main() {
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  console.log("Deploying FairSplit...");
  const FairSplit = await ethers.getContractFactory("FairSplit");
  const fairsplit = await FairSplit.deploy(USDC_ADDRESS);
  await fairsplit.waitForDeployment();

  const address = await fairsplit.getAddress();
  console.log(`✅ FairSplit deployed to: ${address}`);
  console.log(`\nPaste this in .env.local:`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch(console.error);