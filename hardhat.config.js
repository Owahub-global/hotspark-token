require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL,
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 97
    }
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};