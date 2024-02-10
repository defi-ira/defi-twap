import { ethers } from 'hardhat';
import { expect } from 'chai';

const ARB_SEPOLIA_WBTC = '0x7f908D0faC9B8D590178bA073a053493A1D0A5d4';
const ARB_SEPOLIA_USDC = '0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1';
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

        twapContract = await TWAPContract.deploy(mockUSDC.address, mockWBTC.address, ARB_UNISWAP_ROUTER, {
            gasLimit: 3000000 // Set the gas limit to 3 million
        });
        await twapContract.deployed();

        // Fund contract with ETH
        await owner.sendTransaction({
            to: twapContract.address,
            value: ethers.utils.parseEther('1.0'),
            gasLimit: 3000000 // Set the gas limit to 3 million
        });

        // Mint USDC
        await mockUSDC.mint(owner.address, ethers.utils.parseUnits('10', 'ether'));
        
    });

    it('should allow deposit of USDC', async () => {
        // Approve TWAP contract to spend USDC
        await usdcContract.approve(twapContract.address, ethers.utils.parseUnits('2', 'ether'));
        const initialBalance = await twapContract.balanceOf(twapContract.address, usdcContract.address);
        expect(initialBalance).to.equal(0);

        await twapContract.depositToken(ethers.utils.parseUnits('2', 'ether'));
        const finalBalance = await twapContract.balanceOf(twapContract.address,  usdcContract.address);

        expect(finalBalance).to.equal(ethers.utils.parseUnits('2', 'ether'));
    });


    it('should allow withdrawal of WBTC', async () => {
        // Send WBTC to the TWAP contract
        await wbtcContract.transfer(twapContract.address, ethers.utils.parseUnits('1', 'ether'));
        const initialBalance = await twapContract.balanceOf(twapContract.address, wbtcContract.address);
        expect(initialBalance).to.equal(ethers.utils.parseUnits('1', 'ether'));

        // set allowance for TWAP contract to spend WBTC
        await twapContract.withdrawToken(ethers.utils.parseUnits('1', 'ether'));
        const finalBalance = await twapContract.balanceOf(twapContract.address, wbtcContract.address);
        expect(finalBalance).to.equal(0);
    });
});
