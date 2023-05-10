// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20Router {
  function getAmountsOut(uint256 amountIn, address[] memory path) external view returns(uint256[] memory amounts);
  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external returns (uint256[] memory amounts);
}

contract Arbitrage {
  // Any stablecoin, this asset needs to perform trades, that are independent of the native token
  IERC20 private assetToken;

  event Swaped(address[] path, uint256 amountOut);

  function topupAssetBalance(address _tokenAddress, uint256 tokenAmount) external payable {
    assetToken = IERC20(_tokenAddress);
    uint assetBalance = assetToken.balanceOf(msg.sender);
    require(assetBalance >= assetToken.allowance(msg.sender, msg.sender));
    assetToken.transferFrom(msg.sender, address(this), tokenAmount);
  }

  function balance() external view returns(uint256) {
    return address(this).balance;
  }

  function currentAssetBalance() external view returns(uint256) {
    return assetToken.balanceOf(address(this));
  }

  function reversePath(address[] memory path) private pure returns (address[] memory) {
    address[] memory reversedPath = new address[](path.length);

    for (uint i = path.length - 1; i >= 0; i--) {
      reversedPath[path.length - (i + 1)] = path[i];
    }

    return reversedPath;
  }

  function estimateDualTrade(uint256 amountIn, address[] memory path, address router1Address, address router2Address) external view returns(uint256) {
    uint256[] memory amountsOut = IERC20Router(router1Address).getAmountsOut(amountIn, path);
    uint256[] memory returnedAmountsOut = IERC20Router(router2Address).getAmountsOut(amountsOut[amountsOut.length - 1], reversePath(path));
    return returnedAmountsOut[returnedAmountsOut.length - 1];
  }

  function trade(uint256 amountIn, address[] memory path, address router1Address, address router2Address) external payable  {
    IERC20Router router1 = IERC20Router(router1Address);
    IERC20Router router2 = IERC20Router(router2Address);

    uint deadline = block.timestamp + 300; // transaction expires in 300 seconds (5 minutes)

    uint256[] memory amounts1Out = IERC20Router(router1Address).getAmountsOut(amountIn, path);
    uint256 expectedAmount1Out = amounts1Out[amounts1Out.length - 1];
    // Swap initial token for output token
    uint256[] memory swappedAmountsOut = router1.swapExactTokensForTokens(amountIn, expectedAmount1Out, path, address(this), deadline);
    uint256 swappedAmountOut = swappedAmountsOut[swappedAmountsOut.length - 1];
    emit Swaped(path, swappedAmountOut);

    address[] memory reversedPath = reversePath(path);
    uint256[] memory amounts2Out = IERC20Router(router2Address).getAmountsOut(swappedAmountOut, reversedPath);
    uint256 expectedAmount2Out = amounts2Out[amounts2Out.length - 1];
    // Swap output token for initial token back
    uint256[] memory finalAmountsOut = router2.swapExactTokensForTokens(swappedAmountOut, expectedAmount2Out, reversedPath, address(this), deadline);
    uint256 finalAmountOut = finalAmountsOut[finalAmountsOut.length - 1];
    require(finalAmountOut > swappedAmountOut, 'No profit');
    emit Swaped(reversedPath, finalAmountsOut[finalAmountsOut.length - 1]);
  }

  receive() external payable {}
}
