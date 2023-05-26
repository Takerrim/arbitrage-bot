// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

interface IERC20Router {
  function getAmountsOut(uint256 amountIn, address[] memory path) external view returns(uint256[] memory amounts);
  function getAmountsIn(uint256 amountOut, address[] memory path) external view returns(uint256[] memory amounts);
  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external returns (uint256[] memory amounts);
}

contract Arbitrage {
  event Swaped(address[] path, uint256 amountOut);

  function reversePath(address[] memory path) private pure returns (address[] memory) {
    address[] memory reversedPath = new address[](path.length);
    uint idx = 0;

    for (uint i = path.length; i > 0; i--) {
      reversedPath[idx] = path[i - 1];
      idx++;
    }

    return reversedPath;
  }

  function estimateDualTrade(uint256 amountIn, address[] memory path, address router1Address, address router2Address) external view returns(uint256) {
    uint256[] memory amountsOut = IERC20Router(router1Address).getAmountsOut(amountIn, path);
    uint256[] memory returnedAmountsOut = IERC20Router(router2Address).getAmountsIn(amountsOut[amountsOut.length - 1], path);
    return returnedAmountsOut[0];
  }

  function trade(uint256 amountIn, address[] memory path, address router1Address, address router2Address) external payable  {
    IERC20Router router1 = IERC20Router(router1Address);
    IERC20Router router2 = IERC20Router(router2Address);

    uint deadline = block.timestamp + 300; // transaction expires in 300 seconds (5 minutes)

    uint256[] memory amounts1Out = IERC20Router(router1Address).getAmountsOut(amountIn, path);
    uint256 expectedAmount1Out = amounts1Out[amounts1Out.length - 1];

    IERC20 inputToken = IERC20(path[0]);
    // If allowance of input token less than amountIn, add allowance to router1
    if (inputToken.allowance(msg.sender, router1Address) < amountIn) {
      // delegatecall does not suit because it changes state of caller contract not target
      // (bool success,) = path[0].delegatecall(abi.encodeWithSignature("approve(address, uint256)", router1Address, amountIn));
      bool success = inputToken.approve(router1Address, amountIn);
      console.log(success);
    }
    console.log(inputToken.allowance(msg.sender, router1Address));
    // Swap initial token for output token
    uint256[] memory swappedAmountsOut = router1.swapExactTokensForTokens(amountIn, expectedAmount1Out, path, msg.sender, deadline);
    uint256 swappedAmountOut = swappedAmountsOut[swappedAmountsOut.length - 1];
    emit Swaped(path, swappedAmountOut);

    address[] memory reversedPath = reversePath(path);
    uint256[] memory amountsIn = IERC20Router(router2Address).getAmountsIn(swappedAmountOut, path);
    uint256 expectedAmountIn = amountsIn[0];

    // If allowance of output token less than swappedAmountOut, add allowance to router2
    if (IERC20(reversedPath[0]).allowance(msg.sender, router2Address) < swappedAmountOut) {
      IERC20(reversedPath[0]).approve(router2Address, swappedAmountOut);
    }

    // Swap output token for initial token back
    uint256[] memory finalAmountsOut = router2.swapExactTokensForTokens(swappedAmountOut, expectedAmountIn, reversedPath, msg.sender, deadline);
    uint256 finalAmountOut = finalAmountsOut[finalAmountsOut.length - 1];
    require(finalAmountOut > swappedAmountOut, 'No profit');
    emit Swaped(reversedPath, finalAmountsOut[finalAmountsOut.length - 1]);
  }

  receive() external payable {}
}
