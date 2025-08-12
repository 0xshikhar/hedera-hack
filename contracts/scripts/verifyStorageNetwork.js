const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Verifying FiletheticStorageNetwork with account:", deployer.address);
  
  // Read deployment info
  const fs = require("fs");
  const networkName = network.name === "hardhat" ? "localhost" : network.name;
  const deploymentPath = `../app/src/deployments/${networkName}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`Deployment file not found: ${deploymentPath}`);
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const storageNetworkAddress = deployment.filetheticStorageNetwork;
  
  if (!storageNetworkAddress) {
    console.error("Storage network address not found in deployment file");
    process.exit(1);
  }
  
  console.log("Storage Network Address:", storageNetworkAddress);
  
  // Get contract instance
  const FiletheticStorageNetwork = await ethers.getContractFactory("FiletheticStorageNetwork");
  const storageNetwork = FiletheticStorageNetwork.attach(storageNetworkAddress);
  
  // Verify contract functions
  console.log("\n=== Contract Verification ===");
  
  try {
    const providerCount = await storageNetwork.getProviderCount();
    console.log("✅ Provider Count:", providerCount.toString());
    
    const networkStats = await storageNetwork.getNetworkStats();
    console.log("✅ Network Stats:");
    console.log("   - Total Providers:", networkStats[0].toString());
    console.log("   - Active Providers:", networkStats[1].toString());
    console.log("   - Network Bandwidth:", networkStats[2].toString(), "Mbps");
    console.log("   - Network Storage:", networkStats[3].toString(), "TB");
    
    const minStake = await storageNetwork.minStakeAmount();
    console.log("✅ Minimum Stake:", ethers.formatEther(minStake), "U2U");
    
    const activeProviders = await storageNetwork.getActiveProviders();
    console.log("✅ Active Provider Addresses:", activeProviders);
    
    if (providerCount > 0) {
      console.log("\n=== Provider Details ===");
      for (let i = 0; i < providerCount; i++) {
        const provider = await storageNetwork.getProviderByIndex(i);
        console.log(`\nProvider ${i + 1}:`);
        console.log("   Address:", provider.provider);
        console.log("   Staked Amount:", ethers.formatEther(provider.stakedAmount), "U2U");
        console.log("   Bandwidth:", provider.bandwidthMbps.toString(), "Mbps");
        console.log("   Storage:", provider.storageTB.toString(), "TB");
        console.log("   Uptime:", (Number(provider.uptime) / 100).toFixed(2), "%");
        console.log("   IPFS Gateway:", provider.ipfsGateway);
        console.log("   Location:", provider.location);
        console.log("   Active:", provider.isActive);
        console.log("   Datasets Hosted:", provider.datasetsHosted.toString());
        console.log("   Total Earnings:", ethers.formatEther(provider.totalEarnings), "U2U");
      }
    }
    
    console.log("\n✅ All contract functions working correctly!");
    
  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
