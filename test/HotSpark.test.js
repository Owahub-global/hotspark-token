const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("HotSpark Token", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const HotSpark = await ethers.getContractFactory("HotSpark");
    const token = await HotSpark.deploy();
    await token.waitForDeployment();
    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("HotSpark");
      expect(await token.symbol()).to.equal("HOT");
    });

    it("Should assign admin role to deployer", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const adminRole = await token.DEFAULT_ADMIN_ROLE();
      expect(await token.hasRole(adminRole, owner.address)).to.be.true;
    });

    it("Should have correct max supply (1 billion)", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const maxSupply = await token.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.parseEther("1000000000"));
    });

    it("Should start with zero total supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await token.mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should not allow non-minter to mint", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await expect(token.connect(addr1).mint(addr2.address, amount))
        .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("Should not mint to zero address", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await expect(token.mint(ethers.ZeroAddress, amount))
        .to.be.revertedWithCustomError(token, "HotSpark__ZeroAddress");
    });

    it("Should not exceed max supply", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      const maxSupply = await token.MAX_SUPPLY();
      const amount = maxSupply + 1n;
      await expect(token.mint(addr1.address, amount))
        .to.be.revertedWithCustomError(token, "HotSpark__MaxSupplyExceeded");
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      await token.pause();
      expect(await token.paused()).to.be.true;
    });

    it("Should allow pauser to unpause", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      await token.pause();
      await token.unpause();
      expect(await token.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await token.mint(owner.address, amount);
      await token.pause();
      await expect(token.transfer(addr1.address, amount))
        .to.be.revertedWithCustomError(token, "ERC20Pausable__PausedTokenTransfers");
    });
  });

  describe("Burning", function () {
    it("Should allow token holder to burn their tokens", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await token.mint(owner.address, amount);
      await token.burn(amount);
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });

    it("Should allow burning from approved address", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await token.mint(owner.address, amount);
      await token.approve(addr1.address, amount);
      await token.connect(addr1).burnFrom(owner.address, amount);
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });
  });
});