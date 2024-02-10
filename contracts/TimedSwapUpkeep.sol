// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/automation/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITWAP {
    function balanceOf(address account, address token) external view returns (uint256);
    function swapTokens() external;
}

contract TimedSwapUpkeep is KeeperCompatibleInterface, Ownable {
    uint public interval;
    uint public lastTimeStamp;
    address public tokenAContract;
    ITWAP public twapContract;
    address public twapContractAddress;

    event UpkeepPerformed(uint timePerformed, uint interval);

    constructor(uint updateInterval, address _twapContractAddress, address _tokenAContract) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
        tokenAContract = _tokenAContract;
        twapContract = ITWAP(_twapContractAddress);
    }

    function setInterval(uint updateInterval) public onlyOwner {
        interval = updateInterval;
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
        upkeepNeeded = upkeepNeeded || (twapContract.balanceOf(twapContractAddress, tokenAContract) > 1);
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
