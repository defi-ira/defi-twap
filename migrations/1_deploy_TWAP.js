const TWAP = artifacts.require("TWAP");
const TimedSwapUpkeep = artifacts.require("TimedSwapUpkeep");
const TWAPUSDC = artifacts.require("TWAPUSDC");
const TWAPWBTC = artifacts.require("TWAPWBTC");


module.exports = async function (deployer, network, accounts) {
    const ARB_UNISWAP_ROUTER = "0x101F443B4d1b059569D643917553c771E1b9663E";
    const TRADE_BLOCK_SIZE = 100; // 100 USDC
    const UPKEEP_INTERVAL = 600; // 10 mins - min upkeep

    await deployer.deploy(TWAPUSDC, {gas: 5000000});
    const twapUSDC = await TWAPUSDC.deployed();
    console.log("TWAPUSDC Contract deployed to:", twapUSDC.address);

    await deployer.deploy(TWAPWBTC, {gas: 5000000});
    const twapWBTC = await TWAPWBTC.deployed();
    console.log("TWAPWBTC Contract deployed to:", twapWBTC.address);

    await deployer.deploy(TWAP, TWAPUSDC.address, TWAPWBTC.address, ARB_UNISWAP_ROUTER, TRADE_BLOCK_SIZE, {gas: 5000000});
    const twap = await TWAP.deployed();
    console.log("TWAP Contract deployed to:", twap.address);

    await deployer.deploy(TimedSwapUpkeep, UPKEEP_INTERVAL, twap.address, ARB_SEPOLIA_USDC, {gas: 5000000});
    const timedSwapUpkeep = await TimedSwapUpkeep.deployed();
    console.log("TimedSwapUpkeep Contract deployed to:", timedSwapUpkeep.address);

    // approve 1M TWAPWBTC to TWAP contract
    await twapWBTC.approve(twap.address, web3.utils.toWei("1000000", "ether"));

    // approve 1M TWAP TWAPWBTC to owner
    await twapWBTC.approve(accounts[0], web3.utils.toWei("1000000", "ether"));

};
