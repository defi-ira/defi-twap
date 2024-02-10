// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/automation/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITWAP {
    function swapTokens() external;
}

contract TimedSwapUpkeep is KeeperCompatibleInterface, Ownable {
    uint public interval;
    uint public lastTimeStamp;
    ITWAP public twapContract;

    event UpkeepPerformed(uint timePerformed, uint interval);

    constructor(uint updateInterval, address _twapContractAddress) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
        twapContract = ITWAP(_twapContractAddress);
    }

    function setInterval(uint updateInterval) public onlyOwner {
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
