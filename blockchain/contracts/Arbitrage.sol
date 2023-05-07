// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
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

contract Arbitrage is Ownable {
  // Any stablecoin, this asset needs to perform trades, that are independent of the native token
  IERC20 private assetToken;

  event Swaped(uint256 amountOut, address[] path);

  function topupAssetBalance(address _tokenAddress) onlyOwner() external payable {
    assetToken = IERC20(_tokenAddress);
    uint assetBalance = assetToken.balanceOf(msg.sender);
    require(assetBalance >= assetToken.allowance(msg.sender, msg.sender));
    assetToken.transferFrom(msg.sender, address(this), msg.value);
  }

  function balance() onlyOwner() external view returns(uint256) {
    return address(this).balance;
  }

  function currentAssetBalance() onlyOwner() external view returns(uint256) {
    return assetToken.balanceOf(address(this));
  }

  function reversePath(address[] memory path) private pure returns (address[] memory) {
    address[] memory reversedPath = new address[](path.length);

    for (uint i = path.length - 1; i >= 0; i--) {
      reversedPath[path.length - (i + 1)] = path[i];
    }

    return reversedPath;
  }

  function estimateDualTrade(uint256 amountIn, address router1Address, address router2Address, address[] memory path) onlyOwner() external view returns(uint256) {
    uint256[] memory amountsOut = IERC20Router(router1Address).getAmountsOut(amountIn, path);
    uint256[] memory returnedAmountsOut = IERC20Router(router2Address).getAmountsOut(amountsOut[amountsOut.length - 1], reversePath(path));
    return returnedAmountsOut[returnedAmountsOut.length - 1];
  }

  function trade(uint256 amountIn, address router1Address, address router2Address, address[] memory path) onlyOwner() external payable  {
    IERC20Router router1 = IERC20Router(router1Address);
    IERC20Router router2 = IERC20Router(router2Address);

    uint deadline = block.timestamp + 300; // transaction expires in 300 seconds (5 minutes)

    uint256[] memory amounts1Out = IERC20Router(router1Address).getAmountsOut(amountIn, path);
    uint256 expectedAmount1Out = amounts1Out[amounts1Out.length - 1];
    // Swap initial token for output token
    uint256[] memory swappedAmounts1 = router1.swapExactTokensForTokens(amountIn, expectedAmount1Out, path, address(this), deadline);
    emit Swaped(swappedAmounts1[swappedAmounts1.length - 1], path);

    address[] memory reversedPath = reversePath(path);
    uint256[] memory amounts2Out = IERC20Router(router2Address).getAmountsOut(swappedAmounts1[swappedAmounts1.length - 1], reversedPath);
    uint256 expectedAmount2Out = amounts2Out[amounts2Out.length - 1];
    // Swap output token for initial token back
    uint256[] memory finalAmountsOut = router2.swapExactTokensForTokens(swappedAmounts1[swappedAmounts1.length - 1], expectedAmount2Out, reversedPath, address(this), deadline);
    emit Swaped(finalAmountsOut[finalAmountsOut.length - 1], reversedPath);
  }

  receive() external payable {}
}
