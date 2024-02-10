// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals()))); // Mint 1,000,000 USDC for the deployer
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
