pragma solidity ^0.5.0;

import "./BizoftToken.sol";

contract BizoftTokenSale{
    address payable admin;
    BizoftToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(
        address _buyer,
        uint256 _amount,
        uint256 _value
    );

    constructor(BizoftToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function buyTokens(uint256 _numberOfToken) public payable{
        require(mul(_numberOfToken, tokenPrice) == msg.value, "Value is not valid");

        require(tokenContract.balanceOf(address(this)) >= _numberOfToken, "Number of token exceed balance");

        require(tokenContract.transfer(msg.sender, _numberOfToken), "Error when transfer token process");

        tokenSold += _numberOfToken;
        
        emit Sell(msg.sender, _numberOfToken, msg.value);
    }

    function endSale() public {
        require(msg.sender == admin, "Unauthorized call");
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))),
            "Cannot transfer back remainngBalance");

        selfdestruct(admin);
    }
}