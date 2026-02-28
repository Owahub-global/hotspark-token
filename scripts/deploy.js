const hre = require("hardhat");

async function main() {
  console.log("🔥 Deploying HotSpark Token to BSC Testnet...");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

  // Deploy contract
  const HotSpark = await ethers.getContractFactory("HotSpark");
  console.log("Deploying HotSpark...");
  
  const token = await HotSpark.deploy();
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log("✅ HotSpark deployed to:", tokenAddress);
  
  // Verify roles
  const adminRole = await token.DEFAULT_ADMIN_ROLE();
  const minterRole = await token.MINTER_ROLE();
  const pauserRole = await token.PAUSER_ROLE();
  
  console.log("🔐 Role check:");
  console.log("   - Admin role:", await token.hasRole(adminRole, deployer.address));
  console.log("   - Minter role:", await token.hasRole(minterRole, deployer.address));
  console.log("   - Pauser role:", await token.hasRole(pauserRole, deployer.address));
  
  // Token info
  console.log("📊 Token Info:");
  console.log("   - Name:", await token.name());
  console.log("   - Symbol:", await token.symbol());
  console.log("   - Decimals:", await token.decimals());
  console.log("   - Max Supply:", ethers.formatEther(await token.MAX_SUPPLY()), "HOT");
  console.log("   - Total Supply:", ethers.formatEther(await token.totalSupply()), "HOT");
  
  console.log("\n🔍 BSCScan: https://testnet.bscscan.com/address/" + tokenAddress);
  console.log("\n📝 To verify contract:");
  console.log(`npx hardhat verify --network bscTestnet ${tokenAddress}`);
  
  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    token: tokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    bscscan: `https://testnet.bscscan.com/address/${tokenAddress}`
  };
  
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  
  fs.writeFileSync(
    `deployments/${hre.network.name}-hotspark.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to:", `deployments/${hre.network.name}-hotspark.json`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});