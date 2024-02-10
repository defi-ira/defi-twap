import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    const tokenAAddress = ""; // Set the address of tokenA
    const tokenBAddress = ""; // Set the address of tokenB
    const swapRouterAddress = ""; // Set the address of swapRouter

    const Contract = await ethers.getContractFactory("TWAP");
    const contract = await Contract.deploy(tokenAAddress, tokenBAddress, swapRouterAddress);

    console.log("TWAP Contract deployed to:", contract.address);

    // Set the contract constructor parameters
    await contract.deployed();
    await contract.setConstructorParams(deployer.address, tokenAAddress, tokenBAddress, swapRouterAddress);
    console.log("TWAP Contract constructor parameters set successfully.");

    const TimedSwapUpkeep = await ethers.getContractFactory("TimedSwapUpkeep");
    const timedSwapUpkeep = await TimedSwapUpkeep.deploy(contract.address);

    console.log("TimedSwapUpkeep Contract deployed to:", timedSwapUpkeep.address);

    // Set the deployer for TimedSwapUpkeep contract
    await timedSwapUpkeep.deployed();
    await timedSwapUpkeep.setDeployer(deployer.address);
    console.log("TimedSwapUpkeep deployer set successfully.");

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
