import { expect } from "chai";
import { ethers } from "hardhat";

describe("WBTC Minting Test", function () {
    let mockWBTC: any;
    let owner: any, addr1: any;

    beforeEach(async function () {
        // Deploy the MockWBTC contract before each test
        const MockWBTC = await ethers.getContractFactory("MockWBTC");
        mockWBTC = await MockWBTC.deploy();
        [owner, addr1] = await ethers.getSigners();
    });

    it("Should mint WBTC successfully", async function () {
        // Mint 1000 WBTC to addr1
        const amountToMint = ethers.utils.parseUnits("1000", 8); // WBTC has 8 decimals
        await mockWBTC.mint(addr1.address, amountToMint);

        // Check addr1's WBTC balance
        const balance = await mockWBTC.balanceOf(addr1.address);
        expect(balance).to.equal(amountToMint);
    });
});