// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract TWAP {
    address public owner;
    address public tokenA;
    address public tokenB;
    uint24 public fee = 2500; // 25 basis points
    ISwapRouter public immutable swapRouter;

    event SwapPerformed(uint256 tokenABalance, uint256 tokenBBalance);

    constructor(address _tokenA, address _tokenB, ISwapRouter _swapRouter) {
        owner = msg.sender;
        tokenA = _tokenA;
        tokenB = _tokenB;
        swapRouter = _swapRouter;
    }

    function swapTokens(uint256 amountOutMinimum) external {
        require(msg.sender == owner, "Only the contract owner can perform swaps.");

        uint256 amountIn = IERC20(tokenA).balanceOf(address(this));
        require(amountIn > 0, "Insufficient tokenA balance");

        // Approve the router to spend tokenA.
        IERC20(tokenA).approve(address(swapRouter), amountIn);

        // Perform the swap.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenA,
            tokenOut: tokenB,
            fee: fee,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });
        swapRouter.exactInputSingle(params);

        emit SwapPerformed(IERC20(tokenA).balanceOf(address(this)), IERC20(tokenB).balanceOf(address(this)));
    }

    function depositToken(uint256 amount) external onlyOwner {
        require(amount > 0, "Deposit amount must be greater than zero.");

        IERC20(tokenA).transferFrom(msg.sender, address(this), amount);
    }

    function withdrawToken(uint256 amount) external {
        require(amount > 0, "Withdrawal amount must be greater than zero.");
        bool success = IERC20(tokenB).transfer(owner, amount);
        require(success, "Transfer failed.");
    }

    fallback() external {
        // Add logic here to handle the received Ether
    }

    receive() external payable {
        // Add logic here to handle the received Ether
    }

    function balanceOf(address account, address token) external view returns (uint256) {
        return IERC20(token).balanceOf(account);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }
}
