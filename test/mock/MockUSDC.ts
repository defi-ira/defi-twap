import { expect } from "chai";
import { ethers } from "hardhat";

describe("USDC Minting Test", function () {
    let mockUSDC: any;
    let owner: any, addr1: any;

    beforeEach(async function () {
        // Deploy the MockUSDC contract before each test
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        mockUSDC = await MockUSDC.deploy();
        [owner, addr1] = await ethers.getSigners();
    });

    it("Should mint USDC successfully", async function () {
        // Mint 1000 USDC to addr1
        const amountToMint = ethers.utils.parseUnits("1000", 6); // USDC has 6 decimals
        await mockUSDC.mint(addr1.address, amountToMint);

        // Check addr1's USDC balance
        const balance = await mockUSDC.balanceOf(addr1.address);
        expect(balance).to.equal(amountToMint);
    });
});