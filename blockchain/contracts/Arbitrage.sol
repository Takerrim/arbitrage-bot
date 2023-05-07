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
  IERC20Router private router1;
  IERC20Router private router2;
  // Any stablecoin, this asset needs to perform trades, that are indepent of the native token
  IERC20 private assetToken;

  constructor(address _router1Address, address _router2Address) {
    setRouters(_router1Address, _router2Address);
  }

  function setRouters(address _router1Address, address _router2Address) onlyOwner() public {
    router1 = IERC20Router(_router1Address);
    router2 = IERC20Router(_router2Address);
  }

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

  function estimateDualTrade(uint256 amountIn, address[] memory path) onlyOwner() private view returns(uint256) {
    uint256[] memory amountsOut = router1.getAmountsOut(amountIn, path);

    address[] memory reversedPath = new address[](path.length);

    for (uint i = path.length - 1; i >= 0; i--) {
      reversedPath[path.length - (i + 1)] = path[i];
    }

    uint256[] memory returnedAmountsOut = router2.getAmountsOut(amountsOut[amountsOut.length - 1], reversedPath);
    return returnedAmountsOut[returnedAmountsOut.length - 1];
  }

  function trade(address[] memory path) onlyOwner() external payable  {
  }

  receive() external payable {}
}
