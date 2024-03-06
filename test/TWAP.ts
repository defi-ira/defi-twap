import { ethers } from 'hardhat';
import { expect } from 'chai';

const ARB_UNISWAP_ROUTER = '0x101F443B4d1b059569D643917553c771E1b9663E';

describe('TWAP Contract', () => {
    let twapContract: any;
    let owner: any;
    let user: any;

    let usdcContract: any;
    let wbtcContract: any;

    beforeEach(async () => {
        // deploy mock USDC contract
        const MockUSDC = await ethers.getContractFactory('MockUSDC');
        const mockUSDC = await MockUSDC.deploy();
        await mockUSDC.deployed();
        usdcContract = mockUSDC;
        console.log(`MockUSDC deployed to: ${mockUSDC.address}`);

        // deploy mock WBTC contract
        const MockWBTC = await ethers.getContractFactory('MockWBTC');
        const mockWBTC = await MockWBTC.deploy();
        await mockWBTC.deployed();
        wbtcContract = mockWBTC;
        console.log(`MockWBTC deployed to: ${mockWBTC.address}`);

        const TWAPContract = await ethers.getContractFactory('TWAP');
        [owner, user] = await ethers.getSigners();

        twapContract = await TWAPContract.deploy(mockUSDC.address, mockWBTC.address, ARB_UNISWAP_ROUTER, 50000);
        await twapContract.deployed();

        // Fund contract with ETH
        await owner.sendTransaction({
            to: twapContract.address,
            value: ethers.utils.parseEther('1.0'),
            gasLimit: ethers.BigNumber.from(3000000) // Set the gas limit to 3 million
        });

        // Mint USDC
        await mockUSDC.mint(owner.address, ethers.utils.parseUnits('10000000', 'ether'));

        // Mint WBTC to the TWAP contract
        await mockWBTC.mint(twapContract.address, ethers.utils.parseUnits('1', 'ether'));
        
    });

    it('should allow deposit of USDC', async () => {
        // Approve TWAP contract to spend USDC
        await usdcContract.approve(twapContract.address, ethers.utils.parseUnits('1000000', 'ether'));
        const initialBalance = await twapContract.balanceOf(twapContract.address, usdcContract.address);
        expect(initialBalance).to.equal(0);

        await twapContract.depositToken(ethers.utils.parseUnits('2', 'ether'));
        const finalBalance = await twapContract.balanceOf(twapContract.address,  usdcContract.address);

        expect(finalBalance).to.equal(ethers.utils.parseUnits('2', 'ether'));
    });


    it('should allow withdrawal of WBTC', async () => {
        // Send WBTC to the TWAP contract
        const initialBalance = await twapContract.balanceOf(twapContract.address, wbtcContract.address);
        expect(initialBalance).to.equal(ethers.utils.parseUnits('1', 'ether'));

        // set allowance for TWAP contract to spend WBTC
        await twapContract.withdrawToken(ethers.utils.parseUnits('1', 'ether'));
        const finalBalance = await twapContract.balanceOf(twapContract.address, wbtcContract.address);
        expect(finalBalance).to.equal(0);
    });

    it('should swap USDC for WBTC', async () => {
        // ensure WBTC balance is 1
        const initialBalance = await twapContract.balanceOf(twapContract.address, wbtcContract.address);
        expect(initialBalance).to.equal(ethers.utils.parseUnits('1', 'ether'));

        // Approve TWAP contract to spend WBTC from TWAPWBTC contract

        // TODO: fix this code so that the correct signer is used to approve the token swap to the TWAP contract

        // Assuming deployer is the owner of WBTC tokens and has imported ethers and signer correctly
        await wbtcContract.connect(owner.address).approve(twapContract.address, ethers.utils.parseUnits('10', 'ether'));

        // Now, `signer` is the owner, so we check allowance like this (assuming signer's address is signerAddress)
        const allowance = await wbtcContract.allowance(owner, twapContract.address);
        expect(allowance).to.equal(ethers.utils.parseUnits('10', 'ether'));

        // deposit 10M TWAPUSDC to the TWAP contract
        await usdcContract.approve(twapContract.address, ethers.utils.parseUnits('10', 'ether'));
        await twapContract.depositToken(ethers.utils.parseUnits('1', 'ether'));

        // Perform swap and ensure WBTC balance is 2
        await twapContract.swapTokens();
        const finalBalance = await twapContract.balanceOf(twapContract.address, wbtcContract.address);
        expect(finalBalance).to.equal(ethers.utils.parseUnits('2', 'ether'));
    });

    it('should have three TWAPWBTC after three swaps', async() => {
        // Approve TWAP contract to spend USDC
        await usdcContract.approve(twapContract.address, ethers.utils.parseUnits('3', 'ether'));

        // Approve TWAP contract to spend WBTC
        await wbtcContract.approve(twapContract.address, ethers.utils.parseUnits('3', 'ether'));

        // mint TWAPUSDC to the TWAP contract
        await usdcContract.mint(twapContract.address, ethers.utils.parseUnits('50000', 'ether'));

        // Set WBTC allowance for TWAP contract
        await twapContract.swapTokens();
        await twapContract.swapTokens();
        await twapContract.swapTokens();

        const finalBalance = await twapContract.balanceOf(twapContract.address, wbtcContract.address);
        expect(finalBalance).to.equal(ethers.utils.parseUnits('3', 'ether'));
    });

});
