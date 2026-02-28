const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HotSpark Token", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  const MAX_SUPPLY = ethers.parseUnits("1000000000", 18); // 1B HOT

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const HotSpark = await ethers.getContractFactory("HotSpark");
    token = await HotSpark.deploy();
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      expect(await token.name()).to.equal("HotSpark");
      expect(await token.symbol()).to.equal("HOT");
    });

    it("Should mint full supply to deployer", async function () {
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
      expect(await token.balanceOf(owner.address)).to.equal(MAX_SUPPLY);
    });

    it("Should assign admin role to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
      expect(
        await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens correctly", async function () {
      const amount = ethers.parseUnits("1000", 18);

      await token.transfer(addr1.address, amount);

      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause and block transfers", async function () {
      const PAUSER_ROLE = await token.PAUSER_ROLE();
      expect(
        await token.hasRole(PAUSER_ROLE, owner.address)
      ).to.equal(true);

      await token.pause();

      await expect(
        token.transfer(addr1.address, 100)
      ).to.be.reverted;
    });

    it("Should allow unpause", async function () {
      await token.pause();
      await token.unpause();

      await expect(
        token.transfer(addr1.address, 100)
      ).to.not.be.reverted;
    });
  });

  describe("Burning", function () {
    it("Should allow holder to burn tokens", async function () {
      const burnAmount = ethers.parseUnits("1000", 18);

      await token.burn(burnAmount);

      expect(await token.totalSupply()).to.equal(
        MAX_SUPPLY - burnAmount
      );
    });

    it("Should allow burnFrom with approval", async function () {
      const burnAmount = ethers.parseUnits("1000", 18);

      await token.transfer(addr1.address, burnAmount);
      await token.connect(addr1).approve(owner.address, burnAmount);

      await token.burnFrom(addr1.address, burnAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });
  });
});