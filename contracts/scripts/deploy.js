// Deployment script for MakmurTani contracts
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of MakmurTani contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Deploy RWAFarmersToken
  console.log("Deploying RWAFarmersToken...");
  const RWAFarmersToken = await ethers.getContractFactory("RWAFarmersToken");
  const farmersToken = await RWAFarmersToken.deploy();
  await farmersToken.waitForDeployment();
  const farmersTokenAddress = await farmersToken.getAddress();
  console.log(`RWAFarmersToken deployed to: ${farmersTokenAddress}`);

  // Deploy IndonesianFarmlandRegistry
  console.log("Deploying IndonesianFarmlandRegistry...");
  const IndonesianFarmlandRegistry = await ethers.getContractFactory("IndonesianFarmlandRegistry");
  const farmlandRegistry = await IndonesianFarmlandRegistry.deploy(farmersTokenAddress);
  await farmlandRegistry.waitForDeployment();
  const farmlandRegistryAddress = await farmlandRegistry.getAddress();
  console.log(`IndonesianFarmlandRegistry deployed to: ${farmlandRegistryAddress}`);

  // Deploy MakmurTaniMarketplace
  console.log("Deploying MakmurTaniMarketplace...");
  const feeCollector = deployer.address; // Using deployer as fee collector for now
  const platformFeePercentage = 250; // 2.5% fee
  
  const MakmurTaniMarketplace = await ethers.getContractFactory("MakmurTaniMarketplace");
  const marketplace = await MakmurTaniMarketplace.deploy(
    farmersTokenAddress,
    feeCollector,
    platformFeePercentage
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`MakmurTaniMarketplace deployed to: ${marketplaceAddress}`);

  // Deploy MakmurTaniLending
  console.log("Deploying MakmurTaniLending...");
  const MakmurTaniLending = await ethers.getContractFactory("MakmurTaniLending");
  const lending = await MakmurTaniLending.deploy(farmersTokenAddress);
  await lending.waitForDeployment();
  const lendingAddress = await lending.getAddress();
  console.log(`MakmurTaniLending deployed to: ${lendingAddress}`);

  console.log("Deployment complete!");
  console.log({
    RWAFarmersToken: farmersTokenAddress,
    IndonesianFarmlandRegistry: farmlandRegistryAddress,
    MakmurTaniMarketplace: marketplaceAddress,
    MakmurTaniLending: lendingAddress
  });

  // Save the contract addresses to a file for easy access
  const fs = require("fs");
  const contractAddresses = {
    RWAFarmersToken: farmersTokenAddress,
    IndonesianFarmlandRegistry: farmlandRegistryAddress,
    MakmurTaniMarketplace: marketplaceAddress,
    MakmurTaniLending: lendingAddress
  };
  
  fs.writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("Contract addresses saved to deployed-contracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 