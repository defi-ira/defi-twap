import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    // TWAP
    const ARB_SEPOLIA_WBTC = '0x7f908D0faC9B8D590178bA073a053493A1D0A5d4';
    const ARB_SEPOLIA_USDC = '0xf3C3351D6Bd0098EEb33ca8f830FAf2a141Ea2E1';
    const ARB_UNISWAP_ROUTER = '0x101F443B4d1b059569D643917553c771E1b9663E';

    const Contract = await ethers.getContractFactory("TWAP");
    const contract = await Contract.deploy(ARB_SEPOLIA_USDC, ARB_SEPOLIA_WBTC, ARB_UNISWAP_ROUTER);

    await contract.deployed();

    console.log("TWAP Contract deployed to:", contract.address);


    // TimedSwapUpkeep
    const TimedSwapUpkeep = await ethers.getContractFactory("TimedSwapUpkeep");
    const timedSwapUpkeep = await TimedSwapUpkeep.deploy(180, contract.address); // 180 seconds

    await timedSwapUpkeep.deployed();
    console.log("TimedSwapUpkeep Contract deployed to:", timedSwapUpkeep.address);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
