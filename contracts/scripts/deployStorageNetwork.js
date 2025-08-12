const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying FiletheticStorageNetwork with account:", deployer.address);
  
  // Deploy FiletheticStorageNetwork contract
  console.log("Deploying FiletheticStorageNetwork...");
  const FiletheticStorageNetwork = await ethers.getContractFactory("FiletheticStorageNetwork");
  const storageNetwork = await FiletheticStorageNetwork.deploy();
  await storageNetwork.waitForDeployment();
  const storageNetworkAddress = await storageNetwork.getAddress();
  console.log("FiletheticStorageNetwork deployed to:", storageNetworkAddress);
  
  console.log("Deployment completed!");
  
  // Write deployment info to update the existing deployment file
  const fs = require("fs");
  const deploymentDir = "../app/src/deployments";
  const networkName = network.name === "hardhat" ? "localhost" : network.name;
  const deploymentPath = `${deploymentDir}/${networkName}.json`;
  
  // Read existing deployment info
  let deploymentInfo = {};
  if (fs.existsSync(deploymentPath)) {
    const existingData = fs.readFileSync(deploymentPath, 'utf8');
    deploymentInfo = JSON.parse(existingData);
  }
  
  // Add storage network address
  deploymentInfo.filetheticStorageNetwork = storageNetworkAddress;
  
  // Write updated deployment info
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Storage network address added to ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
