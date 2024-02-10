// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/automation/interfaces/KeeperCompatibleInterface.sol";

interface IDCA {
    function swapTokens() external;
}

contract TimedSwapUpkeep is KeeperCompatibleInterface {
    uint public interval;
    uint public lastTimeStamp;
    IDCA public twapContract;

    event UpkeepPerformed(uint timePerformed, uint interval);

    constructor(uint updateInterval, address _twapContractAddress) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
        twapContract = IDCA(_twapContractAddress);
    }

    function setInterval(uint updateInterval) public {
        interval = updateInterval;
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
        return (upkeepNeeded, bytes(""));
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp - lastTimeStamp) > interval ) {
            lastTimeStamp = block.timestamp;
            twapContract.swapTokens();
            emit UpkeepPerformed(block.timestamp, interval);
        }
    }
}
