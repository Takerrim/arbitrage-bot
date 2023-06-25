// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "hardhat/console.sol";

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

contract Arbitrage is Ownable {
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
    uint256[] memory returnedAmountsOut = IERC20Router(router2Address).getAmountsOut(amountsOut[amountsOut.length - 1], reversePath(path));
    return returnedAmountsOut[returnedAmountsOut.length - 1];
  }

  // function slippageTolerance(uint256 percent, uint256 amount) private pure returns(uint256) {
  //   uint256 amountByPercent = (percent * amount) / 100;
  //   return amount - amountByPercent;
  // }

  function trade(uint256 amountIn, address[] memory path, address router1Address, address router2Address) external onlyOwner payable  {
    uint deadline = block.timestamp + 300; // transaction expires in 300 seconds (5 minutes)

    uint256[] memory amounts1Out = IERC20Router(router1Address).getAmountsOut(amountIn, path);
    uint256 expectedAmount1Out = amounts1Out[amounts1Out.length - 1];

    IERC20(path[0]).approve(router1Address, amountIn);

    // Swap initial token for output token
    uint256[] memory swappedAmountsOut = IERC20Router(router1Address).swapExactTokensForTokens(amountIn, expectedAmount1Out, path, address(this), deadline);
    uint256 swappedAmountOut = swappedAmountsOut[swappedAmountsOut.length - 1];
    emit Swaped(path, swappedAmountOut);

    address[] memory reversedPath = reversePath(path);
    uint256[] memory amountsIn = IERC20Router(router2Address).getAmountsOut(swappedAmountOut, reversedPath);
    uint256 expectedAmountIn = amountsIn[0];

    IERC20(reversedPath[0]).approve(router2Address, swappedAmountOut);

    // Swap output token for initial token back
    uint256[] memory finalAmountsOut = IERC20Router(router2Address).swapExactTokensForTokens(swappedAmountOut, expectedAmountIn, reversedPath, address(this), deadline);
    uint256 finalAmountOut = finalAmountsOut[finalAmountsOut.length - 1];

    require(finalAmountOut > amountIn, 'No profit');
    emit Swaped(reversedPath, finalAmountsOut[finalAmountsOut.length - 1]);
  }

  function getAssetBalance(address _tokenAddress) external view returns(uint256) {
    return IERC20(_tokenAddress).balanceOf(address(this));
  }

  function recoverBNB() external onlyOwner payable {
    payable(msg.sender).transfer(address(this).balance);
  }

  function recoverAsset(address _tokenAddress) external onlyOwner payable {
    IERC20 token = IERC20(_tokenAddress);
    token.transfer(msg.sender, token.balanceOf(address(this)));
  }

  receive() external payable {}
}
