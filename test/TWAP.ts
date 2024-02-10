import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('TWAP Contract', () => {
    let twapContract: any;
    let owner: any;
    let user: any;

    beforeEach(async () => {
        const TWAPContract = await ethers.getContractFactory('TWAP');
        [owner, user] = await ethers.getSigners();

        twapContract = await TWAPContract.deploy();
        await twapContract.deployed();

        // Deposit ETH and WBTC
        await twapContract.deposit({ value: ethers.utils.parseEther('1') });
        await twapContract.depositToken(ethers.utils.parseUnits('10', 'ether'));
    });

    it('should allow withdrawal of WBTC', async () => {
        const initialBalance = await twapContract.balanceOf(user.address, 'WBTC');
        await twapContract.withdrawToken(ethers.utils.parseUnits('5', 'ether'), 'WBTC');
        const finalBalance = await twapContract.balanceOf(user.address, 'WBTC');

        expect(finalBalance).to.equal(initialBalance.sub(ethers.utils.parseUnits('5', 'ether')));
    });

    it('should allow withdrawal of USDC', async () => {
        const initialBalance = await twapContract.balanceOf(user.address, 'USDC');
        await twapContract.withdrawToken(ethers.utils.parseUnits('100', 'ether'), 'USDC');
        const finalBalance = await twapContract.balanceOf(user.address, 'USDC');

        expect(finalBalance).to.equal(initialBalance.sub(ethers.utils.parseUnits('100', 'ether')));
    });

    it('should swap tokens using Uniswap', async () => {
        // Mock the call made to the Uniswap router
        const uniswapRouterMock = await ethers.getContractFactory('UniswapRouterMock');
        const uniswapRouter = await uniswapRouterMock.deploy();
        await uniswapRouter.deployed();

        // Set the mock trade result
        const tradeAmountIn = ethers.utils.parseUnits('1', 'ether');
        const tradeAmountOut = ethers.utils.parseUnits('100', 'ether');
        await uniswapRouter.setTradeResult(tradeAmountIn, tradeAmountOut);

        // Swap tokens
        await twapContract.swapTokens('WBTC', 'USDC', tradeAmountIn, uniswapRouter.address);

        // Check the token balances after the swap
        const wbtcBalance = await twapContract.balanceOf(user.address, 'WBTC');
        const usdcBalance = await twapContract.balanceOf(user.address, 'USDC');

        expect(wbtcBalance).to.equal(ethers.utils.parseUnits('9', 'ether'));
        expect(usdcBalance).to.equal(ethers.utils.parseUnits('100', 'ether'));
    });
});
